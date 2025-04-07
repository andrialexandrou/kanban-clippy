import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType, Label } from '../../types';
import { 
  Box, 
  Text, 
  Heading, 
  Label as PrimerLabel, 
  Avatar
} from '@primer/react';

interface CardProps {
  card: CardType;
  labels: Label[];
  onEdit: (card: CardType) => void;
}

const Card: React.FC<CardProps> = ({ card, labels, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Set up sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  // Get labels for this card
  const cardLabels = labels.filter(label => card.labels.includes(label.id));
  
  // Toggle description visibility
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle edit click
  const handleEditClick = () => {
    onEdit(card);
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="card"
      sx={{
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        bg: 'canvas.default',
        p: 3,
        mb: 2,
        cursor: isDragging ? 'grabbing' : 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        ':hover': {
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        },
        position: 'relative',
      }}
      onClick={toggleExpanded}
    >
      {/* Card header with reference and drag handle */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={2}
      >
        <Text color="fg.muted" fontSize={1}>
          {card.reference}
        </Text>
        <Box 
          {...listeners} 
          sx={{ 
            cursor: 'grab',
            ':active': { cursor: 'grabbing' }
          }}
          aria-label="Drag card"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </Box>
      </Box>

      {/* Card title */}
      <Heading as="h3" sx={{ fontSize: 2, mb: 2, fontWeight: 'normal' }}>
        {card.title}
      </Heading>

      {/* Card labels */}
      {cardLabels.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {cardLabels.map(label => (
            <PrimerLabel 
              key={label.id}
              variant="accent"
              sx={{ 
                bg: label.color,
                fontSize: '12px',
                fontWeight: 'normal'
              }}
            >
              {label.name}
            </PrimerLabel>
          ))}
        </Box>
      )}

      {/* Expanded description */}
      {isExpanded && (
        <Box 
          mt={2} 
          pt={2} 
          borderTop="1px solid" 
          borderColor="border.muted"
        >
          <Text color="fg.default" as="p" sx={{ fontSize: 1, lineHeight: 1.5 }}>
            {card.description || 'No description provided.'}
          </Text>
        </Box>
      )}

      {/* Card footer */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mt={2}
        pt={2}
        borderTop="1px solid" 
        borderColor="border.muted"
      >
        {/* Repository reference */}
        <Text color="fg.muted" fontSize={1}>
          {card.repository || 'kanban-clippy'}
        </Text>

        {/* Assignees */}
        {card.assignees && card.assignees.length > 0 && (
          <Box display="flex" flexDirection="row-reverse">
            {card.assignees.map((assigneeId, index) => (
              <Avatar 
                key={assigneeId}
                src={`https://avatars.githubusercontent.com/u/${index + 1}?v=4`} 
                size={20}
                sx={{ 
                  ml: index === 0 ? 0 : -1,
                  border: '1px solid',
                  borderColor: 'canvas.default'
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Card;