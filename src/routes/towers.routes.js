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
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const code = generateTowerCode();
  try {
    const tower = await prisma.$transaction(async (tx) => {
      const t = await tx.tower.create({ data: { name, code, leaderId: req.userId } });
      await tx.towerMember.create({ data: { towerId: t.id, userId: req.userId, role: 'CO_LEADER', approved: true } });
      return t;
    });
    res.json(tower);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create tower' });
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

module.exports = { router, assertLeaderOrCoLeader };


