import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  ThemeProvider,
  Spinner,
  Flash,
  Heading,
  Button,
} from '@primer/react';
import { InfoIcon, CheckCircleIcon, SyncIcon } from '@primer/octicons-react';
import { useBoard } from '../../context/BoardContext';
import aiService from '../../services/ai';
import { Cluster, Card } from '../../types';

interface ClusterViewProps {
  onViewCard: (cardId: string) => void;
}

const ClusterView: React.FC<ClusterViewProps> = ({
  onViewCard
}) => {
  const { state: boardState } = useBoard();
  
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load clusters when component mounts
  useEffect(() => {
    // Check if there are cached clusters in localStorage first
    const cardsSignature = boardState.cards.map(c => c.id).sort().join(',');
    const cachedClusters = aiService.getCachedClusters(cardsSignature);
    
    if (cachedClusters && cachedClusters.clusters && cachedClusters.clusters.length > 0) {
      // Use cached clusters if available
      const newClusters: Cluster[] = cachedClusters.clusters.map(cluster => ({
        id: cluster.clusterName,
        title: cluster.clusterName,
        description: `Cluster of cards related to ${cluster.clusterName}`,
        cardIds: cluster.cards.map(card => card.id).filter((id): id is string => id !== undefined),
        cards: cluster.cards,
        createdAt: Date.now(),
        clusterName: cluster.clusterName
      }));
      
      setClusters(newClusters);
      if (newClusters.length > 0) {
        setSelectedClusterId(newClusters[0].id);
      }
    } else {
      // Generate new clusters if no cache is available
      generateClusters();
    }
  }, [boardState.cards]);

  // Generate new clusters using the ai.ts service
  const generateClusters = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.generateClusters(boardState.cards, forceRefresh);

      // Map the response to include card IDs directly
      const newClusters: Cluster[] | [] = Array.isArray(response.clusters)
        ? response.clusters.map(cluster => ({
            id: cluster.clusterName, // Use clusterName as the ID
            title: cluster.clusterName,
            description: `Cluster of cards related to ${cluster.clusterName}`,
            cardIds: cluster.cards.map(card => card.id).filter((id): id is string => id !== undefined),
            cards: cluster.cards,
            createdAt: Date.now(),
            clusterName: cluster.clusterName
          }))
        : [];

      setClusters(newClusters);

      if (newClusters.length > 0) {
        setSelectedClusterId(newClusters[0].id);
      } else {
        setSelectedClusterId(null);
      }
    } catch (err) {
      setError('Failed to generate clusters.');
      setClusters([]);
      setSelectedClusterId(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh click - force refresh from API
  const handleRefreshClick = () => {
    // Clear the selected cluster immediately to give visual feedback
    setSelectedClusterId(null);
    generateClusters(true);
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
    <Box sx={{ 
      display: 'flex', 
      height: 'calc(100vh - 72px)', 
      borderTop: '1px solid', 
      borderColor: 'border.default' 
    }}>
      {/* Left sidebar with cluster list */}
      <Box 
        sx={{ 
          width: '380px', 
          borderRight: '1px solid', 
          borderColor: 'border.default',
          p: 3,
          overflow: 'auto',
          bg: 'canvas.subtle'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Heading as="h3" sx={{ fontSize: 2 }}>Clusters</Heading>
          <Button 
            size="small" 
            variant="invisible" 
            onClick={handleRefreshClick}
            aria-label="Refresh clusters"
            disabled={loading}
            sx={{ 
              p: '4px', 
              color: 'fg.muted',
              '&:hover': { color: 'fg.default' } 
            }}
          >
            <SyncIcon size={16} />
          </Button>
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
          <Box>
            {clusters.map(cluster => (
              <Box
                key={cluster.id}
                sx={{
                  p: 2,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  mb: 2,
                  bg: selectedClusterId === cluster.id ? 'accent.subtle' : 'canvas.subtle',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: selectedClusterId === cluster.id ? 'accent.muted' : 'transparent',
                  ':hover': {
                    bg: selectedClusterId === cluster.id ? 'accent.subtle' : 'canvas.inset'
                  }
                }}
                onClick={() => setSelectedClusterId(cluster.id)}
              >
                <Text 
                  sx={{ 
                    // Always use the same font weight to prevent layout shifts
                    fontWeight: 'semibold',
                    // Use color to indicate selection instead of font weight
                    color: selectedClusterId === cluster.id ? 'fg.default' : 'fg.muted',
                    display: 'block'
                  }}
                >
                  {cluster.title}
                  <Text 
                    as="span" 
                    sx={{ 
                      fontSize: 0, 
                      color: 'fg.muted', 
                      ml: 1,
                      // Ensure consistent rendering of the count
                      fontWeight: 'normal'
                    }}
                  >
                    ({cluster.cardIds.length})
                  </Text>
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      
      {/* Right side with cluster details in table format */}
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Table Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {selectedCluster ? (
            <>
              {clusterCards.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <Text>No cards found in this cluster.</Text>
                </Box>
              ) : (
                clusterCards.map((card, index) => (
                  <Box
                    key={card.id}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      p: 3,
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderBottom: index < clusterCards.length - 1 ? '1px solid' : 'none',
                      borderColor: 'border.default',
                      cursor: 'pointer',
                    }}
                    onClick={() => onViewCard(card.id)}
                  >
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span>
                        <Text sx={{ fontWeight: 'bold', mb: 1 }}>{card.title}</Text>
                        &nbsp;
                        <Text sx={{color: 'fg.muted', fontSize: '14px'}}>{card.reference}</Text>
                      </span>
                    </Box>
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
    </Box>
  );
};

export default ClusterView;
