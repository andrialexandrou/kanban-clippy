import { Card, DuplicateCheck, Cluster } from '../types';

console.log('~~ai.ts~~ ai.ts loaded');

// Define the backend base URL
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3100';

// Check for duplicate cards using backend API
export const checkForDuplicates = async (
  newCard: Partial<Card>, 
  existingCards: Card[]
): Promise<DuplicateCheck> => {
  console.log("~~ai.ts~~ Checking for duplicates:", newCard);
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/openai/check-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newCard, existingCards }),
    });

    if (!response.ok) {
      throw new Error('Failed to check duplicates');
    }

    return await response.json();
  } catch (error) {
    console.log("~~ai.ts~~ Error checking for duplicates:", error);
    return { isDuplicate: false, duplicateCards: [], similarity: 0 };
  }
};

// Generate clusters from cards using backend API
export const generateClusters = async (cards: Card[]): Promise<Cluster[]> => {
  console.log("~~ai.ts~~ Generating clusters:");
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
    console.log("~~ai.ts~~ Error generating clusters:", error);
    return [];
  }
};

export default {
  checkForDuplicates,
  generateClusters,
};