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
      title: 'Clippy Corp Experience',
      columns: [
        { id: 'col-1', title: 'Backlog', itemCount: 10, order: 0, color: '#6f42c1' },
        { id: 'col-2', title: 'In Progress', itemCount: 15, order: 1, color: '#007bff' },
        { id: 'col-3', title: 'Review', itemCount: 10, order: 2, color: '#28a745' },
        { id: 'col-4', title: 'Blocked', itemCount: 5, order: 3, color: '#dc3545' },
        { id: 'col-5', title: 'Done', itemCount: 10, order: 4, color: '#fd7e14' }
      ],
      cards: [
        // Components-related cards
        { id: 'card-1', reference: '#10001', title: 'Refactor Header Component', description: 'Simplify header logic and improve accessibility', columnId: 'col-1', labels: ['label-2'], assignees: ['user-1'], repository: 'clippy-corp/kanban', order: 0, createdAt: Date.now() - 100000, updatedAt: Date.now() - 50000 },
        { id: 'card-2', reference: '#10002', title: 'Fix Sidebar Overflow Issue', description: 'Resolve overflow issue in sidebar on small screens', columnId: 'col-1', labels: ['label-1'], assignees: ['user-2'], repository: 'clippy-corp/kanban', order: 1, createdAt: Date.now() - 90000, updatedAt: Date.now() - 40000 },
        { id: 'card-3', reference: '#10003', title: 'Add Tooltip to Buttons', description: 'Provide tooltips for all action buttons', columnId: 'col-2', labels: ['label-3'], assignees: [], repository: 'clippy-corp/kanban', order: 0, createdAt: Date.now() - 80000, updatedAt: Date.now() - 30000 },
        { id: 'card-4', reference: '#10004', title: 'Implement Dark Mode', description: 'Add dark mode toggle and theme support', columnId: 'col-2', labels: ['label-4'], assignees: ['user-3'], repository: 'clippy-corp/kanban', order: 1, createdAt: Date.now() - 70000, updatedAt: Date.now() - 20000 },
        { id: 'card-5', reference: '#10005', title: 'Fix Modal Close Button', description: 'Ensure modal close button works on all browsers', columnId: 'col-3', labels: ['label-1'], assignees: [], repository: 'clippy-corp/kanban', order: 0, createdAt: Date.now() - 60000, updatedAt: Date.now() - 10000 },
    
        // Infrastructure boundaries
        { id: 'card-6', reference: '#10006', title: 'Optimize API Calls', description: 'Reduce redundant API calls in the dashboard', columnId: 'col-1', labels: ['label-2'], assignees: ['user-4'], repository: 'clippy-corp/kanban', order: 2, createdAt: Date.now() - 50000, updatedAt: Date.now() - 20000 },
        { id: 'card-7', reference: '#10007', title: 'Migrate to GraphQL', description: 'Replace REST API with GraphQL for better flexibility', columnId: 'col-2', labels: ['label-3'], assignees: ['user-5'], repository: 'clippy-corp/kanban', order: 2, createdAt: Date.now() - 40000, updatedAt: Date.now() - 10000 },
        { id: 'card-8', reference: '#10008', title: 'Set Up CI/CD Pipeline', description: 'Automate build and deployment process', columnId: 'col-3', labels: ['label-4'], assignees: ['user-6'], repository: 'clippy-corp/kanban', order: 1, createdAt: Date.now() - 30000, updatedAt: Date.now() - 5000 },
        { id: 'card-9', reference: '#10009', title: 'Fix CORS Issues', description: 'Resolve cross-origin resource sharing errors', columnId: 'col-4', labels: ['label-1'], assignees: [], repository: 'clippy-corp/kanban', order: 0, createdAt: Date.now() - 20000, updatedAt: Date.now() - 1000 },
        { id: 'card-10', reference: '#10010', title: 'Upgrade Node.js Version', description: 'Upgrade to Node.js 18 for better performance', columnId: 'col-5', labels: ['label-2'], assignees: ['user-7'], repository: 'clippy-corp/kanban', order: 0, createdAt: Date.now() - 10000, updatedAt: Date.now() - 500 },
    
        // Visual proximity
        { id: 'card-11', reference: '#10011', title: 'Fix Alignment in Footer', description: 'Ensure footer elements are properly aligned', columnId: 'col-1', labels: ['label-3'], assignees: [], repository: 'clippy-corp/kanban', order: 3, createdAt: Date.now() - 90000, updatedAt: Date.now() - 40000 },
        { id: 'card-12', reference: '#10012', title: 'Improve Card Spacing', description: 'Add consistent spacing between cards', columnId: 'col-2', labels: ['label-4'], assignees: ['user-8'], repository: 'clippy-corp/kanban', order: 3, createdAt: Date.now() - 80000, updatedAt: Date.now() - 30000 },
        { id: 'card-13', reference: '#10013', title: 'Fix Button Hover States', description: 'Ensure hover states are consistent across buttons', columnId: 'col-3', labels: ['label-1'], assignees: [], repository: 'clippy-corp/kanban', order: 2, createdAt: Date.now() - 70000, updatedAt: Date.now() - 20000 },
        { id: 'card-14', reference: '#10014', title: 'Add Animations to Dropdowns', description: 'Smooth animations for dropdown menus', columnId: 'col-4', labels: ['label-2'], assignees: ['user-9'], repository: 'clippy-corp/kanban', order: 1, createdAt: Date.now() - 60000, updatedAt: Date.now() - 10000 },
        { id: 'card-15', reference: '#10015', title: 'Fix Card Shadow', description: 'Ensure card shadows are consistent across themes', columnId: 'col-5', labels: ['label-3'], assignees: [], repository: 'clippy-corp/kanban', order: 1, createdAt: Date.now() - 50000, updatedAt: Date.now() - 20000 },
    
        // DOM proximity
        { id: 'card-16', reference: '#10016', title: 'Fix Context Menu Positioning', description: 'Ensure context menu appears near the clicked item', columnId: 'col-1', labels: ['label-4'], assignees: ['user-10'], repository: 'clippy-corp/kanban', order: 4, createdAt: Date.now() - 40000, updatedAt: Date.now() - 10000 },
        { id: 'card-17', reference: '#10017', title: 'Fix Dropdown Overlap', description: 'Resolve overlap issues with dropdown menus', columnId: 'col-2', labels: ['label-1'], assignees: [], repository: 'clippy-corp/kanban', order: 4, createdAt: Date.now() - 30000, updatedAt: Date.now() - 5000 },
        { id: 'card-18', reference: '#10018', title: 'Fix Tooltip Z-Index', description: 'Ensure tooltips appear above other elements', columnId: 'col-3', labels: ['label-2'], assignees: ['user-11'], repository: 'clippy-corp/kanban', order: 3, createdAt: Date.now() - 20000, updatedAt: Date.now() - 1000 },
        { id: 'card-19', reference: '#10019', title: 'Fix Modal Scroll Issue', description: 'Prevent background scrolling when modal is open', columnId: 'col-4', labels: ['label-3'], assignees: [], repository: 'clippy-corp/kanban', order: 2, createdAt: Date.now() - 10000, updatedAt: Date.now() - 500 },
        { id: 'card-20', reference: '#10020', title: 'Fix Dropdown Keyboard Navigation', description: 'Ensure dropdowns are accessible via keyboard', columnId: 'col-5', labels: ['label-4'], assignees: ['user-12'], repository: 'clippy-corp/kanban', order: 2, createdAt: Date.now() - 5000, updatedAt: Date.now() - 100 },
    
        // Permissions/data model similarity
        { id: 'card-21', reference: '#10021', title: 'Fix Read-Only Role Permissions', description: 'Ensure read-only users cannot edit cards', columnId: 'col-1', labels: ['label-1'], assignees: ['user-13'], repository: 'clippy-corp/kanban', order: 5, createdAt: Date.now() - 40000, updatedAt: Date.now() - 10000 },
        { id: 'card-22', reference: '#10022', title: 'Add Admin Role', description: 'Create a new admin role with elevated permissions', columnId: 'col-2', labels: ['label-2'], assignees: ['user-14'], repository: 'clippy-corp/kanban', order: 5, createdAt: Date.now() - 30000, updatedAt: Date.now() - 5000 },
        { id: 'card-23', reference: '#10023', title: 'Fix Bug Role Assignment', description: 'Resolve issues with assigning roles to users', columnId: 'col-3', labels: ['label-3'], assignees: [], repository: 'clippy-corp/kanban', order: 4, createdAt: Date.now() - 20000, updatedAt: Date.now() - 1000 },
        { id: 'card-24', reference: '#10024', title: 'Add Role-Based Access Control', description: 'Implement RBAC for better security', columnId: 'col-4', labels: ['label-4'], assignees: ['user-15'], repository: 'clippy-corp/kanban', order: 3, createdAt: Date.now() - 10000, updatedAt: Date.now() - 500 },
        { id: 'card-25', reference: '#10025', title: 'Fix Bug in Role Deletion', description: 'Ensure roles can be deleted without errors', columnId: 'col-5', labels: ['label-1'], assignees: [], repository: 'clippy-corp/kanban', order: 3, createdAt: Date.now() - 5000, updatedAt: Date.now() - 100 },
    
        // Add more cards as needed to reach 50...
      ],
      labels: [
        { id: 'label-1', name: 'bug', color: '#dc3545' },
        { id: 'label-2', name: 'feature', color: '#28a745' },
        { id: 'label-3', name: 'enhancement', color: '#007bff' },
        { id: 'label-4', name: 'documentation', color: '#6f42c1' }
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