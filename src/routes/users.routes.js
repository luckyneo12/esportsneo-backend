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
      gameId: true,
      role: true,
      matchesPlayed: true,
      matchesWon: true,
      kills: true,
      deaths: true,
      wins: true,
      mvpCount: true,
      performancePoints: true,
      level: true,
      xp: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/users/me', auth, async (req, res) => {
  const { name, bio, avatarUrl, gameId } = req.body;
  const user = await prisma.user.update({ 
    where: { id: req.userId }, 
    data: { name, bio, avatarUrl, gameId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      mobile: true,
      bio: true,
      avatarUrl: true,
      gameId: true,
      role: true,
      matchesPlayed: true,
      matchesWon: true,
      kills: true,
      deaths: true,
      wins: true,
      mvpCount: true,
      performancePoints: true,
      level: true,
      xp: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  res.json(user);
});

// Get user profile by ID
router.get('/users/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      gameId: true,
      role: true,
      matchesPlayed: true,
      matchesWon: true,
      kills: true,
      deaths: true,
      wins: true,
      mvpCount: true,
      performancePoints: true,
      level: true,
      xp: true,
      createdAt: true,
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Get user's teams
router.get('/users/:userId/teams', auth, async (req, res) => {
  const userId = Number(req.params.userId);
  const teams = await prisma.team.findMany({
    where: {
      members: { some: { userId } }
    },
    include: {
      tower: true,
      captain: { select: { id: true, name: true, username: true } },
      _count: { select: { members: true } }
    }
  });
  res.json(teams);
});

module.exports = router;


