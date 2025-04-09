import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  Box, 
  Text, 
  ThemeProvider,
  Spinner,
  Flash,
  Heading,
  Button
} from '@primer/react';
import { InfoIcon, SyncIcon } from '@primer/octicons-react';
import { useBoard } from '../../context/BoardContext';
import aiService from '../../services/ai'; // Use aiService directly
import { Cluster, Card } from '../../types';

// Add cache keys for localStorage
const CLUSTERS_CACHE_KEY = 'kanban-clippy-clusters';
const CLUSTERS_TIMESTAMP_KEY = 'kanban-clippy-clusters-timestamp';
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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
  
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'fresh' | 'stale' | 'none'>('none');
  
  // Load clusters when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Try to load from cache first
      const cachedClusters = loadClustersFromCache();
      
      if (cachedClusters) {
        setClusters(cachedClusters);
        if (cachedClusters.length > 0) {
          setSelectedClusterId(cachedClusters[0].id);
        }
        setCacheStatus('fresh');
      } else {
        // No valid cache, generate new clusters
        generateClusters();
      }
    }
  }, [isOpen]);

  // Check if the cached clusters are still relevant to current cards
  const areClustersCurrent = (clusters: Cluster[]): boolean => {
    // Get all card IDs from clusters
    const clusterCardIds = clusters.flatMap(c => c.cardIds);
    const currentCardIds = boardState.cards.map(c => c.id);
    
    // Check if there are significant differences between the sets
    let cardsAdded = 0;
    let cardsRemoved = 0;
    
    const clusterCardSet = new Set(clusterCardIds);
    const currentCardSet = new Set(currentCardIds);
    
    for (const id of currentCardIds) {
      if (!clusterCardSet.has(id)) cardsAdded++;
    }
    
    for (const id of clusterCardIds) {
      if (!currentCardSet.has(id)) cardsRemoved++;
    }
    
    // Consider clusters outdated if more than 20% of cards changed
    const totalCards = Math.max(clusterCardIds.length, currentCardIds.length);
    const changePercentage = (cardsAdded + cardsRemoved) / totalCards;
    
    return changePercentage < 0.2; // Less than 20% change
  };

  // Load clusters from localStorage cache
  const loadClustersFromCache = (): Cluster[] | null => {
    try {
      const cachedClustersJson = localStorage.getItem(CLUSTERS_CACHE_KEY);
      const cachedTimestampStr = localStorage.getItem(CLUSTERS_TIMESTAMP_KEY);
      
      if (!cachedClustersJson || !cachedTimestampStr) return null;
      
      const cachedClusters: Cluster[] = JSON.parse(cachedClustersJson);
      const cachedTimestamp = parseInt(cachedTimestampStr, 10);
      const now = Date.now();
      
      // Check if cache is expired or if board has changed significantly
      if (now - cachedTimestamp > CACHE_EXPIRY_TIME || !areClustersCurrent(cachedClusters)) {
        setCacheStatus('stale');
        return cachedClusters; // Return stale data but mark it as stale
      }
      
      return cachedClusters;
    } catch (err) {
      console.error('Error loading clusters from cache:', err);
      return null;
    }
  };
  
  // Save clusters to localStorage cache
  const saveClustersToCache = (clusters: Cluster[]) => {
    try {
      const timestamp = Date.now().toString();
      localStorage.setItem(CLUSTERS_CACHE_KEY, JSON.stringify(clusters));
      localStorage.setItem(CLUSTERS_TIMESTAMP_KEY, timestamp);
      console.log('Saved clusters to cache with timestamp:', timestamp);
      setCacheStatus('fresh');
    } catch (err) {
      console.error('Error saving clusters to cache:', err);
    }
  };

  // Generate new clusters using the ai.ts service
  const generateClusters = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // If we're not forcing a refresh and we have a fresh cache, use that
      if (!forceRefresh && cacheStatus === 'fresh') {
        const cachedClusters = loadClustersFromCache();
        if (cachedClusters) {
          setClusters(cachedClusters);
          if (cachedClusters.length > 0) {
            setSelectedClusterId(cachedClusters[0].id);
          }
          setLoading(false);
          return;
        }
      }

      const response = await aiService.generateClusters(boardState.cards);

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
      
      // Ensure clusters are saved to localStorage
      if (newClusters.length > 0) {
        saveClustersToCache(newClusters);
        console.log('Clusters saved to localStorage:', newClusters.length);
      }

      if (newClusters.length > 0) {
        setSelectedClusterId(newClusters[0].id);
      } else {
        setSelectedClusterId(null); // Reset selected cluster if no clusters are available
      }
    } catch (err) {
      console.error('Error generating clusters:', err);
      setError('Failed to generate clusters.');
      setClusters([]); // Reset clusters on error
      setSelectedClusterId(null); // Reset selected cluster on error
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
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                  variant="primary" 
                  size="small"
                  leadingVisual={SyncIcon}
                  onClick={() => generateClusters(true)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Re-cluster'}
                </Button>
                
                {cacheStatus === 'stale' && !loading && (
                  <Text sx={{ fontSize: 0, color: 'attention.fg', ml: 1 }}>Outdated</Text>
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