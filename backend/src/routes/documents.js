const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authenticateToken, requireTier } = require('../middleware/auth');
const { aiUsageTracking } = require('../middleware/aiUsageTracking');
const sowAI = require('../services/ai/sowAI');
const db = require('../database/connection');

router.use(authenticateToken);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM documents WHERE tenant_id = $1 ORDER BY created_at DESC',
      [req.user.tenant_id]
    );
    res.json({ documents: result.rows });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.post('/upload-sow', requireTier('pro'), upload.single('document'), aiUsageTracking, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let fileContent;
    
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    if (ext === '.txt') {
      try {
        fileContent = fs.readFileSync(filePath, 'utf8');
      } catch (readError) {
        return res.status(400).json({ error: 'Unable to read text file content.' });
      }
    } else {
      fileContent = `[${ext.toUpperCase()} file - content will be extracted during processing]`;
    }
    
    const tier = req.user.tier || 'pro';
    const sections = await sowAI.extractSOWSections(fileContent, tier);
    
    const documentResult = await db.query(`
      INSERT INTO documents (tenant_id, user_id, name, type, file_path, file_size, mime_type, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      req.user.tenant_id,
      req.user.id,
      req.file.originalname,
      'sow_upload',
      req.file.path,
      req.file.size,
      req.file.mimetype,
      { sections, file_type: ext, processed: true }
    ]);

    res.json({
      document: documentResult.rows[0],
      sections: sections,
      raw_content: fileContent
    });
  } catch (error) {
    console.error('SOW upload error:', error);
    res.status(500).json({ error: 'Failed to process SOW document' });
  }
});

router.post('/transform-sow', requireTier('pro'), aiUsageTracking, async (req, res) => {
  try {
    const { sowContent, documentId } = req.body;
    
    const settingsResult = await db.query(
      'SELECT * FROM company_settings WHERE tenant_id = $1',
      [req.user.tenant_id]
    );
    
    if (settingsResult.rows.length === 0) {
      return res.status(400).json({ error: 'Company settings required for transformation. Please configure your company profile in Settings.' });
    }
    
    const companySettings = settingsResult.rows[0];
    const tier = req.user.tier || 'pro';
    
    const transformedSOW = await sowAI.transformB2GtoB2B(sowContent, companySettings, tier);
    
    if (documentId) {
      await db.query(`
        UPDATE documents 
        SET metadata = metadata || $1
        WHERE id = $2 AND tenant_id = $3
      `, [
        JSON.stringify({ transformed_content: transformedSOW }),
        documentId,
        req.user.tenant_id
      ]);
    }
    
    res.json({ transformed_sow: transformedSOW });
  } catch (error) {
    console.error('SOW transformation error:', error);
    res.status(500).json({ error: 'Failed to transform SOW document' });
  }
});

router.post('/save-to-opportunity', requireTier('pro'), async (req, res) => {
  try {
    const { documentId, opportunityId, transformedContent } = req.body;
    
    if (opportunityId) {
      await db.query(`
        UPDATE documents 
        SET opportunity_id = $1, metadata = metadata || $2
        WHERE id = $3 AND tenant_id = $4
      `, [
        opportunityId,
        JSON.stringify({ saved_to_opportunity: true, transformed_content: transformedContent }),
        documentId,
        req.user.tenant_id
      ]);
    }
    
    res.json({ success: true, message: 'Document saved to opportunity' });
  } catch (error) {
    console.error('Save to opportunity error:', error);
    res.status(500).json({ error: 'Failed to save document to opportunity' });
  }
});

module.exports = router;
