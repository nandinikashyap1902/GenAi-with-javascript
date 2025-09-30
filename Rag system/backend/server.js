require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { QdrantVectorStore } = require('@langchain/community/vectorstores/qdrant');
const { RetrievalQAChain, loadQAStuffChain } = require('langchain/chains');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { TextLoader } = require('langchain/document_loaders/fs/text');
const { WebPDFLoader } = require('langchain/document_loaders/web/pdf');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { ChatOpenAI } = require('langchain/chat_models/openai');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 5000;

// Enhanced CORS configuration with detailed logging
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);
    const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.headers['content-type']) {
    console.log('Content-Type:', req.headers['content-type']);
  }
  if (req.file) {
    console.log('Uploaded file:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Initialize OpenAI clients with secure configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Force HTTPS for API requests
  baseURL: 'https://api.openai.com/v1',
  // Add timeout for requests
  timeout: 30000, // 30 seconds
  // Disable any non-HTTPS requests
  httpAgent: new (require('https').Agent)({ rejectUnauthorized: true })
});

// Initialize LangChain's ChatOpenAI with secure configuration
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  configuration: {
    baseURL: 'https://api.openai.com/v1',
    timeout: 30000,
    httpAgent: new (require('https').Agent)({ rejectUnauthorized: true })
  }
});

// Qdrant client with version checking disabled
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY || '',
  // Disable version checking to prevent compatibility issues
  checkCompatibility: false
});

// Text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Test endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check received');
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.post('/api/process-text', async (req, res) => {
  try {
    const { text, namespace } = req.body;
    
    if (!text || !namespace) {
      return res.status(400).json({ error: 'Text and namespace are required' });
    }

    // Split text into chunks
    const docs = await textSplitter.createDocuments([text]);
    
    // Create and store vector store in Qdrant
    await QdrantVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings(),
      {
        client: qdrantClient,
        collectionName: namespace,
      }
    );
    
    res.json({ 
      success: true, 
      message: 'Text processed and stored successfully',
      namespace
    });
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({ error: 'Failed to process text' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  let filePath;
  
  try {
    console.log('File upload request received');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    filePath = req.file.path;
    const { namespace } = req.body;
    
    if (!namespace) {
      throw new Error('Namespace is required');
    }
    
    console.log(`Processing file: ${filePath}, type: ${req.file.mimetype}, size: ${req.file.size} bytes`);
    
    let docs = [];

    // Load document based on file type
    try {
      if (req.file.mimetype === 'application/pdf') {
        console.log('Loading PDF file...');
        const loader = new PDFLoader(filePath);
        docs = await loader.load();
      } else if (req.file.mimetype === 'text/plain') {
        console.log('Loading text file...');
        const loader = new TextLoader(filePath);
        docs = await loader.load();
      } else {
        throw new Error(`Unsupported file type: ${req.file.mimetype}`);
      }
      console.log(`Loaded ${docs.length} document(s)`);
      
      if (docs.length === 0) {
        throw new Error('No content found in the file');
      }
      
      // Split text into chunks
      console.log('Splitting text into chunks...');
      const splitDocs = await textSplitter.splitDocuments(docs);
      console.log(`Split into ${splitDocs.length} chunks`);
      
      // Create and store vector store in Qdrant
      console.log('Storing vectors in Qdrant...');
      await QdrantVectorStore.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings(),
        {
          client: qdrantClient,
          collectionName: namespace,
        }
      );
      
      console.log('File processing completed successfully');
      
      res.json({ 
        success: true, 
        message: 'File processed and stored successfully',
        namespace
      });
      
    } catch (processError) {
      console.error('Error during file processing:', processError);
      throw processError;
    }
    
  } catch (error) {
    console.error('File upload error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Failed to process file';
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
  } finally {
    // Clean up the uploaded file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
  }
});

app.post('/api/process-url', async (req, res) => {
  let browser;
  
  try {
    const { url, namespace } = req.body;
    
    console.log('URL processing request received:', { url, namespace });
    
    if (!url || !namespace) {
      return res.status(400).json({ error: 'URL and namespace are required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Use Puppeteer to fetch and process the web page
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    console.log('Navigating to URL:', url);
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 // 30 seconds timeout
    });
    
    console.log('Extracting content from page...');
    // Extract text content from the page
    const content = await page.evaluate(() => {
      // Remove script and style elements
      const elements = document.querySelectorAll('script, style, nav, footer, header');
      elements.forEach(el => el.remove());
      
      // Get the main content
      const mainContent = document.body.innerText;
      return mainContent;
    });
    
    console.log(`Extracted ${content.length} characters from the page`);
    
    await browser.close();
    browser = null;
    
    if (!content || content.trim().length === 0) {
      throw new Error('No content extracted from the URL');
    }
    
    // Process the extracted text
    console.log('Splitting text into chunks...');
    const docs = await textSplitter.createDocuments([content]);
    console.log(`Split into ${docs.length} chunks`);
    
    // Create and store vector store in Qdrant
    console.log('Storing vectors in Qdrant...');
    await QdrantVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings(),
      {
        client: qdrantClient,
        collectionName: namespace,
      }
    );
    
    console.log('URL processing completed successfully');
    
    res.json({ 
      success: true, 
      message: 'URL content processed and stored successfully',
      namespace
    });
  } catch (error) {
    console.error('Error processing URL:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Failed to process URL';
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Ensure browser is closed even if there's an error
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed in finally block');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
});

app.post('/api/query', async (req, res) => {
  try {
    const { question, namespace } = req.body;
    
    if (!question || !namespace) {
      return res.status(400).json({ error: 'Question and namespace are required' });
    }
    
    console.log(`Processing query: "${question}" for namespace: ${namespace}`);
    
    try {
      // Check if collection exists
      const collectionInfo = await qdrantClient.getCollection(namespace);
      console.log('Collection info:', JSON.stringify(collectionInfo, null, 2));
      
      // Create Qdrant vector store instance with error handling
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        new OpenAIEmbeddings(),
        {
          client: qdrantClient,
          collectionName: namespace,
        }
      );
      
      console.log('Vector store initialized successfully');
      
      // Create a retriever
      const retriever = vectorStore.asRetriever();
      
      // Create a QA chain
      const chain = new RetrievalQAChain({
        combineDocumentsChain: loadQAStuffChain(llm, { verbose: true }),
        retriever,
        returnSourceDocuments: true,
        verbose: true // Enable verbose logging
      });
      
      console.log('QA Chain created, executing query...');
      
      // Execute the chain
      const response = await chain.call({
        query: question,
      });
      
      console.log('Query successful, sending response');
      
      res.json({
        answer: response.text,
        sources: response.sourceDocuments?.map(doc => ({
          content: doc.pageContent,
          metadata: doc.metadata
        })) || []
      });
      
    } catch (error) {
      console.error('Error in Qdrant operation:', error);
      if (error.response) {
        console.error('Qdrant API error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      throw error; // This will be caught by the outer try-catch
    }
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
