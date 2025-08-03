const openRouterService = require('./openRouterService');

class OpportunityAI {
  async generateExecutiveSummary(solicitationDocument, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Create an executive summary of this government solicitation:

${solicitationDocument}

Executive summary should include:
1. Opportunity overview (2-3 sentences)
2. Key requirements and scope
3. Contract value and duration
4. Critical deadlines and milestones
5. Evaluation criteria highlights
6. Strategic considerations
7. Competitive landscape insights
8. Recommendation (pursue/pass/monitor)

Format as a concise, actionable executive summary (300-400 words) suitable for business decision-making.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async scoreOpportunity(opportunity, companyProfile, tier = 'free') {
    const model = openRouterService.getModelForTier(tier, 'analysis');
    
    const prompt = `Score this government contracting opportunity for company fit and provide detailed analysis:

Opportunity:
${JSON.stringify(opportunity, null, 2)}

Company Profile:
${JSON.stringify(companyProfile, null, 2)}

Provide scoring (0-100) and analysis for:
1. Technical fit and capabilities match
2. Past performance relevance
3. Competitive positioning
4. Resource requirements vs capacity
5. Financial attractiveness
6. Strategic value and growth potential
7. Risk assessment
8. Win probability estimate

Return as JSON:
{
  "overall_score": 85,
  "technical_fit": 90,
  "past_performance": 80,
  "competitive_position": 75,
  "resource_match": 85,
  "financial_attractiveness": 90,
  "strategic_value": 80,
  "risk_level": "medium",
  "win_probability": 65,
  "recommendation": "pursue",
  "key_strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"],
  "action_items": ["action1", "action2"]
}`;

    const response = await openRouterService.generateText(prompt, model);
    
    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('Failed to parse opportunity scoring JSON:', error);
      return {
        overall_score: 0,
        recommendation: 'review_manually',
        raw_analysis: response.content
      };
    }
  }

  async extractKeyDates(solicitationDocument, tier = 'free') {
    const model = openRouterService.getModelForTier(tier, 'code');
    
    const prompt = `Extract all important dates and deadlines from this government solicitation:

${solicitationDocument}

Return as JSON array with all dates found:
[
  {
    "date": "YYYY-MM-DD",
    "time": "HH:MM" (if specified),
    "event": "description of what happens on this date",
    "type": "deadline|milestone|meeting|submission",
    "critical": true/false
  }
]

Include dates for: proposal submissions, questions due, site visits, pre-proposal conferences, contract start/end, option periods, etc.`;

    const response = await openRouterService.generateText(prompt, model);
    
    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('Failed to parse dates extraction JSON:', error);
      return [];
    }
  }

  async generateBidDecisionMatrix(opportunity, companyProfile, competitors, tier = 'free') {
    const model = openRouterService.getModelForTier(tier, 'analysis');
    
    const prompt = `Create a comprehensive bid/no-bid decision matrix for this opportunity:

Opportunity:
${JSON.stringify(opportunity, null, 2)}

Company Profile:
${JSON.stringify(companyProfile, null, 2)}

Known Competitors:
${JSON.stringify(competitors, null, 2)}

Generate decision matrix covering:
1. Strategic fit assessment
2. Competitive analysis
3. Resource requirement analysis
4. Financial projections
5. Risk assessment
6. Probability of win analysis
7. ROI calculations
8. Recommendation with rationale

Format as structured decision matrix with scores, weights, and final recommendation.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async identifyTeamingOpportunities(opportunity, companyProfile, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Analyze this opportunity for potential teaming arrangements:

Opportunity:
${JSON.stringify(opportunity, null, 2)}

Company Profile:
${JSON.stringify(companyProfile, null, 2)}

Identify:
1. Capability gaps that require partners
2. Recommended partner types and qualifications
3. Potential teaming structures (prime/sub, joint venture, etc.)
4. Partner search criteria
5. Teaming strategy recommendations
6. Risk mitigation through partnerships

Provide actionable teaming strategy and partner requirements.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }
}

module.exports = new OpportunityAI();
