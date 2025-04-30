# QGenAI Frontend

This is the frontend application for QGenAI, a document-based question answering system using Retrieval Augmented Generation (RAG).

## Architecture

The frontend is built with React and Vite, following a component-based architecture:

- **Components**: Reusable UI components
- **Pages**: Top-level page components
- **Services**: API service functions
- **Utils**: Utility functions

## Setup

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

Install dependencies:
```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

This will start the development server, typically at http://localhost:5173.

## Features

### Authentication

- User registration
- User login
- Protected routes

### Document Management

- Document upload
- Document listing
- Document status tracking
- Document deletion

### Query Interface

- Submit queries against your documents
- View query results with source citations
- Query history

## Development

### Adding a New Page

1. Create a new component in `src/pages/`
2. Add the route in `src/App.jsx`
3. Implement the page logic and UI

### Adding a New API Service

1. Add the service function in the appropriate file in `src/services/`
2. Import and use the service in your components

## Building for Production

```bash
npm run build
```

This will create a production-ready build in the `dist` directory.

## Proxy Configuration

The development server is configured to proxy API requests to the backend. This is set up in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```
