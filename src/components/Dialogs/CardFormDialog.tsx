import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextInput, 
  Textarea, 
  Button, 
  FormControl, 
  Text,
  ThemeProvider,
  Spinner
} from '@primer/react';
import { Dialog } from '@primer/react/experimental';
import { Card } from '../../types';
import { useBoard } from '../../context/BoardContext';
import { v4 as uuidv4 } from 'uuid';
import aiService from '../../services/ai';

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
  const { state: boardState, dispatch } = useBoard();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [repository, setRepository] = useState('kanban-clippy');
  
  // Duplicate detection state
  const [duplicateCards, setDuplicateCards] = useState<Card[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false); // New state for progress indicator
  
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
      setColumnId(initialColumnId || (sortedColumns.length > 0 ? sortedColumns[0].id : ''));
      setSelectedLabels([]);
      setRepository('kanban-clippy');
    }
    
    setDuplicateCards([]);
    setShowDuplicates(false);
  }, [editCard, initialColumnId, isOpen]); 
  
  // Check for duplicates when title or description changes
  useEffect(() => {
    if (!title || editCard) return;

    const checkForDuplicates = async () => {
      setCheckingDuplicates(true); // Show progress indicator
      try {
        const result = await aiService.checkForDuplicates({
          id: uuidv4(),
          title,
          description,
        } as Card, boardState.cards);

        if (result.duplicates.length > 0) {
          setDuplicateCards(result.duplicates);
          setShowDuplicates(true);
        } else {
          setDuplicateCards([]);
          setShowDuplicates(false);
        }
      } catch (error) {
        console.error("Error checking for duplicates:", error);
      } finally {
        setCheckingDuplicates(false); // Hide progress indicator
      }
    };

    // Debounce the check
    const timer = setTimeout(() => {
      checkForDuplicates();
    }, 500);

    return () => clearTimeout(timer);
  }, [title, description, editCard]);
  
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
      
      // Update in our context
      dispatch({
        type: 'UPDATE_CARD',
        payload: { ...editCard, ...cardData } as Card
      });
    } else {
      cardData.createdAt = Date.now();
      // Set the order to be the highest in the column + 1
      const cardsInColumn = boardState.cards.filter((card: any) => card.columnId === columnId);
      cardData.order = cardsInColumn.length > 0
        ? Math.max(...cardsInColumn.map((card: any) => card.order)) + 1
        : 0;
      
      // Generate a reference number (e.g., #12345)
      cardData.reference = `#${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create a new ID
      const newId = uuidv4();
      cardData.id = newId;
      
      // Add to our context
      dispatch({
        type: 'ADD_CARD',
        payload: cardData as Card
      });
      
      // Update column item count
      const updatedColumn = boardState.columns.find(col => col.id === columnId);
      if (updatedColumn) {
        dispatch({
          type: 'UPDATE_COLUMN',
          payload: {
            ...updatedColumn,
            itemCount: updatedColumn.itemCount + 1
          }
        });
      }
    }
    
    // Pass to parent component for further processing
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
    
    // Update in our context
    dispatch({
      type: 'UPDATE_CARD',
      payload: mergedCard as Card
    });
    
    onSubmit(mergedCard);
    onDismiss();
  };

  return (
    <ThemeProvider>
      {isOpen ? (
        <Dialog
          title={editCard ? 'Edit Card' : 'Create New Card'}
          onClose={onDismiss}
          aria-labelledby="card-form-title"
          footerButtons={[
            {
              buttonType: 'default',
              content: 'Cancel',
              onClick: onDismiss,
            },
            {
              buttonType: 'primary',
              content: editCard ? 'Update' : 'Create',
              onClick: handleSubmit,
              disabled: checkingDuplicates, // Disable button while checking duplicates
            },
          ]}
          sx={{
            zIndex: 1050, // Ensure the dialog is above other elements
            position: 'relative', // Ensure z-index is applied correctly
          }}
        >
          <Box p={3}>
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
                  sx={{ width: '100%', p: 2 }}
                />
              </FormControl>

              {/* Duplicate warning */}
              {checkingDuplicates ? (
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Spinner size="small" />
                  <Text>Checking for duplicates...</Text>
                </Box>
              ) : showDuplicates && duplicateCards.length > 0 && (
                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  borderRadius: 2,
                  bg: 'attention.subtle',
                  borderColor: 'attention.muted',
                  borderWidth: 1,
                  borderStyle: 'solid'
                }}>
                  <Text fontWeight="bold">Possible duplicates found:</Text>
                  <Box mt={2}>
                    {duplicateCards.map(card => (
                      <Box 
                        key={card.id}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'border.default',
                          borderRadius: 2,
                          mb: 2,
                          bg: 'canvas.default'
                        }}
                      >
                        <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>{card.title}</Text>
                        <Box
                          sx={{
                            mt: 2,
                            display: 'flex',
                            gap: 2,
                            flexgrow: 1
                          }}
                        >
                          <Button 
                            size="small"
                            onClick={() => handleMergeWithDuplicate(card)}
                            sx={{
                              ':focus': {
                                outline: '2px solid',
                                outlineColor: 'accent.fg',
                              },
                            }}
                          >
                            Merge with this card
                          </Button>
                          <Button 
                            size="small" 
                            variant="invisible"
                            onClick={() => setShowDuplicates(false)}
                            sx={{
                              ':focus': {
                                outline: '2px solid',
                                outlineColor: 'accent.fg',
                              },
                            }}
                          >
                            Continue anyway
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <FormControl sx={{ mb: 3 }}>
                <FormControl.Label htmlFor="card-description">Description</FormControl.Label>
                <Textarea
                  id="card-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Card description (optional)"
                  rows={5}
                  sx={{ width: '100%', p: 2 }}
                />
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
                        cursor: 'pointer',
                        ':hover': {
                          bg: 'canvas.subtle'
                        },
                        ':focus-within': {
                          outline: '2px solid',
                          outlineColor: 'accent.fg',
                          borderRadius: 2,
                        },
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
                  sx={{ width: '100%', p: 2 }}
                />
              </FormControl>
            </form>
          </Box>
        </Dialog>
      ) : null}
    </ThemeProvider>
  );
};

export default CardFormDialog;