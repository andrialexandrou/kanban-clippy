import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box, 
  TextInput, 
  Textarea, 
  Button, 
  FormControl, 
  Label, 
  Select, 
  Text,
  ThemeProvider,
  Spinner,
  Flash
} from '@primer/react';
import { Card, Column, Label as CardLabel } from '../../types';
import { useAI } from '../../hooks/useAI';
import { useBoard } from '../../context/BoardContext';
import { XIcon } from '@primer/octicons-react';

interface CardFormDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (cardData: Partial<Card>) => void;
  initialColumnId?: string;
  editCard?: Card;
}

const CardFormDialog: React.FC<CardFormDialogProps> = ({
  isOpen,
  onDismiss,
  onSubmit,
  initialColumnId,
  editCard
}) => {
  const { state: boardState } = useBoard();
  const { checkDuplicates, loading: aiLoading, isLLMConnected } = useAI();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [repository, setRepository] = useState('kanban-clippy');
  
  // Duplicate detection state
  const [duplicateCards, setDuplicateCards] = useState<Card[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  
  // Sort columns by order
  const sortedColumns = [...boardState.columns].sort((a, b) => a.order - b.order);
  
  // Initialize form with editCard data or defaults
  useEffect(() => {
    if (editCard) {
      setTitle(editCard.title);
      setDescription(editCard.description || '');
      setColumnId(editCard.columnId);
      setSelectedLabels(editCard.labels || []);
      setRepository(editCard.repository || 'kanban-clippy');
    } else {
      setTitle('');
      setDescription('');
      setColumnId(initialColumnId || (sortedColumns[0]?.id || ''));
      setSelectedLabels([]);
      setRepository('kanban-clippy');
    }
    
    setDuplicateCards([]);
    setShowDuplicates(false);
    setSimilarity(0);
  }, [editCard, initialColumnId, sortedColumns]);
  
  // Check for duplicates when title or description changes
  useEffect(() => {
    const checkForDuplicates = async () => {
      if (!isLLMConnected || !title) return;
      
      // Don't check if we're editing an existing card
      if (editCard) return;
      
      const result = await checkDuplicates(
        { title, description }, 
        boardState.cards
      );
      
      if (result.isDuplicate) {
        setDuplicateCards(result.duplicateCards);
        setShowDuplicates(true);
        setSimilarity(result.similarity);
      } else {
        setDuplicateCards([]);
        setShowDuplicates(false);
        setSimilarity(0);
      }
    };
    
    // Debounce the check
    const timer = setTimeout(() => {
      checkForDuplicates();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [title, description, boardState.cards, checkDuplicates, editCard, isLLMConnected]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cardData: Partial<Card> = {
      title,
      description,
      columnId,
      labels: selectedLabels,
      repository,
      updatedAt: Date.now()
    };
    
    if (editCard) {
      cardData.id = editCard.id;
      cardData.reference = editCard.reference;
    } else {
      cardData.createdAt = Date.now();
      // Set the order to be the highest in the column + 1
      const cardsInColumn = boardState.cards.filter((card: any) => card.columnId === columnId);
      cardData.order = cardsInColumn.length > 0
        ? Math.max(...cardsInColumn.map((card: any) => card.order)) + 1
        : 0;
      
      // Generate a reference number (e.g., #12345)
      cardData.reference = `#${Math.floor(10000 + Math.random() * 90000)}`;
    }
    
    onSubmit(cardData);
    onDismiss();
  };
  
  // Handle label toggle
  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };
  
  // Decide whether to merge with a duplicate
  const handleMergeWithDuplicate = (duplicateCard: Card) => {
    // Combine the information from both cards
    const mergedCard: Partial<Card> = {
      ...duplicateCard,
      title: title || duplicateCard.title,
      description: description || duplicateCard.description,
      labels: Array.from(new Set([...selectedLabels, ...duplicateCard.labels])),
      updatedAt: Date.now()
    };
    
    onSubmit(mergedCard);
    onDismiss();
  };

  return (
    <ThemeProvider>
      {isOpen ? <Dialog
        onClose={onDismiss}
        aria-labelledby="clusters-dialog-title"
      >
        <Dialog.Header id="card-form-title">
          {editCard ? 'Edit Card' : 'Create New Card'}
        </Dialog.Header>
        
        <Box p={3}>
          {/* Duplicate warning */}
          {showDuplicates && duplicateCards.length > 0 && (
            <Flash variant="warning" sx={{ mb: 3 }}>
              <Text fontWeight="bold">Possible duplicate found ({Math.round(similarity * 100)}% similar)</Text>
              <Box mt={2}>
                {duplicateCards.map(card => (
                  <Box 
                    key={card.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'border.default',
                      borderRadius: 2,
                      mb: 2
                    }}
                  >
                    <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>{card.title}</Text>
                    {card.description && (
                      <Text as="p" sx={{ fontSize: 1, color: 'fg.muted', mt: 1 }}>
                        {card.description.length > 100 
                          ? `${card.description.substring(0, 100)}...` 
                          : card.description}
                      </Text>
                    )}
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button 
                        size="small"
                        onClick={() => handleMergeWithDuplicate(card)}
                      >
                        Merge with this card
                      </Button>
                      <Button 
                        size="small" 
                        variant="invisible"
                        onClick={() => setShowDuplicates(false)}
                      >
                        Continue anyway
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Flash>
          )}
          
          {/* Card form */}
          <form onSubmit={handleSubmit}>
            <FormControl sx={{ mb: 3 }}>
              <FormControl.Label htmlFor="card-title">Title</FormControl.Label>
              <TextInput
                id="card-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Card title"
                required
                aria-required="true"
                block
                sx={{ width: '100%' }}
              />
            </FormControl>
            
            <FormControl sx={{ mb: 3 }}>
              <FormControl.Label htmlFor="card-description">Description</FormControl.Label>
              <Textarea
                id="card-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Card description (optional)"
                rows={5}
                sx={{ width: '100%' }}
              />
            </FormControl>
            
            <FormControl sx={{ mb: 3 }}>
              <FormControl.Label htmlFor="card-column">Status</FormControl.Label>
              <Select
                id="card-column"
                value={columnId}
                onChange={e => setColumnId(e.target.value)}
                required
                aria-required="true"
                sx={{ width: '100%' }}
              >
                {sortedColumns.map(column => (
                  <Select.Option key={column.id} value={column.id}>
                    {column.title}
                  </Select.Option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ mb: 3 }}>
              <FormControl.Label>Labels</FormControl.Label>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {boardState.labels.map((label: any) => (
                  <Box 
                    key={label.id}
                    as="label"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      p: 2,
                      border: '1px solid',
                      borderColor: 'border.default',
                      borderRadius: 2,
                      cursor: 'pointer',
                      bg: selectedLabels.includes(label.id) ? 'canvas.subtle' : 'transparent',
                      ':hover': {
                        bg: 'canvas.subtle'
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLabels.includes(label.id)}
                      onChange={() => toggleLabel(label.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <Box
                      sx={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        bg: label.color,
                        mr: 1
                      }}
                    />
                    <Text>{label.name}</Text>
                  </Box>
                ))}
              </Box>
            </FormControl>
            
            <FormControl sx={{ mb: 3 }}>
              <FormControl.Label htmlFor="card-repository">Repository</FormControl.Label>
              <TextInput
                id="card-repository"
                value={repository}
                onChange={e => setRepository(e.target.value)}
                placeholder="github/repository"
                sx={{ width: '100%' }}
              />
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button variant="invisible" onClick={onDismiss}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={aiLoading}
              >
                {aiLoading ? <Spinner size="small" /> : editCard ? 'Update' : 'Create'}
              </Button>
            </Box>
          </form>
        </Box>
      </Dialog>
      : null}
    </ThemeProvider>
  );
};

export default CardFormDialog;