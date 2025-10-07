const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');
const { assertLeaderOrCoLeader } = require('./towers.routes');

const router = express.Router();

router.post('/towers/:towerId/teams', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  if (!(await assertLeaderOrCoLeader(req.userId, towerId))) return res.status(403).json({ error: 'Forbidden' });
  try {
    const team = await prisma.team.create({ data: { name, towerId } });
    res.json(team);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Team name already exists in this tower' });
    res.status(500).json({ error: 'Failed to create team' });
  }
});

router.post('/teams/:teamId/members', auth, async (req, res) => {
  const teamId = Number(req.params.teamId);
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { tower: true } });
  if (!team) return res.status(404).json({ error: 'Team not found' });
  if (!(await assertLeaderOrCoLeader(req.userId, team.towerId))) return res.status(403).json({ error: 'Forbidden' });
  try {
    const member = await prisma.teamMember.create({ data: { teamId, userId } });
    res.json(member);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'User already in team' });
    res.status(500).json({ error: 'Add member failed' });
  }
});

module.exports = router;


