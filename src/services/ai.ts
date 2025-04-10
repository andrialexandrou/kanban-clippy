import { Card, DuplicateCheck, Cluster, ClusterAnalysis } from '../types';

// Define the backend base URL
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3100';

// Maximum number of cards to send in a single request
const MAX_BATCH_SIZE = 50;

// App name for localStorage keys
const APP_NAME = 'kanban-clippy';

// Internal in-memory cache to prevent duplicate network requests
const requestCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 14 * 24 * 60 * 60 * 1000; // 2 weeks cache TTL

// localStorage cache keys
const CLUSTERS_CACHE_KEY = `${APP_NAME}-clusters`;

/**
 * Splits an array into chunks of specified size
 * @param array The array to split
 * @param chunkSize Maximum size of each chunk
 * @returns Array of chunks
 */
const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  return Array.from(
    { length: Math.ceil(array.length / chunkSize) },
    (_, i) => array.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};

/**
 * Generate a cache key for a request based on input data
 */
const generateCacheKey = (endpoint: string, data: any): string => {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return `${endpoint}:${sortedData}`;
};

/**
 * Generate a consistent localStorage key for clusters based on card signature
 */
const generateLocalStorageKey = (cardsSignature: string): string => {
  return `${CLUSTERS_CACHE_KEY}`; // Simplified key without card IDs
};

/**
 * Check if cache entry is still valid
 */
const isCacheValid = (cacheEntry: { data: any, timestamp: number }): boolean => {
  return Date.now() - cacheEntry.timestamp < CACHE_TTL;
};

/**
 * Save clusters to localStorage
 */
const saveClustersToLocalStorage = (cardsSignature: string, data: ClusterAnalysis): void => {
  try {
    const storageData = {
      data,
      timestamp: Date.now()
    };
    const key = generateLocalStorageKey(cardsSignature);
    localStorage.setItem(key, JSON.stringify(storageData));
  } catch (error) {
    console.error('Error saving clusters to localStorage:', error);
  }
};

/**
 * Get clusters from localStorage
 */
const getClustersFromLocalStorage = (cardsSignature: string): ClusterAnalysis | null => {
  try {
    const key = generateLocalStorageKey(cardsSignature);
    const storedData = localStorage.getItem(key);
    if (!storedData) return null;
    
    const parsedData = JSON.parse(storedData);
    
    // Check if cache is still valid (5 min TTL)
    if (Date.now() - parsedData.timestamp < CACHE_TTL) {
      return parsedData.data;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving clusters from localStorage:', error);
    return null;
  }
};

// Check for duplicate cards using backend API
export const checkForDuplicates = async (
  newCard: Partial<Card>, 
  existingCards: Card[]
): Promise<DuplicateCheck> => {
  try {
    // If the existing cards array is too large, process only a subset of the most recent cards
    const cardsToCheck = existingCards.length > MAX_BATCH_SIZE 
      ? existingCards.slice(-MAX_BATCH_SIZE) 
      : existingCards;
    
    const requestData = { 
      newCard, 
      existingCards: cardsToCheck, 
      cardIds: cardsToCheck.map(card => card.id) 
    };
    
    const cacheKey = generateCacheKey('check-duplicates', requestData);
    
    // Check in-memory cache first
    const cachedResult = requestCache.get(cacheKey);
    if (cachedResult && isCacheValid(cachedResult)) {
      return cachedResult.data;
    }
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/openai/check-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error('Failed to check duplicates');
    }

    const result = await response.json();
    
    // Store in cache
    requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return { duplicates: [] };
  }
};

