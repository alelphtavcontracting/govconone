const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { trackAIUsage } = require('../middleware/aiUsageTracking');
const openRouterService = require('../services/ai/openRouterService');
const capabilitiesAI = require('../services/ai/capabilitiesAI');

router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { companyProfile, naicsCodes, templateType } = req.body;
    
    if (!companyProfile || !naicsCodes) {
      return res.status(400).json({ error: 'Company profile and NAICS codes are required' });
    }

    const capabilityStatement = await capabilitiesAI.generateCapabilityDescription(
      naicsCodes[0],
      companyProfile,
      'free'
    );

    res.json({
      success: true,
      capabilityStatement,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating capability statement:', error);
    res.status(500).json({ error: 'Failed to generate capability statement' });
  }
});

router.post('/optimize', authenticateToken, trackAIUsage, async (req, res) => {
  try {
    const { content, optimizationType } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required for optimization' });
    }

    const optimizedContent = await capabilitiesAI.optimizeForCompliance(
      content,
      'free'
    );

    res.json({
      success: true,
      optimizedContent,
      optimizedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error optimizing content:', error);
    res.status(500).json({ error: 'Failed to optimize content' });
  }
});

router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = [
      {
        id: 'standard',
        name: 'Standard Government',
        description: 'Standard format for federal contracting'
      },
      {
        id: 'detailed',
        name: 'Detailed Technical',
        description: 'Comprehensive technical capabilities'
      },
      {
        id: 'small-business',
        name: 'Small Business',
        description: 'Optimized for small business certifications'
      }
    ];

    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

module.exports = router;
