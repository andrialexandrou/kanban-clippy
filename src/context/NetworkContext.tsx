import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { NetworkStatus, NetworkAction } from '../types';
// Mock this import for now
// import { checkLLMConnection } from '../services/ai';

// Initial state
const initialState: NetworkStatus = {
  online: navigator.onLine,
  llmConnected: false,
  lastUpdated: Date.now()
};

// Create context
const NetworkContext = createContext<{
  state: NetworkStatus;
  dispatch: React.Dispatch<NetworkAction>;
} | undefined>(undefined);

// Reducer function
const networkReducer = (state: NetworkStatus, action: NetworkAction): NetworkStatus => {
  switch (action.type) {
    case 'SET_ONLINE':
      return {
        ...state,
        online: action.payload,
        lastUpdated: Date.now()
      };
    
    case 'SET_LLM_CONNECTED':
      return {
        ...state,
        llmConnected: action.payload,
        lastUpdated: Date.now()
      };
      
    case 'UPDATE_TIMESTAMP':
      return {
        ...state,
        lastUpdated: Date.now()
      };
      
    default:
      return state;
  }
};

// Provider component
interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(networkReducer, initialState);
  
  // Listen for online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE', payload: true });
    };
    
    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE', payload: false });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check LLM connection periodically - mocked for now
  useEffect(() => {
    const checkConnection = () => {
      // Mock LLM connection status - randomly connected
      const isConnected = Math.random() > 0.3; // 70% chance of being connected
      dispatch({ type: 'SET_LLM_CONNECTED', payload: isConnected });
    };
    
    // Check initially
    checkConnection();
    
    // Then check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const value = { state, dispatch };
  
  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

// Custom hook to use the network context
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export default NetworkContext;