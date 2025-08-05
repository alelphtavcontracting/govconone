const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/connection');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM company_settings WHERE tenant_id = $1',
      [req.user.tenant_id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ settings: null });
    }
    
    res.json({ settings: result.rows[0] });
  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.status(500).json({ error: 'Failed to fetch company settings' });
  }
});

router.put('/', async (req, res) => {
  try {
    const {
      company_name,
      company_logo_url,
      capability_statement,
      years_in_business,
      naics_codes,
      address,
      phone,
      email,
      website,
      certifications
    } = req.body;

    const result = await db.query(`
      INSERT INTO company_settings (
        tenant_id, company_name, company_logo_url, capability_statement, years_in_business,
        naics_codes, address, phone, email, website, certifications
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (tenant_id) 
      DO UPDATE SET
        company_name = EXCLUDED.company_name,
        company_logo_url = EXCLUDED.company_logo_url,
        capability_statement = EXCLUDED.capability_statement,
        years_in_business = EXCLUDED.years_in_business,
        naics_codes = EXCLUDED.naics_codes,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        website = EXCLUDED.website,
        certifications = EXCLUDED.certifications,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      req.user.tenant_id, company_name, company_logo_url, capability_statement, years_in_business,
      naics_codes, address, phone, email, website, certifications
    ]);

    res.json({ settings: result.rows[0] });
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({ error: 'Failed to update company settings' });
  }
});

module.exports = router;
