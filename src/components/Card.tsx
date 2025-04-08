import React from 'react';
import { Box, Text } from '@primer/react';

interface CardProps {
  title: string;
  description?: string;
}

const Card: React.FC<CardProps> = ({ title, description }) => {
  return (
    <Box
      sx={{
        alignitems: 'center', // Changed from alignItems to alignitems
        justifycontent: 'space-between', // Changed from justifyContent to justifycontent
        flexwrap: 'wrap', // Changed from flexWrap to flexwrap
        flexdirection: 'row', // Changed from flexDirection to flexdirection
        bordertop: '1px solid', // Changed from borderTop to bordertop
        bordercolor: 'border.default' // Changed from borderColor to bordercolor
      }}
    >
      <Text as="h3">{title}</Text>
      {description && <Text as="p">{description}</Text>}
    </Box>
  );
};

export default Card;