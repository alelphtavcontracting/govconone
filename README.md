# GovConOne - AI-Powered Government Contracting Platform

GovConOne is a comprehensive multitenant SaaS platform designed for federal prime contractors, featuring AI-powered automation across the entire government contracting lifecycle.

## 🚀 Features

### Core Modules
- **Opportunities Dashboard** - AI-powered opportunity discovery and analysis
- **Contract Management System** - Complete contract lifecycle management
- **GovCon CRM** - Specialized CRM for government contracting relationships
- **Subcontractor Finder** - Intelligent subcontractor matching and outreach
- **SOW Repurposer** - AI-powered Statement of Work generation and customization
- **Capabilities Statement Generator** - Automated capability statement creation
- **Service Agreement Generator** - Legal document automation
- **Pricing Intelligence Cockpit** - Market analysis and pricing optimization
- **Full Proposal Builder** - AI-assisted proposal creation and optimization
- **Government Invoicing** - Compliance-focused invoicing system

### AI Integration
- **OpenRouter API** - Access to multiple AI models for different use cases
- **Overarching AI Assistant** - Context-aware help across all modules
- **Document Processing** - Intelligent parsing and analysis of government documents
- **Automated Generation** - AI-powered content creation for proposals, SOWs, and more
- **Smart Matching** - AI-driven subcontractor and opportunity matching

## 🏗️ Architecture

### Backend
- **Node.js/Express** - RESTful API server
- **PostgreSQL** - Primary database with row-level security for multitenancy
- **JWT Authentication** - Secure token-based authentication
- **OpenRouter Integration** - AI service layer with multiple model support

### Frontend
- **React + TypeScript** - Modern frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **Context API** - State management for auth and AI features

### AI Services
- **Free Models**: GLM 4.5 Air, Qwen3 Coder (for development and Free tier)
- **Paid Models**: Advanced models for Pro and Elite tiers
- **Usage Tracking** - Per-tenant AI usage monitoring and cost management

## 🎯 Pricing Tiers

- **Free**: Capabilities Statement Generator
- **Pro**: Free + Subcontractor Finder, SOW Repurposer, Service Agreement Generator, Proposal Builder
- **Elite**: Pro + CRM, Contract Management, Invoice & Payment Monitor, Pricing Intelligence

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenRouter API key

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Environment Variables

#### Backend (.env)
```
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://username:password@localhost:5432/govconone
JWT_SECRET=your-super-secret-jwt-key-here
OPENROUTER_API_KEY=your-openrouter-api-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🤖 AI Features

### Capabilities Statement Generator
- Intelligent template selection based on company profile
- Auto-generate capability descriptions from NAICS codes
- Optimize language for government compliance

### SOW Repurposer
- Intelligent SOW parsing and section extraction
- Auto-generate customized SOWs from templates
- Compliance checking against government standards

### Subcontractor Finder
- Intelligent subcontractor matching based on capabilities
- Auto-generate outreach emails
- Score subcontractor fit for specific opportunities

### Opportunities Dashboard
- Auto-generate executive summaries of solicitations
- Opportunity scoring and recommendation engine
- Deadline and milestone extraction

### Proposal Builder
- Auto-generate proposal sections from templates
- Past performance narrative generation
- Technical approach optimization

## 📊 Cost Management

### AI Usage Tracking
- Per-tenant token usage monitoring
- Tier-based model access controls
- Budget alerts and optimization

### Model Selection Strategy
- **Free Tier**: Free models only (GLM 4.5 Air, Qwen3 Coder)
- **Pro Tier**: Limited paid model usage ($50/month budget)
- **Elite Tier**: Full access to premium models ($200/month budget)

## 🔒 Security

- JWT-based authentication with secure token management
- Row-level security for multitenant data isolation
- Rate limiting on AI endpoints
- Input sanitization to prevent prompt injection
- Audit logging for AI interactions

## 🚀 Deployment

The application is designed for deployment on Google Cloud Platform:

- **Cloud Run** - Serverless container deployment
- **Cloud SQL** - Managed PostgreSQL database
- **Cloud Storage** - Document and file storage
- **Firebase Auth** - Authentication service
- **Cloud CDN** - Content delivery network

## 📈 Roadmap

### Phase 1: AI Architecture Foundation ✅
- OpenRouter integration setup
- AI assistant chat interface
- Basic AI service layer

### Phase 2: Free Tier MVP ✅ COMPLETED
- Capabilities Statement Generator with AI
- User onboarding and authentication
- Database infrastructure and migrations

### Phase 3: Production Readiness ✅ COMPLETED
- Enhanced security and compliance
- Production logging and monitoring
- Google Cloud Platform deployment
- Comprehensive testing infrastructure

### Phase 4: Elite Tier Features (Weeks 7-10)
- Opportunities Dashboard with AI analysis
- GovCon CRM with intelligent features
- Contract Management System

### Phase 5: Advanced Intelligence (Weeks 11-12)
- Pricing Intelligence Cockpit
- Full Proposal Builder
- Government Invoicing integration

## 🤝 Contributing

This is a private project for GovConOne development. Please follow the established coding standards and ensure all AI features are properly tested with free models before deployment.

## 📄 License

Private and confidential. All rights reserved.
