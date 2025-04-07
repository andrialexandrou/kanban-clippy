import { useState, useCallback } from 'react';
import { Card, DuplicateCheck } from '../types';
import { useNetwork } from '../context/NetworkContext';

// Mock implementations in place of actual AI service
const mockCheckForDuplicates = async (
  newCard: Partial<Card>, 
  existingCards: Card[]
): Promise<DuplicateCheck> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
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
};

const mockGenerateClusters = async (cards: Card[]) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple mock implementation - group cards by the first word of their title
  const clusters = cards.reduce((acc, card) => {
    if (!card.title) return acc;
    
    const firstWord = card.title.split(' ')[0].toLowerCase();
    
    // Find existing cluster or create new one
    const existingCluster = acc.find(c => c.title.toLowerCase().includes(firstWord));
    
    if (existingCluster) {
      existingCluster.cardIds.push(card.id);
    } else {
      acc.push({
        id: `cluster-${acc.length + 1}`,
        title: `${firstWord.charAt(0).toUpperCase() + firstWord.slice(1)} related cards`,
        description: `Cards that are related to ${firstWord}`,
        cardIds: [card.id],
        createdAt: Date.now()
      });
    }
    
    return acc;
  }, [] as any[]);
  
  return clusters;
};

export const useAI = () => {
  const { state: networkState } = useNetwork();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Check for duplicate cards
  const checkDuplicates = useCallback(async (
    newCard: Partial<Card>, 
    existingCards: Card[]
  ): Promise<DuplicateCheck> => {
    // If LLM is not connected, return no duplicates
    if (!networkState.llmConnected) {
      return { isDuplicate: false, duplicateCards: [], similarity: 0 };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await mockCheckForDuplicates(newCard, existingCards);
      setLoading(false);
      return result;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      return { isDuplicate: false, duplicateCards: [], similarity: 0 };
    }
  }, [networkState.llmConnected]);
  
  // Generate clusters from cards
  const analyzeClusters = useCallback(async (cards: Card[]) => {
    // If LLM is not connected, return empty results
    if (!networkState.llmConnected) {
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const clusters = await mockGenerateClusters(cards);
      setLoading(false);
      return clusters;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      return [];
    }
  }, [networkState.llmConnected]);
  
  return {
    loading,
    error,
    isLLMConnected: networkState.llmConnected,
    checkDuplicates,
    analyzeClusters
  };
};

export default useAI;