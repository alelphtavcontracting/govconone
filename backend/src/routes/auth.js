const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
  res.json({ message: 'Auth login endpoint - to be implemented' });
});

router.post('/register', async (req, res) => {
  res.json({ message: 'Auth register endpoint - to be implemented' });
});

router.post('/google', async (req, res) => {
  res.json({ message: 'Google OAuth endpoint - to be implemented' });
});

module.exports = router;
