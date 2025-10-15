const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');

const router = express.Router();

function generateTowerCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
async function assertLeaderOrCoLeader(userId, towerId) {
  const member = await prisma.towerMember.findFirst({ where: { towerId, userId, approved: true } });
  if (!member) return false;
  if (member.role === 'CO_LEADER') return true;
  const tower = await prisma.tower.findUnique({ where: { id: towerId } });
  return tower && tower.leaderId === userId;
}

router.post('/towers', auth, async (req, res) => {
  const { name, logoUrl, maxTeams = 10, bannerUrl, description, area } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  
  // Check if user already owns or is in a tower
  const existingMembership = await prisma.towerMember.findFirst({
    where: { userId: req.userId, approved: true }
  });
  
  if (existingMembership) {
    return res.status(409).json({ error: 'You are already in a tower. Leave your current tower first.' });
  }
  
  // Check if tower name already exists
  const existingTower = await prisma.tower.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } }
  });
  
  if (existingTower) {
    return res.status(409).json({ error: 'Tower name already exists. Please choose a different name.' });
  }
  
  const code = generateTowerCode();
  try {
    const tower = await prisma.$transaction(async (tx) => {
      const t = await tx.tower.create({ 
        data: { 
          name, 
          logoUrl,
          bannerUrl,
          description,
          area,
          code, 
          leaderId: req.userId,
          maxTeams
        } 
      });
      await tx.towerMember.create({ 
        data: { 
          towerId: t.id, 
          userId: req.userId, 
          role: 'MEMBER', 
          approved: true 
        } 
      });
      return t;
    });
    res.json(tower);
  } catch (e) {
    console.error('Tower creation error:', e);
    if (e.code === 'P2002') {
      // Check which field caused the unique constraint violation
      const target = e.meta?.target;
      if (target && target.includes('name')) {
        return res.status(409).json({ error: 'Tower name already exists. Please choose a different name.' });
      }
      if (target && target.includes('code')) {
        // Retry with new code
        return res.status(500).json({ error: 'Failed to generate unique code. Please try again.' });
      }
      return res.status(409).json({ error: 'A tower with this information already exists.' });
    }
    res.status(500).json({ error: 'Failed to create tower', details: e.message });
  }
});

router.post('/towers/join', auth, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'code required' });
  const tower = await prisma.tower.findUnique({ where: { code } });
  if (!tower) return res.status(404).json({ error: 'Tower not found' });
  try {
    const member = await prisma.towerMember.create({ data: { towerId: tower.id, userId: req.userId } });
    res.json(member);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'User already in a tower or already requested' });
    res.status(500).json({ error: 'Join failed' });
  }
});

router.post('/towers/:towerId/members/:memberId/approve', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const memberId = Number(req.params.memberId);
  if (!(await assertLeaderOrCoLeader(req.userId, towerId))) return res.status(403).json({ error: 'Forbidden' });
  const updated = await prisma.towerMember.update({ where: { id: memberId }, data: { approved: true } });
  res.json(updated);
});

router.delete('/towers/:towerId/members/:memberId', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const memberId = Number(req.params.memberId);
  if (!(await assertLeaderOrCoLeader(req.userId, towerId))) return res.status(403).json({ error: 'Forbidden' });
  await prisma.towerMember.delete({ where: { id: memberId } });
  res.json({ ok: true });
});

router.post('/towers/:towerId/coleaders/:userId', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const userId = Number(req.params.userId);
  if (!(await assertLeaderOrCoLeader(req.userId, towerId))) return res.status(403).json({ error: 'Forbidden' });
  const member = await prisma.towerMember.updateMany({ where: { towerId, userId }, data: { approved: true, role: 'CO_LEADER' } });
  if (member.count === 0) return res.status(404).json({ error: 'Member not found' });
  res.json({ ok: true });
});

// Get all towers (public)
router.get('/towers', async (req, res) => {
  const { userId } = req.query;
  
  try {
    let towers;
    
    if (userId) {
      // Get towers for specific user
      towers = await prisma.tower.findMany({
        where: {
          OR: [
            { leaderId: Number(userId) },
            { members: { some: { userId: Number(userId), approved: true } } }
          ]
        },
        include: {
          leader: { select: { id: true, name: true, username: true, avatarUrl: true } },
          _count: { select: { members: true, teams: true } }
        }
      });
    } else {
      // Get all towers
      towers = await prisma.tower.findMany({
        include: {
          leader: { select: { id: true, name: true, username: true, avatarUrl: true } },
          _count: { select: { members: true, teams: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    
    res.json(towers);
  } catch (e) {
    console.error('Fetch towers error:', e);
    res.status(500).json({ error: 'Failed to fetch towers', details: e.message });
  }
});

router.get('/towers/:towerId', async (req, res) => {
  const towerId = Number(req.params.towerId);
  const tower = await prisma.tower.findUnique({
    where: { id: towerId },
    include: {
      leader: { select: { id: true, name: true, username: true, avatarUrl: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, username: true, avatarUrl: true } }
        }
      },
      teams: {
        include: {
          captain: { select: { id: true, name: true, username: true } },
          _count: { select: { members: true } }
        }
      }
    }
  });
  if (!tower) return res.status(404).json({ error: 'Tower not found' });
  res.json(tower);
});

router.get('/users/:userId/towers', auth, async (req, res) => {
  const userId = Number(req.params.userId);
  const towers = await prisma.tower.findMany({
    where: {
      OR: [
        { leaderId: userId },
        { members: { some: { userId, approved: true } } }
      ]
    },
    include: {
      leader: { select: { id: true, name: true, username: true } },
      _count: { select: { members: true, teams: true } }
    }
  });
  res.json(towers);
});

module.exports = { router, assertLeaderOrCoLeader };


