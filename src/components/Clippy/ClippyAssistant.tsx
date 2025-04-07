import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  ThemeProvider,
  Heading,
  Avatar
} from '@primer/react';
import { XIcon, LightBulbIcon, InfoIcon } from '@primer/octicons-react';
import { useNetwork } from '../../context/NetworkContext';

interface ClippyMessage {
  id: string;
  content: string;
  type: 'info' | 'suggestion' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

interface ClippyAssistantProps {
  messages: ClippyMessage[];
  onDismissMessage: (id: string) => void;
}

const ClippyAssistant: React.FC<ClippyAssistantProps> = ({
  messages,
  onDismissMessage
}) => {
  const { state: networkState } = useNetwork();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'thinking' | 'talking'>('idle');
  
  // Show Clippy when there are messages
  useEffect(() => {
    if (messages.length > 0 && !isVisible) {
      setIsVisible(true);
      setAnimationState('talking');
      
      // Return to idle after a brief animation
      const timer = setTimeout(() => {
        setAnimationState('idle');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [messages, isVisible]);
  
  // Hide when there are no messages
  useEffect(() => {
    if (messages.length === 0 && isVisible && !isExpanded) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [messages, isVisible, isExpanded]);
  
  // Handle toggle expand
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setAnimationState('talking');
      setTimeout(() => setAnimationState('idle'), 1000);
    }
  };
  
  if (!isVisible && messages.length === 0) {
    return null;
  }
  
  // Get icon for message type
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return <LightBulbIcon size={16} />;
      case 'warning':
        return <InfoIcon size={16} />;
      case 'info':
      default:
        return <InfoIcon size={16} />;
    }
  };
  
  return (
    <ThemeProvider>
      <Box
        sx={{
          position: 'fixed',
          bottom: 3,
          right: 3,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        {/* Messages panel */}
        {isExpanded && messages.length > 0 && (
          <Box
            sx={{
              width: '300px',
              maxHeight: '400px',
              overflow: 'auto',
              mb: 2,
              bg: 'canvas.default',
              boxShadow: 'shadow.large',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'border.default',
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'border.default' }}>
              <Heading as="h3" sx={{ fontSize: 2 }}>Clippy Assistant</Heading>
            </Box>
            
            <Box sx={{ p: 2 }}>
            {messages.map(message => (
                <Box
                  key={message.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 1,
                    bg: message.type === 'warning' ? 'attention.subtle' : 'canvas.subtle',
                    position: 'relative',
                    border: '1px solid',
                    borderColor: 'border.muted',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box 
                      sx={{ 
                        mr: 2, 
                        color: message.type === 'warning' ? 'attention.fg' : 
                              message.type === 'suggestion' ? 'success.fg' : 'accent.fg'
                      }}
                    >
                      {getMessageIcon(message.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Text as="p" sx={{ fontSize: 1, mb: message.action ? 2 : 0 }}>
                        {message.content}
                      </Text>
                      
                      {message.action && (
                        <Button 
                          size="small" 
                          onClick={message.action.onClick}
                          sx={{ mt: 1 }}
                        >
                          {message.action.label}
                        </Button>
                      )}
                    </Box>
                    
                    {message.dismissible !== false && (
                      <Button 
                        variant="invisible"
                        size="small"
                        aria-label="Dismiss message"
                        onClick={() => onDismissMessage(message.id)}
                        sx={{ 
                          p: 1, 
                          position: 'absolute',
                          top: 1,
                          right: 1
                        }}
                      >
                        <XIcon size={12} />
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
              
              {messages.length === 0 && (
                <Text as="p" sx={{ color: 'fg.muted', textAlign: 'center', p: 3 }}>
                  No messages at the moment.
                </Text>
              )}
            </Box>
          </Box>
        )}
        
        {/* Clippy character */}
        <Box
          sx={{
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            ':hover': {
              transform: 'scale(1.05)',
            },
          }}
          onClick={toggleExpand}
        >
          {/* Message count badge */}
          {messages.length > 0 && !isExpanded && (
            <Box
              sx={{
                position: 'absolute',
                top: -5,
                right: -5,
                bg: 'danger.emphasis',
                color: 'white',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 0,
                fontWeight: 'bold',
                zIndex: 1,
              }}
            >
              {messages.length}
            </Box>
          )}
          
          {/* Connection status indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              bg: networkState.llmConnected ? 'success.emphasis' : 'attention.emphasis',
              border: '2px solid',
              borderColor: 'canvas.default',
              zIndex: 1,
            }}
          />
          
          {/* Clippy Image */}
          <Box
            sx={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              bg: 'canvas.default',
              boxShadow: 'shadow.medium',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              // Animation based on state
              animation: animationState === 'idle' ? 'none' :
                         animationState === 'thinking' ? 'pulse 1.5s infinite' :
                         'bounce 0.5s 2',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
              },
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.6 },
              },
            }}
          >
            <img 
              src="/clippy.png" 
              alt="Clippy Assistant" 
              style={{ 
                width: '80%', 
                height: '80%', 
                objectFit: 'contain'
              }} 
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ClippyAssistant;