import { Board, Card, Column, Label, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate a new reference number
export const generateReference = (): string => {
  return `#${Math.floor(10000 + Math.random() * 90000)}`;
};

// Helper function to create a new card
export const createNewCard = (
  title: string,
  description: string,
  columnId: string,
  labels: string[] = [],
  repository: string = 'kanban-clippy'
): Omit<Card, 'id'> => {
  // Find the highest order in the column
  const now = Date.now();
  
  return {
    reference: generateReference(),
    title,
    description,
    columnId,
    labels,
    assignees: [],
    repository,
    order: 0, // This should be updated based on existing cards
    createdAt: now,
    updatedAt: now
  };
};

// Helper function to generate mock data for testing
export const generateMockData = (): Board => {
  const columns: Column[] = [
    { id: 'col-1', title: 'No Status', itemCount: 3, order: 0, color: '#6f42c1' },
    { id: 'col-2', title: 'Product Review', itemCount: 0, order: 1, color: '#dc3545' },
    { id: 'col-3', title: 'Shaping', itemCount: 2, order: 2, color: '#007bff' },
    { id: 'col-4', title: 'Todo', itemCount: 2, order: 3, color: '#28a745' },
    { id: 'col-5', title: 'In Progress', itemCount: 1, order: 4, color: '#fd7e14' }
  ];

  const labels: Label[] = [
    { id: 'label-1', name: 'bug', color: '#dc3545' },
    { id: 'label-2', name: 'feature', color: '#28a745' },
    { id: 'label-3', name: 'enhancement', color: '#007bff' },
    { id: 'label-4', name: 'documentation', color: '#6f42c1' }
  ];

  const users: User[] = [
    { id: 'user-1', name: 'John Doe', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4' },
    { id: 'user-2', name: 'Jane Smith', avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4' }
  ];

  const cards: Card[] = [
    {
      id: 'card-1',
      reference: '#16870',
      title: 'Implement drag and drop for cards',
      description: 'Use dnd-kit to implement the drag and drop functionality',
      columnId: 'col-1',
      labels: ['label-1', 'label-2'],
      assignees: [],
      repository: 'github/memex',
      order: 0,
      createdAt: Date.now() - 100000,
      updatedAt: Date.now() - 50000
    },
    {
      id: 'card-2',
      reference: '#18043',
      title: 'Add card creation dialog',
      description: 'Implement dialog for creating new cards',
      columnId: 'col-3',
      labels: ['label-3'],
      assignees: [],
      repository: 'github/memex',
      order: 0,
      createdAt: Date.now() - 90000,
      updatedAt: Date.now() - 40000
    },
    {
      id: 'card-3',
      reference: '#18101',
      title: 'Implement AI duplicate detection',
      description: 'Use Vercel AI SDK to detect duplicate cards',
      columnId: 'col-4',
      labels: ['label-2'],
      assignees: ['user-1'],
      repository: 'github/memex',
      order: 0,
      createdAt: Date.now() - 80000,
      updatedAt: Date.now() - 30000
    },
    {
      id: 'card-4',
      reference: '#18374',
      title: 'Add Clippy assistant integration',
      description: 'Implement Clippy character for suggestions',
      columnId: 'col-1',
      labels: ['label-1'],
      assignees: ['user-2'],
      repository: 'github/memex',
      order: 1,
      createdAt: Date.now() - 70000,
      updatedAt: Date.now() - 20000
    },
    {
      id: 'card-5',
      reference: '#19105',
      title: 'Create card clustering feature',
      description: 'Use LLM to group related cards into clusters',
      columnId: 'col-5',
      labels: ['label-3', 'label-4'],
      assignees: [],
      repository: 'github/memex',
      order: 0,
      createdAt: Date.now() - 60000,
      updatedAt: Date.now() - 10000
    }
  ];

  return {
    id: 'demo-board-123',
    title: 'Projects Quality, Fundamentals, Accessibility',
    columns,
    cards,
    labels,
    users
  };
};

// Format date utility
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default {
  generateReference,
  createNewCard,
  generateMockData,
  formatDate
};