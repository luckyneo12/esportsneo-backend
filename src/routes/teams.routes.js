const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');
const { assertLeaderOrCoLeader } = require('./towers.routes');

const router = express.Router();

router.post('/towers/:towerId/teams', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const { name, logoUrl, captainId } = req.body;
  
  if (!name) return res.status(400).json({ error: 'name required' });
  if (!logoUrl) return res.status(400).json({ error: 'logoUrl required - team logo is mandatory' });
  
  if (!(await assertLeaderOrCoLeader(req.userId, towerId))) {
    return res.status(403).json({ error: 'Only tower owner or co-leader can create teams' });
  }
  
  // Check tower maxTeams limit
  const tower = await prisma.tower.findUnique({
    where: { id: towerId },
    include: { _count: { select: { teams: true } } }
  });
  
  if (!tower) return res.status(404).json({ error: 'Tower not found' });
  
  if (tower._count.teams >= tower.maxTeams) {
    return res.status(400).json({ 
      error: `Tower has reached maximum teams limit (${tower.maxTeams})` 
    });
  }
  
  try {
    const team = await prisma.team.create({ 
      data: { 
        name, 
        towerId,
        logoUrl,
        captainId 
      },
      include: {
        tower: true,
        captain: { select: { id: true, name: true, username: true } },
        members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } }
      }
    });
    res.json(team);
  } catch (e) {
    if (e.code === 'P2002') {
      // Check which unique constraint was violated
      if (e.meta?.target?.includes('name')) {
        return res.status(409).json({ error: 'Team name already exists globally or in this tower' });
      }
      return res.status(409).json({ error: 'Team name already exists' });
    }
    res.status(500).json({ error: 'Failed to create team', details: e.message });
  }
});

router.post('/teams/:teamId/members', auth, async (req, res) => {
  const teamId = Number(req.params.teamId);
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { tower: true } });
  if (!team) return res.status(404).json({ error: 'Team not found' });
  if (!(await assertLeaderOrCoLeader(req.userId, team.towerId))) {
    return res.status(403).json({ error: 'Only tower owner or co-leader can add members' });
  }
  try {
    const member = await prisma.teamMember.create({ data: { teamId, userId } });
    res.json(member);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'User already in team' });
    res.status(500).json({ error: 'Add member failed' });
  }
});

router.get('/towers/:towerId/teams', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const teams = await prisma.team.findMany({
    where: { towerId },
    include: {
      tower: true,
      captain: { select: { id: true, name: true, username: true } },
      members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } },
      _count: { select: { members: true } }
    }
  });
  res.json(teams);
});

router.get('/teams/:teamId', async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      tower: true,
      captain: { select: { id: true, name: true, username: true } },
      members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } }
    }
  });
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
});

module.exports = router;


