const openRouterService = require('./openRouterService');

class SOWProcessor {
  async extractSOWSections(documentContent, tier = 'free') {
    const model = openRouterService.getModelForTier(tier, 'code');
    
    const maxContentLength = 100000;
    const truncatedContent = documentContent.length > maxContentLength 
      ? documentContent.substring(0, maxContentLength) + '\n\n[Content truncated due to length...]'
      : documentContent;
    
    const prompt = `Extract key sections from this Statement of Work (SOW) document and return as structured JSON:

${truncatedContent}

Extract and structure the following sections:
- scope: Project scope and objectives
- deliverables: Specific deliverables and outputs
- timeline: Key dates, milestones, and deadlines
- requirements: Technical and functional requirements
- location: Work location and site requirements
- personnel: Staffing and qualification requirements
- evaluation: Evaluation criteria and scoring
- contract_type: Contract type and payment terms

Return only valid JSON with these sections. If a section is not found, include it with null value.`;

    const response = await openRouterService.generateText(prompt, model);
    
    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('Failed to parse SOW extraction JSON:', error);
      return {
        scope: null,
        deliverables: null,
        timeline: null,
        requirements: null,
        location: null,
        personnel: null,
        evaluation: null,
        contract_type: null,
        raw_content: response.content
      };
    }
  }

  async customizeSOW(template, clientRequirements, companyProfile, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Customize this SOW template for the specific client requirements:

SOW Template:
${template}

Client Requirements:
${clientRequirements}

Company Profile:
${JSON.stringify(companyProfile, null, 2)}

Customization instructions:
- Adapt the template to match client-specific requirements
- Include company-specific capabilities and approach
- Maintain professional government contracting language
- Ensure all requirements are addressed
- Add relevant technical details and methodologies
- Include appropriate timelines and deliverables

Return the customized SOW document.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async generateSOWFromOpportunity(opportunityData, companyProfile, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Generate a comprehensive Statement of Work based on this government opportunity:

Opportunity Details:
${JSON.stringify(opportunityData, null, 2)}

Company Profile:
${JSON.stringify(companyProfile, null, 2)}

Generate a professional SOW that includes:
1. Project Overview and Objectives
2. Scope of Work
3. Deliverables and Timeline
4. Technical Approach and Methodology
5. Personnel and Qualifications
6. Quality Assurance and Control
7. Risk Management
8. Communication and Reporting

Format as a complete, professional SOW document suitable for government contracting.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async validateSOWCompliance(sowContent, tier = 'free') {
    const model = openRouterService.getModelForTier(tier);
    
    const prompt = `Review this Statement of Work for government contracting compliance and completeness:

${sowContent}

Check for:
- Required sections and elements
- Compliance with federal procurement standards
- Clarity and specificity of requirements
- Appropriate technical detail level
- Risk identification and mitigation
- Quality assurance provisions
- Deliverable specifications

Provide a compliance assessment with:
1. Compliance score (1-10)
2. Missing or weak elements
3. Specific improvement recommendations
4. Risk areas to address

Format as a structured compliance report.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }

  async transformB2GtoB2B(sowContent, companySettings, tier = 'pro') {
    const model = openRouterService.getModelForTier(tier);
    
    const maxContentLength = 80000;
    const truncatedContent = sowContent.length > maxContentLength 
      ? sowContent.substring(0, maxContentLength) + '\n\n[Content truncated due to length...]'
      : sowContent;
    
    const prompt = `Transform this government Statement of Work (B2G) into a Business-to-Business (B2B) document for subcontractor outreach:

Original Government SOW:
${truncatedContent}

Prime Contractor Information:
${JSON.stringify(companySettings, null, 2)}

Transformation Requirements:
- Replace government agency references with prime contractor company name: "${companySettings.company_name}"
- Change perspective from government-to-contractor to contractor-to-subcontractor
- Maintain all technical requirements and deliverables exactly
- Update contact information to prime contractor details
- Preserve all compliance and quality requirements
- Adjust timeline references to reflect subcontractor role
- Include prime contractor branding elements
- Maintain professional government contracting language
- Position the prime contractor as the client issuing work to subcontractor
- Replace any government contact information with prime contractor details

Return the transformed B2B SOW document ready for subcontractor distribution.`;

    const response = await openRouterService.generateText(prompt, model);
    return response.content;
  }
}

module.exports = new SOWProcessor();
