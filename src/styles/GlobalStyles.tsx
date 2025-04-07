import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Base HTML styles */
  html {
    box-sizing: border-box;
  }
  
  *, *:before, *:after {
    box-sizing: inherit;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background-color: #f6f8fa;
    color: #24292f;
    line-height: 1.5;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .mobile-column-scroll {
      overflow-x: auto;
    }
    
    .mobile-hide {
      display: none;
    }
  }

  /* Connection status indicators */
  .status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }

  .status-online {
    background-color: #2da44e;
  }

  .status-offline {
    background-color: #cf222e;
  }

  .status-partial {
    background-color: #bf8700;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* For hiding scrollbar but allowing scrolling */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Clippy container styles */
  .clippy-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }
`;

export default GlobalStyles;