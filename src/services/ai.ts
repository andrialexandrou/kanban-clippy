import { Card, DuplicateCheck, Cluster, ClusterAnalysis } from '../types';

// Define the backend base URL
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3100';

// Check for duplicate cards using backend API
export const checkForDuplicates = async (
  newCard: Partial<Card>, 
  existingCards: Card[]
): Promise<DuplicateCheck> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/openai/check-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newCard, existingCards, cardIds: existingCards.map(card => card.id) }),
    });

    if (!response.ok) {
      throw new Error('Failed to check duplicates');
    }

    return await response.json();
  } catch (error) {
    return { duplicates: [] };
  }
};

// Generate clusters from cards using backend API
export const generateClusters = async (cards: Card[]): Promise<ClusterAnalysis> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/openai/generate-clusters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate clusters');
    }

    return await response.json();
  } catch (error) {
    return { clusters: [] };
  }
};

export default {
  checkForDuplicates,
  generateClusters,
};