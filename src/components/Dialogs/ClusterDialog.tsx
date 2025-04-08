import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  Box, 
  Text, 
  ThemeProvider,
  Spinner,
  Flash,
  Heading
} from '@primer/react';
import { InfoIcon } from '@primer/octicons-react';
import { useBoard } from '../../context/BoardContext';
import { useAI } from '../../hooks/useAI'; // Import useAI hook
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
  const { analyzeClusters, loading, error } = useAI(); // Use AI hook
  
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  
  // Load clusters when dialog opens
  useEffect(() => {
    if (isOpen) {
      generateClusters();
    }
  }, [isOpen]);

  // Generate new clusters using the AI hook
  const generateClusters = async () => {
    try {
      const response = await analyzeClusters(boardState.cards);

      // Map the response to include card IDs directly
      const newClusters: Cluster[] | [] = Array.isArray(response.clusters)
        ? response.clusters.map(cluster => ({
            id: cluster.clusterName, // Use clusterName as the ID
            title: cluster.clusterName,
            description: `Cluster of cards related to ${cluster.clusterName}`,
            cardIds: cluster.cards.map(card => card.id).filter((id): id is string => id !== undefined), // Filter out undefined IDs
            cards: cluster.cards,
            createdAt: Date.now(),
            clusterName: cluster.clusterName
          }))
        : [];

      setClusters(newClusters);

      if (newClusters.length > 0) {
        setSelectedClusterId(newClusters[0].id);
      } else {
        setSelectedClusterId(null); // Reset selected cluster if no clusters are available
      }
    } catch (err) {
      setClusters([]); // Reset clusters on error
      setSelectedClusterId(null); // Reset selected cluster on error
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
      {isOpen ? (
        <Dialog 
          title="Card Clusters"
          onClose={onDismiss}
          aria-labelledby="clusters-dialog-title"
          className="clusters-dialog"
        >
          <Box id="andri" sx={{ display: 'flex', height: '500px', padding: 0 }}>
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
              {error && (
                <Flash variant="danger" sx={{ mb: 3 }}>
                  {error.message || 'Failed to generate clusters.'}
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
                <Box>
                  {clusters.map(cluster => (
                    <Box
                      key={cluster.id}
                      sx={{
                        p: 2,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        mb: 1,
                        bg: selectedClusterId === cluster.id ? 'canvas.subtle' : 'transparent',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: selectedClusterId === cluster.id ? 'border.default' : 'transparent',
                        ':hover': {
                          bg: 'canvas.subtle'
                        }
                      }}
                      onClick={() => setSelectedClusterId(cluster.id)}
                    >
                      <Text sx={{ fontWeight: selectedClusterId === cluster.id ? 'bold' : 'normal' }}>
                        {cluster.title}
                        <Text as="span" sx={{ fontSize: 0, color: 'fg.muted', ml: 1 }}>
                          ({cluster.cardIds.length})
                        </Text>
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            
            {/* Right side with cluster details */}
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
              {selectedCluster ? (
                <>
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
        </Dialog>
      ): null}
    </ThemeProvider>
  );
};

export default ClusterDialog;