const openRouterService = require('./openRouterService');

class ProposalAI {
  async generateTechnicalApproach(requirements, companyCapabilities, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Generate a comprehensive technical approach section for a government proposal:

Requirements:
${requirements}

Company Capabilities:
${JSON.stringify(companyCapabilities, null, 2)}

Technical approach should include:
1. Understanding of requirements
2. Proposed methodology and approach
3. Technical solution architecture
4. Implementation strategy
5. Quality assurance measures
6. Risk mitigation strategies
7. Innovation and value-added features
8. Compliance with specifications

Format as a professional proposal section with clear structure and government contracting language.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async generatePastPerformance(pastProjects, currentRequirements, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Generate a compelling past performance narrative connecting these projects to current requirements:

Past Projects:
${JSON.stringify(pastProjects, null, 2)}

Current Requirements:
${currentRequirements}

Create past performance section that:
1. Demonstrates relevant experience
2. Highlights successful outcomes
3. Shows progression of capabilities
4. Addresses specific requirement areas
5. Includes quantifiable results
6. Emphasizes client satisfaction
7. Shows risk mitigation experience

Format as professional proposal past performance section with specific examples and metrics.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async generateManagementApproach(projectRequirements, teamStructure, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Generate a management approach section for this government proposal:

Project Requirements:
${projectRequirements}

Proposed Team Structure:
${JSON.stringify(teamStructure, null, 2)}

Management approach should cover:
1. Project management methodology
2. Organizational structure and roles
3. Communication and reporting plans
4. Schedule management and milestones
5. Quality management system
6. Risk management processes
7. Change management procedures
8. Performance monitoring and control

Format as comprehensive management approach suitable for government proposal.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async optimizeProposalSection(sectionContent, evaluationCriteria, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Optimize this proposal section against the evaluation criteria:

Current Section Content:
${sectionContent}

Evaluation Criteria:
${evaluationCriteria}

Optimization should:
1. Strengthen alignment with evaluation criteria
2. Improve clarity and persuasiveness
3. Add missing elements that address criteria
4. Enhance competitive positioning
5. Improve structure and flow
6. Strengthen value proposition
7. Add specific examples and evidence

Return the optimized section content.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async generateExecutiveSummary(proposalSections, opportunity, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Generate a compelling executive summary for this government proposal:

Proposal Sections Summary:
${JSON.stringify(proposalSections, null, 2)}

Opportunity Overview:
${JSON.stringify(opportunity, null, 2)}

Executive summary should:
1. Capture attention immediately
2. Summarize key value propositions
3. Highlight competitive advantages
4. Address critical requirements
5. Demonstrate understanding
6. Show commitment to success
7. Include compelling differentiators
8. End with strong call to action

Format as persuasive executive summary (2-3 pages) that positions the proposal for win.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async reviewProposalCompliance(proposalContent, solicitationRequirements, tier = 'free') {
    const model = openRouterService.getModelForTier(tier, 'analysis');
    
    const prompt = `Review this proposal for compliance with solicitation requirements:

Proposal Content:
${proposalContent}

Solicitation Requirements:
${solicitationRequirements}

Provide compliance review including:
1. Compliance checklist with status
2. Missing or incomplete elements
3. Format and structure compliance
4. Content requirement fulfillment
5. Page limit and formatting issues
6. Required certifications and forms
7. Risk areas for non-compliance
8. Specific recommendations for improvement

Format as detailed compliance review report.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }
}

module.exports = new ProposalAI();
