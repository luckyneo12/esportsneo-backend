const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');
const { assertLeaderOrCoLeader } = require('./towers.routes');
const { assertOrganizer } = require('./tournaments.routes');

const router = express.Router();

router.post('/tournaments/:tournamentId/registrations', auth, async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const { teamId } = req.body;
  if (!teamId) return res.status(400).json({ error: 'teamId required' });
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { tower: true } });
  if (!team) return res.status(404).json({ error: 'Team not found' });
  if (!(await assertLeaderOrCoLeader(req.userId, team.towerId))) return res.status(403).json({ error: 'Forbidden' });
  try {
    const reg = await prisma.tournamentRegistration.create({ data: { tournamentId, teamId, createdByUserId: req.userId } });
    res.json(reg);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Team already registered for this tournament' });
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/tournaments/:tournamentId/registrations/:registrationId/approve', auth, async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const registrationId = Number(req.params.registrationId);
  if (!(await assertOrganizer(req.userId, tournamentId))) return res.status(403).json({ error: 'Forbidden' });
  const reg = await prisma.tournamentRegistration.update({ where: { id: registrationId }, data: { status: 'APPROVED', approvedByUserId: req.userId } });
  res.json(reg);
});

router.post('/tournaments/:tournamentId/registrations/:registrationId/reject', auth, async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const registrationId = Number(req.params.registrationId);
  if (!(await assertOrganizer(req.userId, tournamentId))) return res.status(403).json({ error: 'Forbidden' });
  const reg = await prisma.tournamentRegistration.update({ where: { id: registrationId }, data: { status: 'REJECTED', approvedByUserId: req.userId } });
  res.json(reg);
});

router.get('/tournaments/:tournamentId/registrations', async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const regs = await prisma.tournamentRegistration.findMany({ where: { tournamentId }, include: { team: { include: { tower: true, members: { include: { user: true } } } } } });
  res.json(regs);
});

module.exports = router;


