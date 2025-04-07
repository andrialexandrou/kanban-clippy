import { Board, Card, Column, Label, User, Cluster } from '../types';
import { generateMockData } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';

// Mock storage for our demo since we're not actually connecting to Firebase
const mockStorage: {
  boards: Record<string, Board>;
  cards: Record<string, Record<string, Card>>;
  columns: Record<string, Record<string, Column>>;
  labels: Record<string, Record<string, Label>>;
  clusters: Record<string, Record<string, Cluster>>;
} = {
  boards: {},
  cards: {},
  columns: {},
  labels: {},
  clusters: {}
};

// Initialize with mock data
const initMockData = () => {
  const mockBoard = generateMockData();
  mockStorage.boards[mockBoard.id] = mockBoard;
  
  // Setup storage for board items
  mockStorage.cards[mockBoard.id] = {};
  mockStorage.columns[mockBoard.id] = {};
  mockStorage.labels[mockBoard.id] = {};
  mockStorage.clusters[mockBoard.id] = {};
  
  // Populate card storage
  mockBoard.cards.forEach(card => {
    mockStorage.cards[mockBoard.id][card.id] = card;
  });
  
  // Populate column storage
  mockBoard.columns.forEach(column => {
    mockStorage.columns[mockBoard.id][column.id] = column;
  });
  
  // Populate label storage
  mockBoard.labels.forEach(label => {
    mockStorage.labels[mockBoard.id][label.id] = label;
  });
};

// Initialize mock data
initMockData();

// Board operations
export const getBoard = async (boardId: string): Promise<Board | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockStorage.boards[boardId] || null;
  } catch (error) {
    console.error("Error getting board:", error);
    return null;
  }
};

// Subscribe to board data (mocked)
export const subscribeToBoardChanges = (
  boardId: string, 
  onUpdate: (board: Board) => void
) => {
  // Immediately call with current data
  if (mockStorage.boards[boardId]) {
    onUpdate(mockStorage.boards[boardId]);
  }
  
  // No real subscription in our mock
  return () => {};
};

// Card operations
export const addCard = async (boardId: string, card: Omit<Card, 'id'>): Promise<string> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a new ID
    const cardId = uuidv4();
    
    // Create the card
    const newCard: Card = {
      ...card,
      id: cardId
    };
    
    // Add to mock storage
    if (!mockStorage.cards[boardId]) {
      mockStorage.cards[boardId] = {};
    }
    mockStorage.cards[boardId][cardId] = newCard;
    
    // Update the board
    if (mockStorage.boards[boardId]) {
      mockStorage.boards[boardId].cards.push(newCard);
      
      // Update column item count
      const column = mockStorage.boards[boardId].columns.find(c => c.id === card.columnId);
      if (column) {
        column.itemCount += 1;
      }
    }
    
    return cardId;
  } catch (error) {
    console.error("Error adding card:", error);
    throw error;
  }
};

export const updateCard = async (boardId: string, cardId: string, updates: Partial<Card>): Promise<void> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if card exists
    if (!mockStorage.cards[boardId]?.[cardId]) {
      throw new Error(`Card ${cardId} not found`);
    }
    
    // Update the card
    const updatedCard = {
      ...mockStorage.cards[boardId][cardId],
      ...updates,
      updatedAt: Date.now()
    };
    
    mockStorage.cards[boardId][cardId] = updatedCard;
    
    // Update in board
    if (mockStorage.boards[boardId]) {
      const cardIndex = mockStorage.boards[boardId].cards.findIndex(c => c.id === cardId);
      if (cardIndex !== -1) {
        mockStorage.boards[boardId].cards[cardIndex] = updatedCard;
      }
      
      // Update column item counts if the column changed
      if (updates.columnId && updates.columnId !== mockStorage.cards[boardId][cardId].columnId) {
        // Decrement old column count
        const oldColumn = mockStorage.boards[boardId].columns.find(
          c => c.id === mockStorage.cards[boardId][cardId].columnId
        );
        if (oldColumn) {
          oldColumn.itemCount = Math.max(0, oldColumn.itemCount - 1);
        }
        
        // Increment new column count
        const newColumn = mockStorage.boards[boardId].columns.find(
          c => c.id === updates.columnId
        );
        if (newColumn) {
          newColumn.itemCount += 1;
        }
      }
    }
  } catch (error) {
    console.error("Error updating card:", error);
    throw error;
  }
};

export const deleteCard = async (boardId: string, cardId: string): Promise<void> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if card exists
    if (!mockStorage.cards[boardId]?.[cardId]) {
      throw new Error(`Card ${cardId} not found`);
    }
    
    // Get column ID before deletion
    const columnId = mockStorage.cards[boardId][cardId].columnId;
    
    // Delete the card
    delete mockStorage.cards[boardId][cardId];
    
    // Update in board
    if (mockStorage.boards[boardId]) {
      mockStorage.boards[boardId].cards = mockStorage.boards[boardId].cards.filter(c => c.id !== cardId);
      
      // Update column item count
      const column = mockStorage.boards[boardId].columns.find(c => c.id === columnId);
      if (column) {
        column.itemCount = Math.max(0, column.itemCount - 1);
      }
    }
  } catch (error) {
    console.error("Error deleting card:", error);
    throw error;
  }
};

