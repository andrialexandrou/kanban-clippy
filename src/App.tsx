import React, { useState, useEffect } from 'react';
import { ThemeProvider, BaseStyles, Box } from '@primer/react';
import { BoardProvider } from './context/BoardContext';
import { NetworkProvider } from './context/NetworkContext';
import Header from './components/Layout/Header';
import FilterBar from './components/Layout/FilterBar';
import Board from './components/Board/Board';
import CardFormDialog from './components/Dialogs/CardFormDialog';
import ClusterDialog from './components/Dialogs/ClusterDialog';
import ClippyAssistant from './components/Clippy/ClippyAssistant';
import { Card } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock board ID - in a real app, this would come from the URL or user selection
const BOARD_ID = 'demo-board-123';

function App() {
  // State for dialogs
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [isClusterDialogOpen, setIsClusterDialogOpen] = useState(false);
  const [editCard, setEditCard] = useState<Card | undefined>(undefined);
  const [initialColumnId, setInitialColumnId] = useState<string | undefined>(undefined);
  const [filterQuery, setFilterQuery] = useState('');
  
  // State for Clippy messages
  const [clippyMessages, setClippyMessages] = useState<Array<{
    id: string;
    content: string;
    type: 'info' | 'suggestion' | 'warning';
    action?: {
      label: string;
      onClick: () => void;
    };
    dismissible?: boolean;
  }>>([]);
  
  // Welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      addClippyMessage({
        content: "Welcome to Kanban Clippy! I'll help you organize your tasks and find related items.",
        type: 'info',
        action: {
          label: 'Learn More',
          onClick: () => {
            // Could open a help dialog here
            console.log('Learn more clicked');
          }
        }
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add a Clippy message
  const addClippyMessage = (message: {
    content: string;
    type: 'info' | 'suggestion' | 'warning';
    action?: {
      label: string;
      onClick: () => void;
    };
    dismissible?: boolean;
  }) => {
    setClippyMessages(prev => [
      ...prev,
      {
        id: uuidv4(),
        ...message
      }
    ]);
  };
  
  // Dismiss a Clippy message
  const dismissClippyMessage = (id: string) => {
    setClippyMessages(prev => prev.filter(msg => msg.id !== id));
  };
  
  // Open card form dialog
  const handleOpenCardForm = (columnId?: string) => {
    setEditCard(undefined);
    setInitialColumnId(columnId);
    setIsCardFormOpen(true);
  };
  
  // Open card edit dialog
  const handleEditCard = (card: Card) => {
    setEditCard(card);
    setInitialColumnId(undefined);
    setIsCardFormOpen(true);
  };
  
  // Handle form submission
  const handleCardFormSubmit = async (cardData: Partial<Card>) => {
    try {
      if (cardData.id) {
        // Update existing card
        console.log('Updating card:', cardData);
        
        addClippyMessage({
          content: "Card updated successfully!",
          type: 'info',
          dismissible: true
        });
      } else {
        // Add new card
        console.log('Adding new card:', cardData);
        
        addClippyMessage({
          content: "Card created successfully!",
          type: 'info',
          dismissible: true
        });
      }
    } catch (error) {
      console.error('Error saving card:', error);
      
      addClippyMessage({
        content: "There was a problem saving your card. Please try again.",
        type: 'warning',
        dismissible: true
      });
    }
  };
  
  // Handle filter change
  const handleFilter = (query: string) => {
    setFilterQuery(query);
  };
  
  // Handle view card from clusters
  const handleViewCardFromCluster = (cardId: string) => {
    // Find the card and open edit dialog
    console.log('View card:', cardId);
    setIsClusterDialogOpen(false);
  };

  return (
    <ThemeProvider>
      <BaseStyles>
        <NetworkProvider>
          <BoardProvider boardId={BOARD_ID}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
              {/* Header */}
              <Header 
                onAddCard={handleOpenCardForm}
                onViewClusters={() => setIsClusterDialogOpen(true)}
              />
              
              {/* Filter bar */}
              <FilterBar onFilter={handleFilter} />
              
              {/* Main board */}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Board 
                  onAddCard={handleOpenCardForm}
                  onEditCard={handleEditCard}
                  onViewClusters={() => setIsClusterDialogOpen(true)}
                />
              </Box>
              
              {/* Dialogs */}
              <CardFormDialog 
                isOpen={isCardFormOpen}
                onDismiss={() => setIsCardFormOpen(false)}
                onSubmit={handleCardFormSubmit}
                initialColumnId={initialColumnId}
                editCard={editCard}
              />
              
              <ClusterDialog 
                isOpen={isClusterDialogOpen}
                onDismiss={() => setIsClusterDialogOpen(false)}
                onViewCard={handleViewCardFromCluster}
              />
              
              {/* Clippy Assistant */}
              <ClippyAssistant 
                messages={clippyMessages}
                onDismissMessage={dismissClippyMessage}
              />
            </Box>
          </BoardProvider>
        </NetworkProvider>
      </BaseStyles>
    </ThemeProvider>
  );
}

export default App;