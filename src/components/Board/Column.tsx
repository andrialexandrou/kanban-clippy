import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Card as CardType, Label } from '../../types';
import Card from './Card';
import { Box, Heading, Button, Text } from '@primer/react';
import { KebabHorizontalIcon, PlusIcon } from '@primer/octicons-react';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  labels: Label[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: CardType) => void;
  onEditColumn: (column: ColumnType) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  cards,
  labels,
  onAddCard,
  onEditCard,
  onEditColumn
}) => {
  // Set up droppable area
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Get cards that belong to this column and sort them by order
  const columnCards = cards
    .filter(card => card.columnId === column.id)
    .sort((a, b) => a.order - b.order);

  const cardIds = columnCards.map(card => card.id);

  // Determine background color based on drop state
  const bgColor = isOver ? 'rgba(208, 215, 222, 0.3)' : 'rgba(246, 248, 250, 1)'; // GitHub-like gray for columns

  // Handle add card
  const handleAddCard = () => {
    onAddCard(column.id);
  };

  // Handle edit column
  const handleEditColumn = () => {
    onEditColumn(column);
  };

  // Determine dot color based on column color or default
  const dotColor = column.color || '#0969da';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: ['100%', '100%', '300px'],
        minWidth: '300px',
        height: '100%',
        bg: bgColor,
        transition: 'background-color 200ms ease',
        p: 2,
        borderRadius: '6px',
        border: '1px solid',
        borderColor: 'border.muted',
      }}
      ref={setNodeRef}
    >
      {/* Column header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'border.muted',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Status dot */}
          <Box
            sx={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              bg: dotColor,
              mr: 2,
            }}
          />

          {/* Column title and count */}
          <Heading as="h2" sx={{ fontSize: 2, fontWeight: 'semibold', display: 'flex', alignItems: 'center' }}>
            {column.title}
            <Box 
              sx={{ 
                ml: 2, 
                bg: 'neutral.muted', 
                borderRadius: '2em', 
                fontSize: 0, 
                py: '2px', 
                px: 2, 
                color: 'fg.muted',
                fontWeight: 'normal' 
              }}
            >
              {column.itemCount}
            </Box>
          </Heading>
        </Box>

        {/* Column menu */}
        <Button
          variant="invisible"
          sx={{ p: 1 }}
          onClick={handleEditColumn}
          aria-label="Column options"
        >
          <KebabHorizontalIcon />
        </Button>
      </Box>

      {/* Cards container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          mb: 2,
          pr: 1,
          // Scrollbar styling
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            bg: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bg: 'border.muted',
            borderRadius: '3px',
          },
        }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {columnCards.map(card => (
            <Card
              key={card.id}
              card={card}
              labels={labels}
              onEdit={onEditCard}
            />
          ))}
        </SortableContext>
      </Box>

      {/* Add card button */}
      <Button
        variant="invisible"
        onClick={handleAddCard}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          p: 2,
          color: 'fg.muted',
          ':hover': {
            color: 'fg.default',
            bg: 'canvas.subtle',
          }
        }}
      >
        <Box sx={{ mr: 1 }}>
          <PlusIcon size={12} />
        </Box>
        <Text>Add item</Text>
      </Button>
    </Box>
  );
};

export default Column;