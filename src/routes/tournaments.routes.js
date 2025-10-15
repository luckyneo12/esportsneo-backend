const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');
const { notifyTowerOwnersAboutTournament, notifyTeamsAboutRoomDetails } = require('./notification.routes');

const router = express.Router();

async function assertOrganizer(userId, tournamentId) {
  const t = await prisma.tournament.findUnique({ where: { id: tournamentId }, include: { organizers: { select: { id: true } } } });
  if (!t) return false;
  return t.organizers.some((u) => u.id === userId);
}

async function assertOrganizerRole(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user && (user.role === 'ORGANISER' || user.role === 'SUPER_ADMIN');
}

router.post('/tournaments', auth, async (req, res) => {
  // Check if user is organizer
  if (!(await assertOrganizerRole(req.userId))) {
    return res.status(403).json({ error: 'Only organizers can create tournaments' });
  }
  
  const { title, game, mapPool, description, rules, bannerUrl, logoUrl, entryFee = 0, maxTeams, matchDateTime, allowedTowerIds, organizerIds = [] } = req.body;
  if (!title || !game || !maxTeams || !matchDateTime) {
    return res.status(400).json({ error: 'title, game, maxTeams, matchDateTime required' });
  }
  try {
    const tournament = await prisma.tournament.create({
      data: {
        title,
        game,
        mapPool,
        description,
        rules,
        bannerUrl,
        logoUrl,
        entryFee,
        maxTeams,
        matchDateTime: new Date(matchDateTime),
        allowedTowerIds: allowedTowerIds ? JSON.stringify(allowedTowerIds) : null,
        organizers: { connect: [...new Set([req.userId, ...organizerIds])].map((id) => ({ id })) },
      },
      include: { organizers: true },
    });
    
    // Notify tower owners about new tournament
    await notifyTowerOwnersAboutTournament(tournament.id, tournament.allowedTowerIds);
    
    res.json(tournament);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create tournament', details: e.message });
  }
});

router.get('/tournaments', async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  const list = await prisma.tournament.findMany({ 
    where, 
    include: { 
      organizers: { select: { id: true, name: true, username: true } },
      _count: { select: { registrations: true } }
    } 
  });
  res.json(list);
});

router.get('/tournaments/:tournamentId', async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const tournament = await prisma.tournament.findUnique({ 
    where: { id: tournamentId },
    include: { 
      organizers: { select: { id: true, name: true, username: true } },
      registrations: {
        include: {
          team: {
            include: {
              tower: true,
              captain: { select: { id: true, name: true, username: true } },
              members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } }
            }
          },
          createdBy: { select: { id: true, name: true, username: true } }
        }
      }
    } 
  });
  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
  res.json(tournament);
});

// Update room ID and password (Organizer only)
router.put('/tournaments/:tournamentId/room-details', auth, async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const { roomId, roomPassword } = req.body;
  
  if (!roomId) {
    return res.status(400).json({ error: 'roomId is required' });
  }
  
  if (!(await assertOrganizer(req.userId, tournamentId))) {
    return res.status(403).json({ error: 'Only tournament organizers can update room details' });
  }
  
  try {
    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { roomId, roomPassword }
    });
    
    // Notify all confirmed teams about room details
    await notifyTeamsAboutRoomDetails(tournamentId);
    
    res.json(tournament);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update room details', details: e.message });
  }
});

// Update tournament status
router.put('/tournaments/:tournamentId/status', auth, async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const { status } = req.body;
  
  if (!['UPCOMING', 'LIVE', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  if (!(await assertOrganizer(req.userId, tournamentId))) {
    return res.status(403).json({ error: 'Only tournament organizers can update status' });
  }
  
  try {
    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status }
    });
    
    res.json(tournament);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update status', details: e.message });
  }
});

module.exports = { router, assertOrganizer };


