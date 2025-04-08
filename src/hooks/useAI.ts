import { useState, useCallback, useRef } from 'react';
import { Card, DuplicateCheck } from '../types';
import { useNetwork } from '../context/NetworkContext';
import aiService from '../services/ai'; // Import the AI service

export const useAI = () => {
  const { state: networkState } = useNetwork();
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef<boolean>(false); // Ref to track loading state
  const [error, setError] = useState<Error | null>(null);

  const updateLoading = (value: boolean) => {
    loadingRef.current = value; // Update the ref
    setLoading(value); // Update the state
  };

  // Check for duplicate cards
  const checkDuplicates = useCallback(async (
    newCard: Partial<Card>, 
    existingCards: Card[]
  ): Promise<DuplicateCheck> => {
    updateLoading(true); // Use the new updateLoading function
    setError(null);

    try {
      const payload = {
        newCard,
        existingCards: existingCards.map(card => ({ ...card }))
      };
      const result = await aiService.checkForDuplicates(payload.newCard, payload.existingCards); // Use the AI service
      return result;
    } catch (error) {
      setError(error as Error);
      return { duplicates: [] };
    } finally {
      updateLoading(false); // Ensure loading is stopped
    }
  }, []);

  // Generate clusters from cards
  const analyzeClusters = useCallback(async (cards: Card[]) => {
    updateLoading(true); // Use the new updateLoading function
    setError(null);

    try {
      const clusters = await aiService.generateClusters(cards); // Use the AI service
      return clusters;
    } catch (error) {
      setError(error as Error);
      return [];
    } finally {
      updateLoading(false); // Ensure loading is stopped
    }
  }, []);

  return {
    loading: loadingRef.current, // Use the ref value for consistent state
    error,
    checkDuplicates,
    analyzeClusters
  };
};

export default useAI;