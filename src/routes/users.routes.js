const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Get own profile
router.get('/users/me', auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      mobile: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/users/me', auth, async (req, res) => {
  const { name, bio, avatarUrl } = req.body;
  const user = await prisma.user.update({ where: { id: req.userId }, data: { name, bio, avatarUrl } });
  res.json(user);
});

module.exports = router;


