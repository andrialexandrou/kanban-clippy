import { useState, useCallback } from 'react';
import { Card, Column, Label, Cluster } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock storage for our demo since we're not actually connecting to Firebase
const mockStorage: {
  cards: Record<string, Card>;
  columns: Record<string, Column>;
  labels: Record<string, Label>;
  clusters: Record<string, Cluster>;
} = {
  cards: {},
  columns: {},
  labels: {},
  clusters: {}
};

export const useFirestore = (boardId: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Card operations
  const addCard = useCallback(async (card: Omit<Card, 'id'>): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate a new ID
      const cardId = uuidv4();
      
      // Save to our mock storage
      mockStorage.cards[cardId] = { 
        ...card, 
        id: cardId 
      } as Card;
      
      setLoading(false);
      return cardId;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      throw error;
    }
  }, []);
  
  const updateCard = useCallback(async (cardId: string, updates: Partial<Card>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if the card exists
      if (!mockStorage.cards[cardId]) {
        throw new Error('Card not found');
      }
      
      // Update the card
      mockStorage.cards[cardId] = {
        ...mockStorage.cards[cardId],
        ...updates,
        updatedAt: Date.now()
      };
      
      setLoading(false);
      return true;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      return false;
    }
  }, []);
  
  const deleteCard = useCallback(async (cardId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if the card exists
      if (!mockStorage.cards[cardId]) {
        throw new Error('Card not found');
      }
      
      // Delete the card
      delete mockStorage.cards[cardId];
      
      setLoading(false);
      return true;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      return false;
    }
  }, []);
  
  // Column operations
  const addColumn = useCallback(async (column: Omit<Column, 'id'>): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate a new ID
      const columnId = uuidv4();
      
      // Save to our mock storage
      mockStorage.columns[columnId] = { 
        ...column, 
        id: columnId 
      };
      
      setLoading(false);
      return columnId;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      throw error;
    }
  }, []);
  
  const updateColumn = useCallback(async (columnId: string, updates: Partial<Column>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if the column exists
      if (!mockStorage.columns[columnId]) {
        throw new Error('Column not found');
      }
      
      // Delete the column
      delete mockStorage.columns[columnId];
      
      setLoading(false);
      return true;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      return false;
    }
  }, []);
  
  // Label operations
  const addLabel = useCallback(async (label: Omit<Label, 'id'>): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate a new ID
      const labelId = uuidv4();
      
      // Save to our mock storage
      mockStorage.labels[labelId] = { 
        ...label, 
        id: labelId 
      };
      
      setLoading(false);
      return labelId;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      throw error;
    }
  }, []);
  
  // Cluster operations
  const fetchClusters = useCallback(async (): Promise<Cluster[]> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return clusters from mock storage
      const clusters = Object.values(mockStorage.clusters);
      
      setLoading(false);
      return clusters;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      return [];
    }
  }, []);
  
  const createClusters = useCallback(async (cards: Card[]): Promise<Cluster[]> => {
    setLoading(true);
    setError(null);
    try {
      // Call backend API to generate clusters
      const response = await fetch('/api/openai/generate-clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate clusters');
      }

      const clustersToSave: Cluster[] = await response.json();

      // Save clusters to our mock storage
      clustersToSave.forEach(cluster => {
        mockStorage.clusters[cluster.id] = cluster;
      });

      setLoading(false);
      return clustersToSave;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      console.error("Error generating clusters:", error);
      return [];
    }
  }, []);
  
  return {
    loading,
    error,
    addCard,
    updateCard,
    deleteCard,
    addColumn,
    updateColumn,
    addLabel,
    fetchClusters,
    createClusters
  };
};

export default useFirestore;