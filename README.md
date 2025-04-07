# Kanban Clippy

A GitHub Projects-inspired kanban board with Clippy assistant integration and LLM features.

## Features

- **Kanban Board**: Drag-and-drop cards between columns to track progress
- **GitHub-like UI**: Designed to match GitHub Projects interface
- **AI Integration**: Uses Vercel AI SDK for intelligent features
- **Clippy Assistant**: Nostalgic Microsoft Office assistant for helpful suggestions
- **Duplicate Detection**: AI warns you when creating potentially duplicate cards
- **Cluster Analysis**: AI groups related cards into clusters for better organization
- **Offline Support**: Continue working even when disconnected
- **Responsive Design**: Works on mobile devices
- **Firebase Integration**: Persistent storage with real-time updates

## Technology Stack

- **React**: Frontend framework with TypeScript
- **Firebase**: Backend and storage
- **GitHub Primer**: UI component library for GitHub-like appearance
- **dnd-kit**: Drag and drop functionality
- **Vercel AI SDK**: Large Language Model integration

## Getting Started

1. Clone the repository
   ```
   git clone https://github.com/yourusername/kanban-clippy.git
   cd kanban-clippy
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Add your Firebase configuration
   - Create a Firebase project
   - Enable Firestore
   - Update `src/services/firebase.ts` with your Firebase config

4. Add your OpenAI API key
   - Create a `.env` file in the root directory
   - Add `REACT_APP_OPENAI_API_KEY=your_api_key_here`

5. Start the development server
   ```
   npm start
   ```

## Usage

### Creating Cards
- Click "New Card" button to create a card
- Fill in the title, description, and other details
- Clippy will warn you if there are similar cards already on the board

### Managing Cards
- Drag cards between columns to update their status
- Click on a card to expand/collapse its description
- Edit cards by clicking on them and using the edit form

### Using AI Features
- Clippy will suggest creating clusters when you have enough cards
- View clusters to see how your cards relate to each other
- Get suggestions for organizing your board more efficiently

## Project Structure

- `src/components/`: UI components
- `src/context/`: React context providers
- `src/hooks/`: Custom React hooks
- `src/services/`: Firebase and AI service integrations
- `src/types/`: TypeScript type definitions

## Accessibility

This project is built with accessibility in mind:
- Proper ARIA attributes
- Keyboard navigation
- Semantic HTML
- Focus management

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.