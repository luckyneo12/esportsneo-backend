const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');
const { assertOrganizer } = require('./tournaments.routes');

const router = express.Router();

router.post('/tournaments/:tournamentId/matches', auth, async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const { teamAId, teamBId, roomId } = req.body;
  if (!(await assertOrganizer(req.userId, tournamentId))) return res.status(403).json({ error: 'Forbidden' });
  const match = await prisma.match.create({ data: { tournamentId, teamAId, teamBId, roomId } });
  res.json(match);
});

router.put('/matches/:matchId/room', auth, async (req, res) => {
  const matchId = Number(req.params.matchId);
  const { roomId } = req.body;
  const match = await prisma.match.update({ where: { id: matchId }, data: { roomId } });
  res.json(match);
});

router.post('/matches/:matchId/proofs', auth, async (req, res) => {
  const matchId = Number(req.params.matchId);
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  const proof = await prisma.proof.create({ data: { matchId, uploadedById: req.userId, url } });
  res.json(proof);
});

router.post('/matches/:matchId/result', auth, async (req, res) => {
  const matchId = Number(req.params.matchId);
  const { winnerTeamId } = req.body;
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return res.status(404).json({ error: 'Match not found' });
  const tournamentId = match.tournamentId;
  if (!(await assertOrganizer(req.userId, tournamentId))) return res.status(403).json({ error: 'Forbidden' });
  const updated = await prisma.match.update({ where: { id: matchId }, data: { winnerTeamId } });
  res.json(updated);
});

router.get('/tournaments/:tournamentId/matches', async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  const matches = await prisma.match.findMany({ where: { tournamentId }, include: { teamA: true, teamB: true, winnerTeam: true } });
  res.json(matches);
});

module.exports = router;


