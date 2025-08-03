const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  res.json({ message: 'Subcontractors endpoint - to be implemented' });
});

router.post('/', async (req, res) => {
  res.json({ message: 'Create subcontractor endpoint - to be implemented' });
});

module.exports = router;
