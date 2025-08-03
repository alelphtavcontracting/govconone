const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  res.json({ message: 'Documents endpoint - to be implemented' });
});

router.post('/upload', async (req, res) => {
  res.json({ message: 'Document upload endpoint - to be implemented' });
});

module.exports = router;
