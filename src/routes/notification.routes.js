const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Get my notifications
router.get('/notifications', auth, async (req, res) => {
  const { unreadOnly } = req.query;
  
  const where = { userId: req.userId };
  if (unreadOnly === 'true') {
    where.read = false;
  }
  
  const notifications = await prisma.notification.findMany({
    where,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  
  res.json(notifications);
});

// Mark notification as read
router.post('/notifications/:notificationId/read', auth, async (req, res) => {
  const notificationId = Number(req.params.notificationId);
  
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId, userId: req.userId },
      data: { read: true }
    });
    
    res.json(notification);
  } catch (e) {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// Mark all notifications as read
router.post('/notifications/read-all', auth, async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { userId: req.userId, read: false },
    data: { read: true }
  });
  
  res.json({ message: 'All notifications marked as read', count: result.count });
});

// Get unread count
router.get('/notifications/unread-count', auth, async (req, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.userId, read: false }
  });
  
  res.json({ count });
});

// Delete notification
router.delete('/notifications/:notificationId', auth, async (req, res) => {
  const notificationId = Number(req.params.notificationId);
  
  try {
    await prisma.notification.delete({
      where: { id: notificationId, userId: req.userId }
    });
    
    res.json({ message: 'Notification deleted' });
  } catch (e) {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// Helper function to create notification (exported for use in other routes)
async function createNotification(userId, type, title, message, data = null, sentBy = null) {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : null,
      sentBy
    }
  });
}

// Helper function to notify tower owners about new tournament
async function notifyTowerOwnersAboutTournament(tournamentId, allowedTowerIds = null) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { organizers: true }
  });
  
  if (!tournament) return;
  
  // Get tower owners
  let towers;
  if (allowedTowerIds) {
    const towerIds = JSON.parse(allowedTowerIds);
    towers = await prisma.tower.findMany({
      where: { id: { in: towerIds } },
      include: { leader: true }
    });
  } else {
    towers = await prisma.tower.findMany({
      include: { leader: true }
    });
  }
  
  // Create notifications for each tower owner
  const notifications = towers.map(tower => ({
    userId: tower.leaderId,
    type: 'TOURNAMENT_CREATED',
    title: `New Tournament: ${tournament.title}`,
    message: `A new ${tournament.game} tournament has been created. Register your teams now!`,
    data: JSON.stringify({ tournamentId: tournament.id }),
    sentBy: tournament.organizers[0]?.id || null
  }));
  
  await prisma.notification.createMany({ data: notifications });
}

// Helper function to notify team about registration status
async function notifyTeamAboutRegistration(registrationId, approved) {
  const registration = await prisma.tournamentRegistration.findUnique({
    where: { id: registrationId },
    include: {
      team: { include: { members: true, tower: true } },
      tournament: true,
      approvedBy: true
    }
  });
  
  if (!registration) return;
  
  const type = approved ? 'REGISTRATION_APPROVED' : 'REGISTRATION_REJECTED';
  const title = approved 
    ? `Team Registered: ${registration.tournament.title}`
    : `Registration Rejected: ${registration.tournament.title}`;
  const message = approved
    ? `Your team ${registration.team.name} has been confirmed for ${registration.tournament.title}!`
    : `Your team ${registration.team.name}'s registration for ${registration.tournament.title} was rejected.`;
  
  // Notify tower owner
  const notifications = [{
    userId: registration.team.tower.leaderId,
    type,
    title,
    message,
    data: JSON.stringify({ 
      tournamentId: registration.tournamentId,
      teamId: registration.teamId,
      registrationId: registration.id
    }),
    sentBy: registration.approvedByUserId
  }];
  
  // Notify all team members
  registration.team.members.forEach(member => {
    notifications.push({
      userId: member.userId,
      type,
      title,
      message,
      data: JSON.stringify({ 
        tournamentId: registration.tournamentId,
        teamId: registration.teamId,
        registrationId: registration.id
      }),
      sentBy: registration.approvedByUserId
    });
  });
  
  await prisma.notification.createMany({ data: notifications });
}

// Helper function to notify teams about room details
async function notifyTeamsAboutRoomDetails(tournamentId) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      registrations: {
        where: { status: 'APPROVED' },
        include: {
          team: {
            include: {
              members: true,
              tower: true
            }
          }
        }
      }
    }
  });
  
  if (!tournament || !tournament.roomId) return;
  
  const notifications = [];
  
  tournament.registrations.forEach(registration => {
    const message = `Your team ${registration.team.name} has been confirmed for ${tournament.title}.\n\nRoom ID: ${tournament.roomId}\nPassword: ${tournament.roomPassword || 'N/A'}`;
    
    // Notify tower owner
    notifications.push({
      userId: registration.team.tower.leaderId,
      type: 'ROOM_DETAILS',
      title: `Room Details: ${tournament.title}`,
      message,
      data: JSON.stringify({
        tournamentId: tournament.id,
        teamId: registration.teamId,
        roomId: tournament.roomId,
        roomPassword: tournament.roomPassword
      })
    });
    
    // Notify all team members
    registration.team.members.forEach(member => {
      notifications.push({
        userId: member.userId,
        type: 'ROOM_DETAILS',
        title: `Room Details: ${tournament.title}`,
        message,
        data: JSON.stringify({
          tournamentId: tournament.id,
          teamId: registration.teamId,
          roomId: tournament.roomId,
          roomPassword: tournament.roomPassword
        })
      });
    });
  });
  
  await prisma.notification.createMany({ data: notifications });
}

module.exports = {
  router,
  createNotification,
  notifyTowerOwnersAboutTournament,
  notifyTeamAboutRegistration,
  notifyTeamsAboutRoomDetails
};
