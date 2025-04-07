import { theme as primerTheme } from '@primer/react';
console.log('primerTheme', primerTheme);
// Extend the primer theme with custom values
const theme = {
  ...primerTheme,
  colors: {
    // ...primerTheme.colors,
    // Add any custom colors here if needed
  },
  fonts: {
    ...primerTheme.fonts,
    normal: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  // Custom breakpoints for responsive design
  breakpoints: ['544px', '768px', '1012px', '1280px'],
  // Custom space values
  space: [0, 4, 8, 16, 24, 32, 40, 48, 64, 80, 96, 112, 128],
};

export default theme;