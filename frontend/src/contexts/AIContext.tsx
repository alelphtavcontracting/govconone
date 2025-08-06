import React, { createContext, useContext, useState, ReactNode } from 'react';
import { aiService } from '../services/aiService';

interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  module?: string;
}

interface AIContextType {
  messages: AIMessage[];
  isLoading: boolean;
  sendMessage: (content: string, context?: string) => Promise<void>;
  clearMessages: () => void;
  currentModule: string;
  setCurrentModule: (module: string) => void;
  generateCapabilityStatement: (companyProfile: any, naicsCodes: string[], templateType: string) => Promise<any>;
  optimizeContent: (content: string, optimizationType: string) => Promise<string>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState('dashboard');

  const sendMessage = async (content: string, context?: string) => {
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      module: currentModule
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const contextString = context || `User is in ${currentModule} module`;
      const response = await aiService.chat(content, contextString);
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
        module: currentModule
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        module: currentModule
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const generateCapabilityStatement = async (companyProfile: any, naicsCodes: string[], templateType: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/capabilities/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          companyProfile,
          naicsCodes,
          templateType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate capability statement');
      }

      const data = await response.json();
      return {
        content: data.capabilityStatement,
        generatedAt: data.generatedAt
      };
    } catch (error) {
      console.error('Error generating capability statement:', error);
      throw error;
    }
  };

  const optimizeContent = async (content: string, optimizationType: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/capabilities/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content,
          optimizationType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize content');
      }

      const data = await response.json();
      return data.optimizedContent;
    } catch (error) {
      console.error('Error optimizing content:', error);
      throw error;
    }
  };

  const value = {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    currentModule,
    setCurrentModule,
    generateCapabilityStatement,
    optimizeContent
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};
