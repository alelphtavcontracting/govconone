const openRouterService = require('./openRouterService');

class SubcontractorAI {
  async matchSubcontractors(opportunityRequirements, subcontractorPool, tier = 'free') {
    const model = openRouterService.getModelForTier(tier, 'analysis');
    
    const prompt = `Match subcontractors to opportunity requirements and return ranked results:

Opportunity Requirements:
${JSON.stringify(opportunityRequirements, null, 2)}

Available Subcontractors:
${JSON.stringify(subcontractorPool, null, 2)}

Analyze each subcontractor and provide:
1. Match score (0-100)
2. Strengths for this opportunity
3. Potential gaps or concerns
4. Recommended role/scope
5. Risk assessment

Return as JSON array sorted by match score (highest first):
[
  {
    "subcontractor_id": "id",
    "name": "company name",
    "match_score": 85,
    "strengths": ["strength1", "strength2"],
    "gaps": ["gap1", "gap2"],
    "recommended_role": "description",
    "risk_level": "low|medium|high",
    "rationale": "explanation"
  }
]`;

    const response = await openRouterService.generateText(prompt, model);
    
    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('Failed to parse subcontractor matching JSON:', error);
      return [];
    }
  }

  async generateOutreachEmail(subcontractor, opportunity, primeContractor, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Generate a professional outreach email to a subcontractor for a government contracting opportunity:

Subcontractor: ${subcontractor.name}
Opportunity: ${opportunity.title}
Prime Contractor: ${primeContractor.name}

Email should include:
- Professional greeting and introduction
- Brief opportunity overview
- Why they were selected
- Next steps and timeline
- Contact information
- Professional closing

Tone: Professional, respectful, business-focused
Length: Concise but informative (200-300 words)

Return only the email content (subject line and body).`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async analyzeSubcontractorCapabilities(subcontractorData, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Analyze this subcontractor's capabilities and provide a comprehensive assessment:

Subcontractor Data:
${JSON.stringify(subcontractorData, null, 2)}

Provide analysis including:
1. Core competencies and strengths
2. Industry specializations
3. Geographic coverage and limitations
4. Capacity and scalability assessment
5. Competitive advantages
6. Potential risk factors
7. Recommended opportunity types
8. Partnership suitability score (1-10)

Format as a structured capability assessment report.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async generateSubcontractorQuestions(opportunity, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Generate a comprehensive list of questions to ask potential subcontractors for this opportunity:

Opportunity Details:
${JSON.stringify(opportunity, null, 2)}

Generate questions covering:
1. Technical capabilities and approach
2. Past performance and experience
3. Personnel and qualifications
4. Capacity and availability
5. Pricing and cost structure
6. Quality assurance processes
7. Risk management
8. Compliance and certifications

Format as categorized question list suitable for subcontractor interviews or RFI.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async scoreSubcontractorResponse(questions, responses, opportunity, tier = 'free') {
    const model = openRouterService.getModelForTier(tier, 'analysis');
    
    const prompt = `Score and analyze this subcontractor's responses to our questions:

Questions Asked:
${questions}

Subcontractor Responses:
${responses}

Opportunity Context:
${JSON.stringify(opportunity, null, 2)}

Provide:
1. Overall score (0-100)
2. Category scores (technical, experience, capacity, pricing)
3. Strengths identified
4. Concerns or red flags
5. Follow-up questions needed
6. Recommendation (proceed/decline/request more info)

Format as structured evaluation report.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }
}

module.exports = new SubcontractorAI();