// Generate clusters from cards using backend API
export const generateClusters = async (cards: Card[], forceRefresh = false): Promise<ClusterAnalysis> => {
  try {
    // Create a unique key based on the cards to identify this request
    const cardsSignature = cards.map(c => c.id).sort().join(',');
    const cacheKey = generateCacheKey('generate-clusters', { cardsSignature });
    
    // Check in-memory cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedResult = requestCache.get(cacheKey);
      if (cachedResult && isCacheValid(cachedResult)) {
        return cachedResult.data;
      }
      
      // Check localStorage cache
      const localStorageResult = getClustersFromLocalStorage(cardsSignature);
      if (localStorageResult) {
        // Update in-memory cache too
        requestCache.set(cacheKey, { data: localStorageResult, timestamp: Date.now() });
        return localStorageResult;
      }
    }
    
    // If the cards array is too large, process in batches
    if (cards.length > MAX_BATCH_SIZE) {
      const batches = chunkArray(cards, MAX_BATCH_SIZE);
      let accumulatedClusters: Cluster[] = [];
      
      // Process each batch sequentially, with knowledge of previous clusters
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const existingClusterNames = accumulatedClusters.map(c => c.clusterName || c.title);
        
        const response = await fetch(`${BACKEND_BASE_URL}/api/openai/generate-clusters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cards: batch,
            existingClusters: existingClusterNames, // Pass existing cluster names to backend
            batchInfo: {
              current: i + 1,
              total: batches.length
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate clusters for batch');
        }

        const result = await response.json();
        
        // Add new clusters to our accumulated list
        if (result.clusters && Array.isArray(result.clusters)) {
          // For the first batch, just add all clusters
          if (i === 0) {
            accumulatedClusters = [...result.clusters];
          } else {
            // For subsequent batches, try to merge with existing clusters
            for (const newCluster of result.clusters) {
              // Try to find an existing similar cluster
              const existingClusterIndex = accumulatedClusters.findIndex(
                c => (c.clusterName && c.clusterName.toLowerCase() === newCluster.clusterName.toLowerCase()) ||
                     (c.title && c.title.toLowerCase() === newCluster.clusterName.toLowerCase())
              );
              
              if (existingClusterIndex >= 0) {
                // Merge with existing cluster
                const existingCluster = accumulatedClusters[existingClusterIndex];
                const mergedCards = [...existingCluster.cards, ...newCluster.cards];
                
                // Remove duplicates by card ID
                const uniqueCards = mergedCards.filter((card, index, self) => 
                  index === self.findIndex(c => c.id === card.id)
                );
                
                accumulatedClusters[existingClusterIndex].cards = uniqueCards;
              } else {
                // Add as a new cluster
                accumulatedClusters.push(newCluster);
              }
            }
          }
        }
      }
      
      // Process the accumulated clusters to ensure consistency
      const finalClusters = accumulatedClusters.map(cluster => ({
        ...cluster,
        id: cluster.clusterName, // Ensure ID is based on cluster name
        title: cluster.clusterName, // Make sure title matches
        description: `Cluster of cards related to ${cluster.clusterName}`,
        cardIds: cluster.cards.map(card => card.id).filter((id): id is string => id !== undefined),
        createdAt: Date.now()
      }));
      
      // Merge and store all clusters in cache
      const result = { clusters: finalClusters };
      requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
      saveClustersToLocalStorage(cardsSignature, result);
      return result;
    } else {
      // For small datasets, process as before
      const response = await fetch(`${BACKEND_BASE_URL}/api/openai/generate-clusters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate clusters');
      }

      const result = await response.json();
      requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
      saveClustersToLocalStorage(cardsSignature, result);
      return result;
    }
  } catch (error) {
    console.error('Error generating clusters:', error);
    return { clusters: [] };
  }
};

/**
 * Get clusters from localStorage - exported for direct component access
 */
export const getCachedClusters = (cardsSignature: string): ClusterAnalysis | null => {
  return getClustersFromLocalStorage(cardsSignature);
};

/**
 * Clear all cached requests
 */
export const clearCache = (): void => {
  requestCache.clear();
  
  // Clear all localStorage items that start with our app prefix
  Object.keys(localStorage)
    .filter(key => key.startsWith(APP_NAME))
    .forEach(key => localStorage.removeItem(key));
};

export default {
  checkForDuplicates,
  generateClusters,
  clearCache,
  getCachedClusters,
};