import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { Board, Card, Column, Label, BoardAction } from '../types';
// Import the mock data
import issuesData from '../mock-data.json';

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
    // Create mock cards from the imported issues data
    const mockCards = issuesData.map((issue, index) => {
      // Determine which column to place the card in based on a simple distribution
      let columnId;
      if (index % 5 === 0) columnId = 'col-1';      // Backlog
      else if (index % 5 === 1) columnId = 'col-2'; // In Progress
      else if (index % 5 === 2) columnId = 'col-3'; // Review
      else if (index % 5 === 3) columnId = 'col-4'; // Blocked
      else columnId = 'col-5';                     // Done
      
      // Determine label based on issue title prefix
      let labelId = 'label-1'; // Default to bug
      if (issue.title.includes('[Screen Reader')) labelId = 'label-2';
      else if (issue.title.includes('[Visual Requirement')) labelId = 'label-3';
      else if (issue.title.includes('[Supporting Platform')) labelId = 'label-4';
      
      // Random assignee (or none)
      const assigneeRandom = Math.floor(Math.random() * 3);
      const assignees = assigneeRandom === 0 ? [] : [`user-${Math.floor(Math.random() * 15) + 1}`];

      // Generate card order within column based on issue number
      const order = Math.floor(index / 5);
      
      return {
        id: `card-${index + 1}`,
        reference: `#${issue.number}`,
        title: issue.title,
        description: `Fix accessibility issue reported in ${issue.url}`,
        columnId,
        labels: [labelId],
        assignees,
        repository: 'clippy-corp/kanban',
        order,
        createdAt: Date.now() - (index * 10000),
        updatedAt: Date.now() - (index * 5000)
      };
    });
    
    // Mock data
    const mockBoard: Board = {
      id: boardId,
      title: 'Clippy Corp Experience',
      columns: [
        { id: 'col-1', title: 'Backlog', itemCount: 0, order: 0, color: '#6f42c1' },
        { id: 'col-2', title: 'In Progress', itemCount: 0, order: 1, color: '#007bff' },
        { id: 'col-3', title: 'Review', itemCount: 0, order: 2, color: '#28a745' },
        { id: 'col-4', title: 'Blocked', itemCount: 0, order: 3, color: '#dc3545' },
        { id: 'col-5', title: 'Done', itemCount: 0, order: 4, color: '#fd7e14' }
      ],
      cards: mockCards,
      labels: [
        { id: 'label-1', name: 'bug', color: '#dc3545' },
        { id: 'label-2', name: 'screen reader', color: '#28a745' },
        { id: 'label-3', name: 'visual', color: '#007bff' },
        { id: 'label-4', name: 'platform', color: '#6f42c1' }
      ],
      users: [
        { id: 'user-1', name: 'John Doe', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4' },
        { id: 'user-2', name: 'Jane Smith', avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4' },
        { id: 'user-3', name: 'Alice Johnson', avatarUrl: 'https://avatars.githubusercontent.com/u/3?v=4' },
        { id: 'user-4', name: 'Bob Brown', avatarUrl: 'https://avatars.githubusercontent.com/u/4?v=4' },
        { id: 'user-5', name: 'Charlie Davis', avatarUrl: 'https://avatars.githubusercontent.com/u/5?v=4' },
        { id: 'user-6', name: 'Diana Evans', avatarUrl: 'https://avatars.githubusercontent.com/u/6?v=4' },
        { id: 'user-7', name: 'Eve Foster', avatarUrl: 'https://avatars.githubusercontent.com/u/7?v=4' },
        { id: 'user-8', name: 'Frank Green', avatarUrl: 'https://avatars.githubusercontent.com/u/8?v=4' },
        { id: 'user-9', name: 'Grace Hall', avatarUrl: 'https://avatars.githubusercontent.com/u/9?v=4' },
        { id: 'user-10', name: 'Hank Irving', avatarUrl: 'https://avatars.githubusercontent.com/u/10?v=4' },
        { id: 'user-11', name: 'Ivy Johnson', avatarUrl: 'https://avatars.githubusercontent.com/u/11?v=4' },
        { id: 'user-12', name: 'Jack King', avatarUrl: 'https://avatars.githubusercontent.com/u/12?v=4' },
        { id: 'user-13', name: 'Karen Lee', avatarUrl: 'https://avatars.githubusercontent.com/u/13?v=4' },
        { id: 'user-14', name: 'Leo Martin', avatarUrl: 'https://avatars.githubusercontent.com/u/14?v=4' },
        { id: 'user-15', name: 'Mia Nelson', avatarUrl: 'https://avatars.githubusercontent.com/u/15?v=4' }
      ]
    };
    
    // Update the item counts for each column
    mockBoard.columns = mockBoard.columns.map(column => {
      const itemCount = mockBoard.cards.filter(card => card.columnId === column.id).length;
      return { ...column, itemCount };
    });
    
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