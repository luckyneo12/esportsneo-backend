const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');
const { assertLeaderOrCoLeader } = require('./towers.routes');
const { assertOrganizer } = require('./tournaments.routes');
const { notifyTeamAboutRegistration } = require('./notification.routes');

const router = express.Router();

router.post('/tournaments/:tournamentId/registrations', auth, async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const { teamId } = req.body;
  if (!teamId) return res.status(400).json({ error: 'teamId required' });
  
  // Get team details
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { tower: true } });
  if (!team) return res.status(404).json({ error: 'Team not found' });
  
  // Check if user is tower owner or co-leader
  if (!(await assertLeaderOrCoLeader(req.userId, team.towerId))) {
    return res.status(403).json({ error: 'Only tower owner or co-leader can register teams' });
  }
  
  // Get tournament details
  const tournament = await prisma.tournament.findUnique({ 
    where: { id: tournamentId },
    include: { 
      registrations: { 
        where: { status: { in: ['PENDING', 'APPROVED'] } },
        include: { team: true }
      } 
    }
  });
  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
  
  // Check 1: Team already registered in this tournament?
  const existingReg = tournament.registrations.find(r => r.teamId === teamId);
  if (existingReg) {
    return res.status(409).json({ error: 'Team already registered for this tournament' });
  }
  
  // Check 2: Tournament maxTeams exceeded?
  const approvedCount = tournament.registrations.filter(r => r.status === 'APPROVED').length;
  if (approvedCount >= tournament.maxTeams) {
    return res.status(400).json({ error: 'Tournament has reached maximum teams limit' });
  }
  
  // Check 3: Team name unique in tournament?
  const duplicateName = tournament.registrations.find(r => r.team.name === team.name);
  if (duplicateName) {
    return res.status(409).json({ error: 'A team with this name is already registered in the tournament' });
  }
  
  try {
    const reg = await prisma.tournamentRegistration.create({ 
      data: { 
        tournamentId, 
        teamId, 
        createdByUserId: req.userId 
      },
      include: {
        team: { include: { tower: true, members: { include: { user: true } } } }
      }
    });
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
  
  const reg = await prisma.tournamentRegistration.update({ 
    where: { id: registrationId }, 
    data: { status: 'APPROVED', approvedByUserId: req.userId } 
  });
  
  // Notify team about approval
  await notifyTeamAboutRegistration(registrationId, true);
  
  res.json(reg);
});

router.post('/tournaments/:tournamentId/registrations/:registrationId/reject', auth, async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const registrationId = Number(req.params.registrationId);
  if (!(await assertOrganizer(req.userId, tournamentId))) return res.status(403).json({ error: 'Forbidden' });
  
  const reg = await prisma.tournamentRegistration.update({ 
    where: { id: registrationId }, 
    data: { status: 'REJECTED', approvedByUserId: req.userId } 
  });
  
  // Notify team about rejection
  await notifyTeamAboutRegistration(registrationId, false);
  
  res.json(reg);
});

router.get('/tournaments/:tournamentId/registrations', async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const regs = await prisma.tournamentRegistration.findMany({ where: { tournamentId }, include: { team: { include: { tower: true, members: { include: { user: true } } } } } });
  res.json(regs);
});

module.exports = router;


