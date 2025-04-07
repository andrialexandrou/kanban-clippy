import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { Board, Card, Column, Label, BoardAction } from '../types';
// Since firebase.ts might have similar issues, let's mock this import for now
// import { getBoard, subscribeToBoardChanges } from '../services/firebase';

// Initial state
const initialState: Board = {
  id: '',
  title: '',
  columns: [],
  cards: [],
  labels: [],
  users: []
};

// Create context
const BoardContext = createContext<{
  state: Board;
  dispatch: React.Dispatch<BoardAction>;
} | undefined>(undefined);

// Reducer function
const boardReducer = (state: Board, action: BoardAction): Board => {
  switch (action.type) {
    case 'SET_BOARD':
      return action.payload;
    
    case 'ADD_COLUMN':
      return {
        ...state,
        columns: [...state.columns, action.payload]
      };
    
    case 'UPDATE_COLUMN':
      return {
        ...state,
        columns: state.columns.map(column => 
          column.id === action.payload.id ? action.payload : column
        )
      };
    
    case 'DELETE_COLUMN':
      return {
        ...state,
        columns: state.columns.filter(column => column.id !== action.payload)
      };
    
    case 'ADD_CARD':
      return {
        ...state,
        cards: [...state.cards, action.payload]
      };
    
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map(card => 
          card.id === action.payload.id ? action.payload : card
        )
      };
    
    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload)
      };
    
    case 'MOVE_CARD': {
      const { cardId, sourceColumnId, destinationColumnId, newOrder } = action.payload;
      
      return {
        ...state,
        cards: state.cards.map(card => {
          // If this is the card being moved
          if (card.id === cardId) {
            return {
              ...card,
              columnId: destinationColumnId,
              order: newOrder
            };
          }
          
          // Adjust other cards in the destination column
          if (card.columnId === destinationColumnId && card.order >= newOrder) {
            return {
              ...card,
              order: card.order + 1
            };
          }
          
          // Adjust other cards in the source column (if different from destination)
          if (sourceColumnId !== destinationColumnId && card.columnId === sourceColumnId && card.order > newOrder) {
            return {
              ...card,
              order: card.order - 1
            };
          }
          
          return card;
        })
      };
    }
    
    case 'ADD_LABEL':
      return {
        ...state,
        labels: [...state.labels, action.payload]
      };
    
    case 'DELETE_LABEL':
      return {
        ...state,
        labels: state.labels.filter(label => label.id !== action.payload)
      };
    
    default:
      return state;
  }
};

// Provider component
interface BoardProviderProps {
  children: ReactNode;
  boardId: string;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children, boardId }) => {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  
  // Load initial board data and subscribe to changes - mocked for now
  useEffect(() => {
    // Mock data loading
    const mockBoard: Board = {
      id: boardId,
      title: 'Projects Quality, Fundamentals, Accessibility',
      columns: [
        { id: 'col-1', title: 'No Status', itemCount: 3, order: 0, color: '#6f42c1' },
        { id: 'col-2', title: 'Product Review', itemCount: 0, order: 1, color: '#dc3545' },
        { id: 'col-3', title: 'Shaping', itemCount: 2, order: 2, color: '#007bff' },
        { id: 'col-4', title: 'Todo', itemCount: 2, order: 3, color: '#28a745' },
        { id: 'col-5', title: 'In Progress', itemCount: 1, order: 4, color: '#fd7e14' }
      ],
      cards: [
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
      ],
      labels: [
        { id: 'label-1', name: 'bug', color: '#dc3545' },
        { id: 'label-2', name: 'feature', color: '#28a745' },
        { id: 'label-3', name: 'enhancement', color: '#007bff' },
        { id: 'label-4', name: 'documentation', color: '#6f42c1' }
      ],
      users: [
        { id: 'user-1', name: 'John Doe', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4' },
        { id: 'user-2', name: 'Jane Smith', avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4' }
      ]
    };
    
    // Set mock data
    dispatch({ type: 'SET_BOARD', payload: mockBoard });
    
    // Mock subscription - not actually needed for this demo
    return () => {};
  }, [boardId]);
  
  const value = { state, dispatch };
  
  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};

// Custom hook to use the board context
export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

export default BoardContext;