const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');

const router = express.Router();

async function assertOrganizer(userId, tournamentId) {
  const t = await prisma.tournament.findUnique({ where: { id: tournamentId }, include: { organizers: { select: { id: true } } } });
  if (!t) return false;
  return t.organizers.some((u) => u.id === userId);
}

router.post('/tournaments', auth, async (req, res) => {
  const { name, game, entryFee = 0, maxTeams, matchDateTime, organizerIds = [] } = req.body;
  if (!name || !game || !maxTeams || !matchDateTime) return res.status(400).json({ error: 'name, game, maxTeams, matchDateTime required' });
  try {
    const tournament = await prisma.tournament.create({
      data: {
        name,
        game,
        entryFee,
        maxTeams,
        matchDateTime: new Date(matchDateTime),
        organizers: { connect: [...new Set([req.userId, ...organizerIds])].map((id) => ({ id })) },
      },
      include: { organizers: true },
    });
    res.json(tournament);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

router.get('/tournaments', async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  const list = await prisma.tournament.findMany({ where, include: { organizers: true } });
  res.json(list);
});

module.exports = { router, assertOrganizer };


