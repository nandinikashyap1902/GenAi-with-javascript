# RAG (Retrieval Augmented Generation) Application

A web-based RAG application that allows you to upload documents, enter text, or provide website URLs to create a knowledge base and ask questions about the content.

## Features

- **Multiple Data Sources**:
  - Upload PDF and text files
  - Enter text directly
  - Provide website URLs to scrape content

- **Interactive Chat Interface**:
  - Natural language question answering
  - Real-time responses
  - Clean and intuitive UI

- **Document Processing**:
  - Automatic text extraction
  - Smart chunking for better context
  - Vector embeddings for semantic search

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rag-application
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Create a `.env` file** in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=5000
   ```

5. **Start the application**
   - Development mode (with hot-reload):
     ```bash
     npm run dev:full
     ```
   - Production mode:
     ```bash
     npm start
     cd client
     npm run build
     cd ..
     node server.js
     ```

6. **Open your browser** and navigate to `http://localhost:3000`

## How to Use

1. **Add Data**
   - Choose a data source: Text, File Upload, or Website URL
   - Enter a namespace to organize different datasets (optional)
   - Click "Process Data" to index the content

2. **Ask Questions**
   - Type your question in the chat input
   - Press Enter or click the send button
   - The system will retrieve relevant information and generate an answer

## Project Structure

```
rag-application/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # React components and styles
├── server.js              # Express server
├── package.json           # Server dependencies
└── README.md              # This file
```

## Dependencies

### Backend
- Express.js - Web framework
- LangChain - LLM orchestration
- OpenAI - Language model and embeddings
- Multer - File upload handling
- Puppeteer - Web scraping

### Frontend
- React - UI library
- Axios - HTTP client
- React Icons - Icon library

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Demo Video

[Link to demo video will be added here]