// Column operations
export const addColumn = async (boardId: string, column: Omit<Column, 'id'>): Promise<string> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a new ID
    const columnId = uuidv4();
    
    // Create the column
    const newColumn: Column = {
      ...column,
      id: columnId
    };
    
    // Add to mock storage
    if (!mockStorage.columns[boardId]) {
      mockStorage.columns[boardId] = {};
    }
    mockStorage.columns[boardId][columnId] = newColumn;
    
    // Update the board
    if (mockStorage.boards[boardId]) {
      mockStorage.boards[boardId].columns.push(newColumn);
    }
    
    return columnId;
  } catch (error) {
    console.error("Error adding column:", error);
    throw error;
  }
};

export const updateColumn = async (boardId: string, columnId: string, updates: Partial<Column>): Promise<void> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if column exists
    if (!mockStorage.columns[boardId]?.[columnId]) {
      throw new Error(`Column ${columnId} not found`);
    }
    
    // Update the column
    const updatedColumn = {
      ...mockStorage.columns[boardId][columnId],
      ...updates
    };
    
    mockStorage.columns[boardId][columnId] = updatedColumn;
    
    // Update in board
    if (mockStorage.boards[boardId]) {
      const columnIndex = mockStorage.boards[boardId].columns.findIndex(c => c.id === columnId);
      if (columnIndex !== -1) {
        mockStorage.boards[boardId].columns[columnIndex] = updatedColumn;
      }
    }
  } catch (error) {
    console.error("Error updating column:", error);
    throw error;
  }
};

export const deleteColumn = async (boardId: string, columnId: string): Promise<void> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if column exists
    if (!mockStorage.columns[boardId]?.[columnId]) {
      throw new Error(`Column ${columnId} not found`);
    }
    
    // Delete the column
    delete mockStorage.columns[boardId][columnId];
    
    // Update in board
    if (mockStorage.boards[boardId]) {
      mockStorage.boards[boardId].columns = mockStorage.boards[boardId].columns.filter(c => c.id !== columnId);
      
      // Remove all cards in this column
      const cardsToRemove = mockStorage.boards[boardId].cards.filter(c => c.columnId === columnId);
      cardsToRemove.forEach(card => {
        delete mockStorage.cards[boardId][card.id];
      });
      
      mockStorage.boards[boardId].cards = mockStorage.boards[boardId].cards.filter(c => c.columnId !== columnId);
    }
  } catch (error) {
    console.error("Error deleting column:", error);
    throw error;
  }
};

// Label operations
export const addLabel = async (boardId: string, label: Omit<Label, 'id'>): Promise<string> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a new ID
    const labelId = uuidv4();
    
    // Create the label
    const newLabel: Label = {
      ...label,
      id: labelId
    };
    
    // Add to mock storage
    if (!mockStorage.labels[boardId]) {
      mockStorage.labels[boardId] = {};
    }
    mockStorage.labels[boardId][labelId] = newLabel;
    
    // Update the board
    if (mockStorage.boards[boardId]) {
      mockStorage.boards[boardId].labels.push(newLabel);
    }
    
    return labelId;
  } catch (error) {
    console.error("Error adding label:", error);
    throw error;
  }
};

// Cluster operations
export const getClusters = async (boardId: string): Promise<Cluster[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!mockStorage.clusters[boardId]) {
      mockStorage.clusters[boardId] = {};
    }
    
    return Object.values(mockStorage.clusters[boardId]);
  } catch (error) {
    console.error("Error getting clusters:", error);
    return [];
  }
};

export const addCluster = async (boardId: string, cluster: Omit<Cluster, 'id'>): Promise<string> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a new ID
    const clusterId = uuidv4();
    
    // Create the cluster
    const newCluster: Cluster = {
      ...cluster,
      id: clusterId
    };
    
    // Add to mock storage
    if (!mockStorage.clusters[boardId]) {
      mockStorage.clusters[boardId] = {};
    }
    mockStorage.clusters[boardId][clusterId] = newCluster;
    
    return clusterId;
  } catch (error) {
    console.error("Error adding cluster:", error);
    throw error;
  }
};

// For testing offline detection
export const db = {
  app: { name: "MockFirebaseApp" }
};

export default {
  getBoard,
  subscribeToBoardChanges,
  addCard,
  updateCard,
  deleteCard,
  addColumn,
  updateColumn,
  deleteColumn,
  addLabel,
  getClusters,
  addCluster,
  db
};