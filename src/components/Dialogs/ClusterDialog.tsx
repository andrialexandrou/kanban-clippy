import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  Box, 
  Text, 
  Button, 
  Heading, 
  ThemeProvider,
  Spinner,
  Flash,
  UnderlineNav
} from '@primer/react';
import { XIcon, InfoIcon, SyncIcon } from '@primer/octicons-react';
import { useBoard } from '../../context/BoardContext';
import { useFirestore } from '../../hooks/useFirestore';
import { useAI } from '../../hooks/useAI';
import { Card, Cluster } from '../../types';

interface ClusterDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  onViewCard: (cardId: string) => void;
}

const ClusterDialog: React.FC<ClusterDialogProps> = ({
  isOpen,
  onDismiss,
  onViewCard
}) => {
  const { state: boardState } = useBoard();
  const { fetchClusters, createClusters } = useFirestore(boardState.id);
  const { isLLMConnected } = useAI();
  
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  
  // Load clusters when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadClusters();
    }
  }, [isOpen]);
  
  // Load existing clusters
  const loadClusters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const loadedClusters = await fetchClusters();
      setClusters(loadedClusters);
      
      if (loadedClusters.length > 0) {
        setSelectedClusterId(loadedClusters[0].id);
      } else {
        setSelectedClusterId(null);
      }
    } catch (err) {
      setError('Failed to load clusters. Please try again later.');
      console.error('Error loading clusters:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate new clusters
  const generateClusters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isLLMConnected) {
        throw new Error('LLM is not connected. Please check your network connection and try again.');
      }
      
      const newClusters = await createClusters(boardState.cards);
      setClusters(newClusters);
      
      if (newClusters.length > 0) {
        setSelectedClusterId(newClusters[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate clusters.');
      console.error('Error generating clusters:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Find cards for the selected cluster
  const getCardsForCluster = (clusterId: string): Card[] => {
    const cluster = clusters.find(c => c.id === clusterId);
    if (!cluster) return [];
    
    return boardState.cards.filter((card: any) => cluster.cardIds.includes(card.id));
  };
  
  // Get the selected cluster
  const selectedCluster = selectedClusterId 
    ? clusters.find(c => c.id === selectedClusterId) 
    : null;
  
  // Get cards for the selected cluster
  const clusterCards = selectedClusterId 
    ? getCardsForCluster(selectedClusterId)
    : [];
  
  return (
    <ThemeProvider>
      {isOpen ? <Dialog 
        onClose={onDismiss}
        aria-labelledby="clusters-dialog-title"
        width="large"
      >
        <Dialog.Header id="clusters-dialog-title">
          Card Clusters
        </Dialog.Header>
        
        <Box sx={{ display: 'flex', height: '500px' }}>
          {/* Left sidebar with cluster list */}
          <Box 
            sx={{ 
              width: '260px', 
              borderRight: '1px solid', 
              borderColor: 'border.default',
              p: 2,
              overflow: 'auto'
            }}
          >
            <Box sx={{ mb: 3 }}>
            <Button 
                onClick={generateClusters}
                variant="primary"
                disabled={loading || !isLLMConnected}
                sx={{ width: '100%' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SyncIcon size={16} className="mr-8" />
                  {loading ? <Spinner size="small" /> : 'Regenerate Clusters'}
                </Box>
              </Button>
              
              {!isLLMConnected && (
                <Text sx={{ color: 'attention.fg', fontSize: 0, mt: 1 }}>
                  LLM connection required
                </Text>
              )}
            </Box>
            
            {error && (
              <Flash variant="danger" sx={{ mb: 3 }}>
                {error}
              </Flash>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Spinner />
              </Box>
            ) : clusters.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ color: 'fg.muted', mb: 2 }}>
                  <InfoIcon size={24} />
                </Box>
                <Text>No clusters available. Generate clusters to categorize related cards.</Text>
              </Box>
            ) : (
              <UnderlineNav aria-label="Clusters" sx={{ display: 'block' }}>
                {clusters.map(cluster => (
                  <UnderlineNav aria-label="Clusters" sx={{ display: 'block' }}>
                  {clusters.map(cluster => (
                    <UnderlineNav.Item
                      key={cluster.id}
                      aria-selected={selectedClusterId === cluster.id}
                      onClick={() => setSelectedClusterId(cluster.id)}
                      sx={{ 
                        cursor: 'pointer',
                        display: 'block',
                        mb: 1,
                        fontSize: 1
                      }}
                    >
                      {cluster.title}
                      <Text sx={{ fontSize: 0, color: 'fg.muted', ml: 1 }}>
                        ({cluster.cardIds.length})
                      </Text>
                    </UnderlineNav.Item>
                  ))}
                </UnderlineNav>
                ))}
              </UnderlineNav>
            )}
          </Box>
          
          {/* Right side with cluster details */}
          <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            {selectedCluster ? (
              <>
                <Heading as="h2" sx={{ fontSize: 3, mb: 2 }}>
                  {selectedCluster.title}
                </Heading>
                
                <Text as="p" sx={{ color: 'fg.muted', mb: 3 }}>
                  {selectedCluster.description}
                </Text>
                
                <Heading as="h3" sx={{ fontSize: 2, mb: 2 }}>
                  Cards in this Cluster
                </Heading>
                
                {clusterCards.length === 0 ? (
                  <Text>No cards found in this cluster.</Text>
                ) : (
                  clusterCards.map(card => (
                    <Box
                      key={card.id}
                      sx={{ 
                        p: 3, 
                        mb: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'border.default',
                        ':hover': {
                          bg: 'canvas.subtle'
                        }
                      }}
                      onClick={() => onViewCard(card.id)}
                    >
                      <Text sx={{ color: 'fg.muted', fontSize: 1, mb: 1 }}>
                        {card.reference}
                      </Text>
                      <Heading as="h4" sx={{ fontSize: 2, mb: 1 }}>
                        {card.title}
                      </Heading>
                      {card.description && (
                        <Text as="p" sx={{ color: 'fg.muted', fontSize: 1 }}>
                          {card.description.length > 100 
                            ? `${card.description.substring(0, 100)}...` 
                            : card.description}
                        </Text>
                      )}
                    </Box>
                  ))
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Box sx={{ color: 'fg.muted', mb: 3 }}>
                  <InfoIcon size={32} />
                </Box>
                <Text sx={{ color: 'fg.muted', textAlign: 'center' }}>
                  Select a cluster from the sidebar to view details.
                </Text>
              </Box>
            )}
          </Box>
        </Box>
        
        <Dialog.Footer>
          <Button variant="invisible" onClick={onDismiss}>
            Close
          </Button>
        </Dialog.Footer>
      </Dialog>
      :null}
    </ThemeProvider>
  );
};

export default ClusterDialog;