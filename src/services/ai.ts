import { Card, DuplicateCheck, Cluster, ClusterAnalysis } from '../types';

// Define the backend base URL
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3100';

// Maximum number of cards to send in a single request
const MAX_BATCH_SIZE = 50;

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
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/openai/check-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        newCard, 
        existingCards: cardsToCheck, 
        cardIds: cardsToCheck.map(card => card.id) 
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to check duplicates');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return { duplicates: [] };
  }
};

// Generate clusters from cards using backend API
export const generateClusters = async (cards: Card[]): Promise<ClusterAnalysis> => {
  try {
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
      
      // Merge and return all clusters
      return { clusters: allClusters };
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

      return await response.json();
    }
  } catch (error) {
    console.error('Error generating clusters:', error);
    return { clusters: [] };
  }
};

export default {
  checkForDuplicates,
  generateClusters,
};