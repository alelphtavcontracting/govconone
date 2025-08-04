const OpenAI = require('openai');

class OpenRouterService {
  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
    
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'GovConOne AI Assistant',
      }
    });
    
    this.models = {
      free: {
        chat: 'meta-llama/llama-3.2-1b-instruct',
        code: 'meta-llama/llama-3.2-1b-instruct'
      },
      paid: {
        chat: 'meta-llama/llama-3.2-1b-instruct',
        code: 'meta-llama/llama-3.2-1b-instruct',
        analysis: 'meta-llama/llama-3.2-1b-instruct'
      }
    };
  }

  async generateText(prompt, model = null, systemPrompt = null) {
    try {
      const selectedModel = model || 'meta-llama/llama-3.2-1b-instruct';
      
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const completion = await this.client.chat.completions.create({
        model: selectedModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      });

      return {
        content: completion.choices[0].message.content,
        usage: completion.usage,
        model: selectedModel
      };
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  async generateCode(prompt, model = null) {
    const systemPrompt = 'You are an expert software developer. Generate clean, efficient, and well-structured code. Follow best practices and include proper error handling.';
    const selectedModel = model || this.models.free.code;
    return this.generateText(prompt, selectedModel, systemPrompt);
  }

  async analyzeDocument(content, documentType = 'general', model = null) {
    const systemPrompt = `You are an expert government contracting analyst. Analyze the following ${documentType} document and provide structured insights including key requirements, deadlines, opportunities, and compliance considerations.`;
    const selectedModel = model || this.models.free.chat;
    return this.generateText(content, selectedModel, systemPrompt);
  }

  async chatWithAssistant(message, context = '', model = null) {
    const systemPrompt = `You are GovConOne AI Assistant, an expert in government contracting, federal procurement, and business development. You help federal prime contractors navigate the complex world of government contracting. 

Current context: ${context}

Provide helpful, accurate, and actionable advice. Be professional but approachable. Focus on practical solutions and government contracting best practices.`;
    
    const selectedModel = model || this.models.free.chat;
    return this.generateText(message, selectedModel, systemPrompt);
  }

  getModelForTier(tier, type = 'chat') {
    switch (tier) {
    case 'free':
      return this.models.free[type] || this.models.free.chat;
    case 'pro':
      return this.models.paid[type] || this.models.paid.chat;
    case 'elite':
      return this.models.paid.analysis || this.models.paid.chat;
    default:
      return this.models.free.chat;
    }
  }
}

module.exports = new OpenRouterService();
