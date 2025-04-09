import React, { useState } from 'react';
import { Send, Bot, User, ChevronDown, Plus, Settings } from 'lucide-react';

interface Message {
  content: string;
  role: 'assistant' | 'user';
}

type Model = 'llama3.1' | 'gemma3' | 'llama3';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model>('gemma3');

  const models: Model[] = ['llama3.1', 'gemma3', 'llama3'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
        {
          role: 'user',
          content: input,
        },
          ],
          stream: false,
        }),
      });

      const data = await response.json();

      // Check for errors in the response
      if (data.error) {
        throw new Error(data.details || data.error);
      }

      // Extract the assistant's message content from the response
      const botMessage: Message = {
        role: 'assistant',
        content: data.message.content, // Updated to match the response structure
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      const errorResponse: Message = {
        role: 'assistant',
        content: `Error: ${errorMessage}. Please make sure Ollama is running locally and the selected model is installed.`,
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <button className="flex items-center gap-2 p-3 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors mb-4">
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as Model)}
            className="w-full bg-gray-800 text-white rounded-md p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-grow overflow-y-auto">
          {/* Chat history would go here */}
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <button className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md w-full">
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Chat with {selectedModel}</h1>
            <ChevronDown size={20} className="text-gray-500" />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Bot size={48} className="mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
                <p>Start a conversation and I'll do my best to assist you using {selectedModel}.</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  message.role === 'assistant' ? 'bg-gray-50' : ''
                } p-6`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.role === 'assistant'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot size={20} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${selectedModel} something...`}
              className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-teal-500 transition-colors disabled:opacity-50"
              disabled={!input.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-xs text-center text-gray-500 mt-2">
            {isLoading ? 'Processing your request...' : error ? 'Error connecting to AI model' : `Connected to ${selectedModel}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
