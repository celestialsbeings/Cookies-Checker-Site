import express from 'express';
import { claimRandomCookie } from './cookieManager';

const router = express.Router();

router.get('/api/claim-cookie', async (req, res) => {
  try {
    const cookie = await claimRandomCookie();
    
    if (!cookie) {
      return res.status(404).json({ error: 'No cookies available' });
    }
    
    res.json(cookie);
  } catch (error) {
    console.error('Error handling cookie claim:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
