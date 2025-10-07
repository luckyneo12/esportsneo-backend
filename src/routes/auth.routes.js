const express = require('express');
const bcrypt = require('bcrypt');
const { prisma } = require('../lib/prisma');
const { signToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/auth/register', async (req, res) => {
  try {
    const { name, username, mobile, password, email } = req.body;
    if (!username || !mobile || !password) return res.status(400).json({ error: 'username, mobile, password required' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name: name || username, username, mobile, password: hash, email: (email && email.trim()) || null } });
    return res.json({ token: signToken(user), user });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'username/mobile/email already exists', code: e.code, meta: e.meta });
    console.error('Registration error:', e);
    return res.status(500).json({ error: 'Registration failed', code: e.code, message: e.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) return res.status(400).json({ error: 'mobile, password required' });
  const user = await prisma.user.findUnique({ where: { mobile } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  return res.json({ token: signToken(user), user });
});

module.exports = router;


