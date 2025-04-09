import { Card, DuplicateCheck, Cluster, ClusterAnalysis } from '../types';

// Define the backend base URL
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3100';

// Maximum number of cards to send in a single request
const MAX_BATCH_SIZE = 50;

// Internal in-memory cache to prevent duplicate network requests
const requestCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

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
 * Check if cache entry is still valid
 */
const isCacheValid = (cacheEntry: { data: any, timestamp: number }): boolean => {
  return Date.now() - cacheEntry.timestamp < CACHE_TTL;
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
    }
    
    // If the cards array is too large, process in batches
    if (cards.length > MAX_BATCH_SIZE) {
      const batches = chunkArray(cards, MAX_BATCH_SIZE);
      let allClusters: Cluster[] = [];
      
      // Process each batch sequentially
      for (const batch of batches) {
        const response = await fetch(`${BACKEND_BASE_URL}/api/openai/generate-clusters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cards: batch }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate clusters for batch');
        }

        const result = await response.json();
        allClusters = [...allClusters, ...result.clusters];
      }
      
      // Merge and store all clusters in cache
      const result = { clusters: allClusters };
      requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
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
      return result;
    }
  } catch (error) {
    console.error('Error generating clusters:', error);
    return { clusters: [] };
  }
};

/**
 * Clear all cached requests
 */
export const clearCache = (): void => {
  requestCache.clear();
};

export default {
  checkForDuplicates,
  generateClusters,
  clearCache,
};