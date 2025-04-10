import React from 'react';
import { 
  Header as PrimerHeader, 
  Box, 
  Text, 
  Button, 
  ActionMenu,
  ActionList,
  Avatar, 
  IconButton,
  ThemeProvider,
  Heading,
  Tooltip
} from '@primer/react';
import {
  LockIcon,
  KebabHorizontalIcon,
  PlusIcon,
  ProjectIcon,
  ListUnorderedIcon,
  IterationsIcon
} from '@primer/octicons-react';
import styled from 'styled-components';
import { useNetwork } from '../../context/NetworkContext';
import { useBoard } from '../../context/BoardContext';

interface HeaderProps {
  onAddCard: () => void;
  onViewClusters: () => void;
  onViewBoard: () => void;
}

// Styled components
const HeaderContainer = styled(PrimerHeader)`
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-default);
  background-color: rgba(246, 248, 250, 1);
  color: var(--color-header-text);
`;

const StatusIndicator = styled.span<{ status: 'online' | 'offline' | 'partial' }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background-color: ${props => 
    props.status === 'online' ? 'var(--color-success-fg)' : 
    props.status === 'offline' ? 'var(--color-danger-fg)' : 
    'var(--color-attention-fg)'};
`;

const StatusContainer = styled(Box)`
  display: flex;
  align-items: center;
  margin-right: 16px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TabNavContainer = styled(Box)`
  @media (max-width: 768px) {
    display: none;
  }
`;

// Define the Header component
const Header: React.FC<HeaderProps> = ({ onAddCard, onViewClusters, onViewBoard }) => {
  const { state: networkState } = useNetwork();
  const { state: boardState } = useBoard();

  return (
    <HeaderContainer>
      {/* Left side - Board title and lock icon */}
      <Box display="flex" alignItems="center">
        <Heading sx={{ fontSize: 3, display: 'flex', alignItems: 'center' }}>
          {boardState.title || "Kanban Clippy"}
          &nbsp;
          <LockIcon className="ml-2" />
        </Heading>
      </Box>

      {/* Center - Tab navigation */}
      <PrimerHeader.Item sx={{ display: ['none', 'none', 'flex'], justifyContent: 'center', flex: 1 }}>
        <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'border.muted' }}>
          <Box 
            as="a" 
            href="#" 
            onClick={onViewBoard}
            sx={{ 
              px: 3, 
              py: 2, 
              fontWeight: 'semibold', 
              textDecoration: 'none',
              borderColor: 'accent.fg',
              color: 'fg.default'
            }}
          >
            Board
          </Box>
          <Box 
            as="a" 
            href="#" 
            onClick={onViewClusters}
            sx={{ 
              px: 3, 
              py: 2, 
              textDecoration: 'none',
              fontWeight: 'semibold',
              color: 'fg.default',
              ':hover': { color: 'fg.default' },
              cursor: 'pointer'
            }}
          >
            Clusters
          </Box>
        </Box>
      </PrimerHeader.Item>

      {/* Right side - Actions and status */}
      <Box display="flex" alignItems="center">
        {/* Network status */}
        <StatusContainer>
          <Box 
            title={networkState.online ? "Network connected" : "Network disconnected"}
            mr={3} 
            display="flex" 
            alignItems="center"
          >
            <Text fontSize={1} mr={1}>Network:</Text>
            <StatusIndicator status={networkState.online ? 'online' : 'offline'} />
          </Box>
          <Box 
            title={networkState.llmConnected ? "LLM connected" : "LLM disconnected"}
            display="flex" 
            alignItems="center"
          >
            <Text fontSize={1} mr={1}>LLM:</Text>
            <StatusIndicator status={networkState.llmConnected ? 'online' : 'partial'} />
          </Box>
        </StatusContainer>

        {/* Add card button */}
        <Button onClick={onAddCard} variant="primary" size="small">
          <PlusIcon className="mr-1" />
          New Card
        </Button>

        {/* Mobile menu button */}
        <Box display={['block', 'block', 'none']} ml={2}>
          <ActionMenu>
            <ActionMenu.Anchor>
              <Button variant="invisible" sx={{ color: 'fg.onEmphasis' }}>
                <KebabHorizontalIcon />
              </Button>
            </ActionMenu.Anchor>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item onSelect={() => onViewClusters()}>
                  <ActionList.LeadingVisual>
                    <ProjectIcon />
                  </ActionList.LeadingVisual>
                  Clusters
                </ActionList.Item>
                <ActionList.Item onSelect={() => {}}>
                  <ActionList.LeadingVisual>
                    <ListUnorderedIcon />
                  </ActionList.LeadingVisual>
                  Backlog
                </ActionList.Item>
                <ActionList.Divider />
                <ActionList.Item variant="danger">
                  Network: {networkState.online ? 'Online' : 'Offline'}
                </ActionList.Item>
                <ActionList.Item variant={networkState.llmConnected ? 'default' : 'danger'}>
                  LLM: {networkState.llmConnected ? 'Connected' : 'Disconnected'}
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Box>
      </Box>
    </HeaderContainer>
  );
};

export default Header;