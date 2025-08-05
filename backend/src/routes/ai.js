const express = require('express');
const router = express.Router();
const { authenticateToken, requireTier } = require('../middleware/auth');
const { aiUsageTracking } = require('../middleware/aiUsageTracking');

const openRouterService = require('../services/ai/openRouterService');
const capabilitiesAI = require('../services/ai/capabilitiesAI');
const sowAI = require('../services/ai/sowAI');
const subcontractorAI = require('../services/ai/subcontractorAI');
const opportunityAI = require('../services/ai/opportunityAI');
const proposalAI = require('../services/ai/proposalAI');

router.use(authenticateToken);
router.use(aiUsageTracking);

router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const tier = req.user.tier || 'free';
    
    const response = await openRouterService.chatWithAssistant(message, context, 
      openRouterService.getModelForTier(tier));
    
    res.json({
      response: response.content,
      usage: response.usage,
      model: response.model
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

router.post('/capabilities/generate', async (req, res) => {
  try {
    const { naicsCode, companyProfile } = req.body;
    const tier = req.user.tier || 'free';
    
    const description = await capabilitiesAI.generateCapabilityDescription(
      naicsCode, companyProfile, tier);
    
    res.json({ description });
  } catch (error) {
    console.error('Capabilities Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate capability description' });
  }
});

router.post('/capabilities/optimize', requireTier('pro'), async (req, res) => {
  try {
    const { content } = req.body;
    const tier = req.user.tier || 'pro';
    
    const optimized = await capabilitiesAI.optimizeForCompliance(content, tier);
    
    res.json({ optimized_content: optimized });
  } catch (error) {
    console.error('Capabilities Optimization Error:', error);
    res.status(500).json({ error: 'Failed to optimize capability statement' });
  }
});

router.post('/sow/extract', requireTier('pro'), async (req, res) => {
  try {
    const { documentContent } = req.body;
    const tier = req.user.tier || 'pro';
    
    const sections = await sowAI.extractSOWSections(documentContent, tier);
    
    res.json({ sections });
  } catch (error) {
    console.error('SOW Extraction Error:', error);
    res.status(500).json({ error: 'Failed to extract SOW sections' });
  }
});

router.post('/sow/customize', requireTier('pro'), async (req, res) => {
  try {
    const { template, clientRequirements, companyProfile } = req.body;
    const tier = req.user.tier || 'pro';
    
    const customized = await sowAI.customizeSOW(template, clientRequirements, companyProfile, tier);
    
    res.json({ customized_sow: customized });
  } catch (error) {
    console.error('SOW Customization Error:', error);
    res.status(500).json({ error: 'Failed to customize SOW' });
  }
});

router.post('/subcontractors/match', requireTier('elite'), async (req, res) => {
  try {
    const { opportunityRequirements, subcontractorPool } = req.body;
    const tier = req.user.tier || 'elite';
    
    const matches = await subcontractorAI.matchSubcontractors(
      opportunityRequirements, subcontractorPool, tier);
    
    res.json({ matches });
  } catch (error) {
    console.error('Subcontractor Matching Error:', error);
    res.status(500).json({ error: 'Failed to match subcontractors' });
  }
});

router.post('/subcontractors/outreach', requireTier('pro'), async (req, res) => {
  try {
    const { subcontractor, opportunity, primeContractor } = req.body;
    const tier = req.user.tier || 'pro';
    
    const email = await subcontractorAI.generateOutreachEmail(
      subcontractor, opportunity, primeContractor, tier);
    
    res.json({ email_content: email });
  } catch (error) {
    console.error('Outreach Email Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate outreach email' });
  }
});

router.post('/opportunities/summary', requireTier('elite'), async (req, res) => {
  try {
    const { solicitationDocument } = req.body;
    const tier = req.user.tier || 'elite';
    
    const summary = await opportunityAI.generateExecutiveSummary(solicitationDocument, tier);
    
    res.json({ executive_summary: summary });
  } catch (error) {
    console.error('Executive Summary Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate executive summary' });
  }
});

router.post('/opportunities/score', requireTier('elite'), async (req, res) => {
  try {
    const { opportunity, companyProfile } = req.body;
    const tier = req.user.tier || 'elite';
    
    const scoring = await opportunityAI.scoreOpportunity(opportunity, companyProfile, tier);
    
    res.json({ scoring });
  } catch (error) {
    console.error('Opportunity Scoring Error:', error);
    res.status(500).json({ error: 'Failed to score opportunity' });
  }
});

router.post('/proposals/technical-approach', requireTier('pro'), async (req, res) => {
  try {
    const { requirements, companyCapabilities } = req.body;
    const tier = req.user.tier || 'pro';
    
    const approach = await proposalAI.generateTechnicalApproach(
      requirements, companyCapabilities, tier);
    
    res.json({ technical_approach: approach });
  } catch (error) {
    console.error('Technical Approach Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate technical approach' });
  }
});

router.post('/proposals/past-performance', requireTier('pro'), async (req, res) => {
  try {
    const { pastProjects, currentRequirements } = req.body;
    const tier = req.user.tier || 'pro';
    
    const narrative = await proposalAI.generatePastPerformance(
      pastProjects, currentRequirements, tier);
    
    res.json({ past_performance: narrative });
  } catch (error) {
    console.error('Past Performance Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate past performance narrative' });
  }
});

router.post('/sow/transform-b2b', requireTier('pro'), async (req, res) => {
  try {
    const { sowContent, companySettings } = req.body;
    const tier = req.user.tier || 'pro';
    
    const transformed = await sowAI.transformB2GtoB2B(sowContent, companySettings, tier);
    
    res.json({ transformed_sow: transformed });
  } catch (error) {
    console.error('B2B Transformation Error:', error);
    res.status(500).json({ error: 'Failed to transform SOW to B2B format' });
  }
});

module.exports = router;
