// Define TypeScript types
export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Card {
  id: string;
  reference: string; // e.g., #16870
  title: string;
  description: string;
  columnId: string;
  labels: string[]; // Array of label IDs
  assignees: string[]; // Array of user IDs
  repository?: string; // e.g., clippy-corp/kanban
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Column {
  id: string;
  title: string;
  itemCount: number;
  order: number;
  color?: string; // For the dot indicator color
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  cards: Card[];
  labels: Label[];
  users: User[];
}

export interface Cluster {
  id: string;
  title: string;
  description: string;
  cardIds: string[];
  createdAt: number;
}

// Network Status Types
export interface NetworkStatus {
  online: boolean;
  llmConnected: boolean;
  lastUpdated: number;
}

// AI Response Types
export interface DuplicateCheck {
  duplicates: Card[];
  reason?: string;
}

export interface ClusterAnalysis {
  clusters: Cluster[];
}

// Action Types for Reducers
export type BoardAction = 
  | { type: 'SET_BOARD'; payload: Board }
  | { type: 'ADD_COLUMN'; payload: Column }
  | { type: 'UPDATE_COLUMN'; payload: Column }
  | { type: 'DELETE_COLUMN'; payload: string }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'MOVE_CARD'; payload: { cardId: string; sourceColumnId: string; destinationColumnId: string; newOrder: number } }
  | { type: 'ADD_LABEL'; payload: Label }
  | { type: 'DELETE_LABEL'; payload: string };

export type NetworkAction =
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_LLM_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_TIMESTAMP' };