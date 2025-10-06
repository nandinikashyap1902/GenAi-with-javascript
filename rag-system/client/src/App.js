import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FiUpload, FiLink, FiSend, FiFileText, FiGlobe, FiMessageSquare } from 'react-icons/fi';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [namespace, setNamespace] = useState('default');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', content: 'Hello! Upload a document or enter text/URL to get started.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const API_BASE_URL = '/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namespace.trim()) {
      alert('Please enter a namespace');
      return;
    }

    setIsLoading(true);
    let response;
    
    try {
      console.log('Submitting form with tab:', activeTab);
      
      if (activeTab === 'text' && text.trim()) {
        console.log('Processing text input');
        response = await axios.post(`${API_BASE_URL}/process-text`, { text, namespace });
      } else if (activeTab === 'file' && file) {
        console.log('Processing file upload:', file.name, file.type, file.size);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('namespace', namespace);
        
        // Log FormData contents for debugging
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
        
        response = await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds timeout
          withCredentials: true,
        });
      } else if (activeTab === 'url' && url.trim()) {
        console.log('Processing URL:', url);
        response = await axios.post(`${API_BASE_URL}/process-url`, { url, namespace });
      } else {
        const errorMsg = `Please provide ${activeTab === 'text' ? 'text' : activeTab === 'file' ? 'a file' : 'a URL'}`;
        console.warn('Validation error:', errorMsg);
        alert(errorMsg);
        setIsLoading(false);
        return;
      }

      console.log('Server response:', response);
      if (response.data.success) {
        const successMsg = `Successfully processed ${activeTab} data! You can now ask questions.`;
        console.log(successMsg);
        addMessage('bot', successMsg);
      } else {
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout,
          headers: error.config?.headers
        }
      });
      
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Failed to process data. Check console for details.';
      addMessage('bot', `Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (!namespace.trim()) {
      alert('Please enter a namespace');
      return;
    }

    const userMessage = { sender: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      console.log('Sending query:', { query, namespace });
      const response = await axios.post(`${API_BASE_URL}/query`, {
        question: query,
        namespace,
      }, {
        timeout: 60000, // 60 seconds timeout
        withCredentials: true,
      });

      console.log('Query response:', response.data);
      addMessage('bot', response.data.answer);
    } catch (error) {
      console.error('Error querying:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      addMessage('bot', `Error: ${error.response?.data?.error || error.message || 'Failed to get response'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (sender, content) => {
    setMessages(prev => [...prev, { sender, content }]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'text':
        return (
          <div className="input-group">
            <label>Enter your text:</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              rows={10}
            />
          </div>
        );
      case 'file':
        return (
          <div className="input-group">
            <label>Upload a file (PDF, TXT):</label>
            <div className="file-upload">
              <button 
                type="button" 
                className="upload-btn"
                onClick={() => fileInputRef.current.click()}
              >
                <FiUpload /> {file ? file.name : 'Choose File'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt"
                style={{ display: 'none' }}
              />
            </div>
          </div>
        );
      case 'url':
        return (
          <div className="input-group">
            <label>Enter website URL:</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>RAG Application</h1>
        <p>Retrieval Augmented Generation System</p>
      </header>

      <div className="app-container">
        <div className="input-section">
          <h2>Data Source</h2>
          
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              <FiFileText /> Text
            </button>
            <button
              className={`tab ${activeTab === 'file' ? 'active' : ''}`}
              onClick={() => setActiveTab('file')}
            >
              <FiUpload /> File Upload
            </button>
            <button
              className={`tab ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => setActiveTab('url')}
            >
              <FiGlobe /> Website
            </button>
          </div>

          <form onSubmit={handleSubmit} className="data-form">
            {renderTabContent()}
            
            <div className="input-group">
              <label>Namespace (optional, used to organize different datasets):</label>
              <input
                type="text"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                placeholder="default"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Process Data'}
            </button>
          </form>
        </div>

        <div className="chat-section">
          <h2>Chat with your data</h2>
          
          <div className="chat-container">
            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <div className="message-content">
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.sender === 'user' && (
                <div className="message bot">
                  <div className="message-content typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleQuerySubmit} className="query-form">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your data..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
