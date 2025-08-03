const openRouterService = require('./openRouterService');

class CapabilitiesAI {
  async generateCapabilityDescription(naicsCode, companyProfile, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Generate a professional capability statement description for a federal contractor with NAICS code ${naicsCode}.

Company Profile:
${JSON.stringify(companyProfile, null, 2)}

Requirements:
- Professional tone suitable for government contracting
- Highlight relevant experience and capabilities
- Include specific technical competencies
- Emphasize past performance and qualifications
- Keep within 200-300 words
- Use government contracting terminology

Return only the capability description text.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async optimizeForCompliance(content, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Review and optimize this capability statement for government compliance and effectiveness:

${content}

Optimization requirements:
- Ensure compliance with federal procurement regulations
- Improve clarity and professional presentation
- Strengthen value proposition for government buyers
- Verify proper use of government contracting terminology
- Enhance competitive positioning
- Maintain authenticity and accuracy

Return the optimized capability statement.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async generateNAICSDescription(naicsCode, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Provide a detailed description of NAICS code ${naicsCode} in the context of government contracting.

Include:
- Industry overview and scope
- Typical government contract opportunities
- Key capabilities and services
- Competitive landscape considerations
- Compliance and certification requirements

Format as a professional business description suitable for capability statements.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async suggestImprovements(currentStatement, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Analyze this capability statement and suggest specific improvements:

${currentStatement}

Provide:
1. Strengths of the current statement
2. Areas for improvement
3. Specific suggestions for enhancement
4. Missing elements that should be included
5. Competitive positioning recommendations

Format as actionable feedback for a government contractor.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }
}

module.exports = new CapabilitiesAI();
