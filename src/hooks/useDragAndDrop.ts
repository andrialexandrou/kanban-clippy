import { useState } from 'react';
import { 
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  UniqueIdentifier
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Board, Card, Column } from '../types';

export const useDragAndDrop = (
  board: Board,
  onMoveCard: (cardId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => void
) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  
  // Define sensors for drag interaction
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum distance for a drag to start
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Find a card by its ID
  const findCard = (id: string): Card | undefined => {
    return board.cards.find(card => card.id === id);
  };
  
  // Find a column by its ID
  const findColumn = (id: string): Column | undefined => {
    return board.columns.find(column => column.id === id);
  };
  
  // Get cards in a specific column
  const getCardsInColumn = (columnId: string): Card[] => {
    return board.cards
      .filter(card => card.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  };
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (!active || !active.id) return;
    
    const card = findCard(String(active.id));
    
    if (card) {
      setActiveId(active.id);
      setActiveCard(card);
    }
  };

  // Handle drag over (moving between columns)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    // Return if no over target or same as active
    if (!active || !over || !active.id || !over.id) return;
    
    const activeCardId = String(active.id);
    const overId = String(over.id);
    
    // Find the active card
    const card = findCard(activeCardId);
    if (!card) return;
    
    // Handle dropping on a column
    const isOverColumn = findColumn(overId);
    if (isOverColumn) {
      // If dragging over a column directly, we'll move the card to the end of that column
      if (card.columnId !== overId) {
        const cardsInTargetColumn = getCardsInColumn(overId);
        const newOrder = cardsInTargetColumn.length > 0 
          ? Math.max(...cardsInTargetColumn.map(c => c.order)) + 1 
          : 0;
          
        onMoveCard(activeCardId, card.columnId, overId, newOrder);
      }
      return;
    }
    
    // Handle dropping on another card
    const overCard = findCard(overId);
    if (!overCard || overCard.id === card.id) return;
    
    // If we're moving to a different column
    if (card.columnId !== overCard.columnId) {
      onMoveCard(activeCardId, card.columnId, overCard.columnId, overCard.order);
    }
    // Otherwise, reordering within the same column is handled by the sortable context
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || !over || !active.id || !over.id) {
      setActiveId(null);
      setActiveCard(null);
      return;
    }
    
    const activeCardId = String(active.id);
    const overId = String(over.id);
    
    // Find the active card
    const card = findCard(activeCardId);
    if (!card) {
      setActiveId(null);
      setActiveCard(null);
      return;
    }
    
    // Handle dropping on a column
    const isOverColumn = findColumn(overId);
    if (isOverColumn) {
      // If dragging over a column directly, we'll move the card to the end of that column
      if (card.columnId !== overId) {
        const cardsInTargetColumn = getCardsInColumn(overId);
        const newOrder = cardsInTargetColumn.length > 0 
          ? Math.max(...cardsInTargetColumn.map(c => c.order)) + 1 
          : 0;
          
        // Update the card in Firebase
        onMoveCard(activeCardId, card.columnId, overId, newOrder);
      }
    }
    
    // Handle dropping on another card
    const overCard = findCard(overId);
    if (overCard && overCard.id !== card.id) {
      // Update the card in Firebase
      onMoveCard(activeCardId, card.columnId, overCard.columnId, overCard.order);
    }
    
    // Reset active state
    setActiveId(null);
    setActiveCard(null);
  };
  
  return {
    activeId,
    activeCard,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};

export default useDragAndDrop;