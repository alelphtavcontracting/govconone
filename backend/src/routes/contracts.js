const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  res.json({ message: 'Contracts endpoint - to be implemented' });
});

router.post('/', async (req, res) => {
  res.json({ message: 'Create contract endpoint - to be implemented' });
});

module.exports = router;
