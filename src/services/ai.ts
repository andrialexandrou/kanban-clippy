import { Card, DuplicateCheck, ClusterAnalysis, Cluster } from '../types';

// Mock check for duplicate cards
export const checkForDuplicates = async (
  newCard: Partial<Card>, 
  existingCards: Card[]
): Promise<DuplicateCheck> => {
  try {
    // If there are no existing cards, no duplicates
    if (existingCards.length === 0) {
      return { isDuplicate: false, duplicateCards: [], similarity: 0 };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple mock implementation: consider a card duplicate if titles are similar
    const duplicates = existingCards.filter(card => {
      if (!newCard.title || !card.title) return false;
      
      // Very simplistic check - in a real implementation, this would use actual NLP
      const similarity = card.title.toLowerCase().includes(newCard.title.toLowerCase()) ||
                       newCard.title.toLowerCase().includes(card.title.toLowerCase());
      
      return similarity;
    });
    
    const isDuplicate = duplicates.length > 0;
    const similarity = isDuplicate ? 0.8 : 0;
    
    return {
      isDuplicate,
      duplicateCards: duplicates,
      similarity
    };
  } catch (error) {
    console.error("Error checking for duplicates:", error);
    return { isDuplicate: false, duplicateCards: [], similarity: 0 };
  }
};

// Generate clusters from cards
export const generateClusters = async (cards: Card[]): Promise<Cluster[]> => {
  try {
    // If there are not enough cards, don't generate clusters
    if (cards.length < 3) {
      return [];
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple mock implementation - group cards by the first word of their title
    const groups: Record<string, Card[]> = {};
    
    // Group cards by first word
    cards.forEach(card => {
      if (!card.title) return;
      
      const firstWord = card.title.split(' ')[0].toLowerCase();
      
      if (!groups[firstWord]) {
        groups[firstWord] = [];
      }
      
      groups[firstWord].push(card);
    });
    
    // Convert groups to clusters
    const clusters: Cluster[] = Object.entries(groups)
      .filter(([_, cards]) => cards.length > 1) // Only include groups with at least 2 cards
      .map(([keyword, groupCards], index) => ({
        id: `cluster-${index}`,
        title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} related cards`,
        description: `Cards that are related to the keyword "${keyword}"`,
        cardIds: groupCards.map(card => card.id),
        createdAt: Date.now()
      }));
    
    return clusters;
  } catch (error) {
    console.error("Error generating clusters:", error);
    return [];
  }
};

// Check LLM connection status
export const checkLLMConnection = async (): Promise<boolean> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Random connection status - 80% chance of being connected
    return Math.random() > 0.2;
  } catch (error) {
    console.error("LLM connection error:", error);
    return false;
  }
};

export default {
  checkForDuplicates,
  generateClusters,
  checkLLMConnection
};