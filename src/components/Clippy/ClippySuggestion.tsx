import React from 'react';
import { 
  Box, 
  Text, 
  Button, 
  ThemeProvider
} from '@primer/react';
import { LightBulbIcon } from '@primer/octicons-react';

interface ClippySuggestionProps {
  title: string;
  content: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: () => void;
}

const ClippySuggestion: React.FC<ClippySuggestionProps> = ({
  title,
  content,
  primaryAction,
  secondaryAction,
  onDismiss
}) => {
  return (
    <ThemeProvider>
      <Box
        sx={{
          p: 3,
          maxWidth: '350px',
          bg: 'canvas.default',
          boxShadow: 'shadow.medium',
          borderRadius: 2,
          position: 'relative',
          border: '1px solid',
          borderColor: 'border.default',
        }}
      >
        {/* Speech bubble arrow */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10px',
            right: '35px',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid',
            borderTopColor: 'border.default',
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            bottom: '-8px',
            right: '36px',
            width: 0,
            height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '9px solid',
            borderTopColor: 'canvas.default',
            zIndex: 1,
          }}
        />
        
        {/* Content */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ mr: 2, color: 'success.fg' }}>
            <LightBulbIcon size={20} />
          </Box>
          <Box>
            <Text sx={{ fontWeight: 'bold', mb: 1 }}>{title}</Text>
            <Text as="p" sx={{ color: 'fg.muted', fontSize: 1 }}>
              {content}
            </Text>
          </Box>
        </Box>
        
        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            variant="invisible" 
            size="small"
            onClick={onDismiss}
            sx={{ mr: 2 }}
          >
            Dismiss
          </Button>
          
          {secondaryAction && (
            <Button 
              variant="invisible" 
              size="small"
              onClick={secondaryAction.onClick}
              sx={{ mr: 2 }}
            >
              {secondaryAction.label}
            </Button>
          )}
          
          {primaryAction && (
            <Button 
              size="small"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ClippySuggestion;