import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { useBoard } from '../../context/BoardContext';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useFirestore } from '../../hooks/useFirestore';
import { Card as CardType, Column as ColumnType } from '../../types';
import Column from './Column';
import Card from './Card';
import { Box, ThemeProvider } from '@primer/react';

interface BoardProps {
  onAddCard: (columnId?: string) => void;
  onEditCard: (card: CardType) => void;
  onViewClusters: () => void;
}

const Board: React.FC<BoardProps> = ({ onAddCard, onEditCard, onViewClusters }) => {
  const { state: board, dispatch } = useBoard();
  const { updateCard } = useFirestore(board.id);
  
  // Callback for moving cards between columns
  const handleMoveCard = async (
    cardId: string, 
    sourceColumnId: string, 
    destinationColumnId: string, 
    newOrder: number
  ) => {
    // Update card in state
    dispatch({
      type: 'MOVE_CARD',
      payload: {
        cardId,
        sourceColumnId,
        destinationColumnId,
        newOrder
      }
    });
    
    // Update card in Firestore
    await updateCard(cardId, {
      columnId: destinationColumnId,
      order: newOrder,
      updatedAt: Date.now()
    });
  };
  
  // Set up drag and drop with the useDragAndDrop hook
  const {
    activeId,
    activeCard,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  } = useDragAndDrop(board, handleMoveCard);
  
  // Handle column edit
  const handleEditColumn = (column: ColumnType) => {
    // Column editing functionality could be added here
    console.log('Edit column', column);
  };
  
  return (
    <ThemeProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: ['column', 'column', 'row'],
            overflowX: ['hidden', 'hidden', 'auto'],
            height: 'calc(100vh - 120px)', // Adjust based on header height
            gap: 3,
            p: 3,
            bg: 'canvas.subtle',
          }}
        >
          {/* Render columns */}
          {board.columns
            .sort((a, b) => a.order - b.order)
            .map(column => (
              <Column
                key={column.id}
                column={column}
                cards={board.cards}
                labels={board.labels}
                onAddCard={(columnId) => onAddCard(columnId)}
                onEditCard={onEditCard}
                onEditColumn={handleEditColumn}
              />
            ))}
            
          {/* Add column placeholder */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: '300px',
              height: '80px',
              border: '2px dashed',
              borderColor: 'border.muted',
              borderRadius: 2,
              p: 3,
              color: 'fg.muted',
              cursor: 'pointer',
              ':hover': {
                borderColor: 'border.default',
                color: 'fg.default',
              },
            }}
            onClick={() => console.log('Add column')}
          >
            + Add column
          </Box>
        </Box>
        
        {/* Drag overlay for active card */}
        <DragOverlay>
          {activeId && activeCard ? (
            <Card
              card={activeCard}
              labels={board.labels.filter(label => activeCard.labels.includes(label.id))}
              onEdit={onEditCard}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </ThemeProvider>
  );
};

export default Board;