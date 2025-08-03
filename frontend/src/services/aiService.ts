import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class AIService {
  async chat(message: string, context?: string) {
    const response = await axios.post(`${API_URL}/ai/chat`, {
      message,
      context
    });
    return response.data;
  }

  async generateCapabilities(naicsCode: string, companyProfile: any) {
    const response = await axios.post(`${API_URL}/ai/capabilities/generate`, {
      naicsCode,
      companyProfile
    });
    return response.data;
  }

  async optimizeCapabilities(content: string) {
    const response = await axios.post(`${API_URL}/ai/capabilities/optimize`, {
      content
    });
    return response.data;
  }

  async extractSOW(documentContent: string) {
    const response = await axios.post(`${API_URL}/ai/sow/extract`, {
      documentContent
    });
    return response.data;
  }

  async customizeSOW(template: string, clientRequirements: string, companyProfile: any) {
    const response = await axios.post(`${API_URL}/ai/sow/customize`, {
      template,
      clientRequirements,
      companyProfile
    });
    return response.data;
  }

  async matchSubcontractors(opportunityRequirements: any, subcontractorPool: any[]) {
    const response = await axios.post(`${API_URL}/ai/subcontractors/match`, {
      opportunityRequirements,
      subcontractorPool
    });
    return response.data;
  }

  async generateOutreachEmail(subcontractor: any, opportunity: any, primeContractor: any) {
    const response = await axios.post(`${API_URL}/ai/subcontractors/outreach`, {
      subcontractor,
      opportunity,
      primeContractor
    });
    return response.data;
  }

  async generateExecutiveSummary(solicitationDocument: string) {
    const response = await axios.post(`${API_URL}/ai/opportunities/summary`, {
      solicitationDocument
    });
    return response.data;
  }

  async scoreOpportunity(opportunity: any, companyProfile: any) {
    const response = await axios.post(`${API_URL}/ai/opportunities/score`, {
      opportunity,
      companyProfile
    });
    return response.data;
  }

  async generateTechnicalApproach(requirements: string, companyCapabilities: any) {
    const response = await axios.post(`${API_URL}/ai/proposals/technical-approach`, {
      requirements,
      companyCapabilities
    });
    return response.data;
  }

  async generatePastPerformance(pastProjects: any[], currentRequirements: string) {
    const response = await axios.post(`${API_URL}/ai/proposals/past-performance`, {
      pastProjects,
      currentRequirements
    });
    return response.data;
  }
}

export const aiService = new AIService();
