const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Helper function to check if user is tower owner or co-leader
async function isTowerAdmin(userId, towerId) {
  const tower = await prisma.tower.findUnique({ where: { id: towerId } });
  if (!tower) return false;
  if (tower.leaderId === userId || tower.coLeaderId === userId) return true;
  
  const member = await prisma.towerMember.findFirst({
    where: { towerId, userId, role: 'CO_LEADER', approved: true }
  });
  return !!member;
}

// Get Complete Tower Overview
router.get('/towers/:towerId/overview', async (req, res) => {
  const towerId = Number(req.params.towerId);
  
  const tower = await prisma.tower.findUnique({
    where: { id: towerId },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          level: true,
          xp: true
        }
      },
      members: {
        where: { approved: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              role: true,
              level: true,
              xp: true,
              matchesPlayed: true,
              matchesWon: true,
              kills: true,
              mvpCount: true,
              performancePoints: true
            }
          }
        },
        orderBy: [
          { role: 'asc' },
          { joinedAt: 'asc' }
        ]
      },
      teams: {
        include: {
          captain: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatarUrl: true
                }
              }
            }
          },
          registrations: {
            where: {
              status: { in: ['PENDING', 'APPROVED'] }
            },
            include: {
              tournament: {
                select: {
                  id: true,
                  title: true,
                  status: true
                }
              }
            }
          },
          _count: {
            select: { members: true }
          }
        }
      },
      badges: {
        orderBy: { earnedAt: 'desc' }
      },
      _count: {
        select: {
          members: true,
          teams: true
        }
      }
    }
  });
  
  if (!tower) return res.status(404).json({ error: 'Tower not found' });
  
  // Get co-leader details if exists
  let coLeader = null;
  if (tower.coLeaderId) {
    coLeader = await prisma.user.findUnique({
      where: { id: tower.coLeaderId },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        level: true,
        xp: true
      }
    });
  }
  
  res.json({
    ...tower,
    coLeader,
    stats: {
      totalMembers: tower._count.members + 1, // +1 for leader
      totalTeams: tower._count.teams,
      tournamentsParticipated: tower.tournamentsParticipated,
      tournamentsWon: tower.tournamentsWon,
      totalPoints: tower.totalPoints
    }
  });
});

// Get Tower Members with Performance
router.get('/towers/:towerId/members', async (req, res) => {
  const towerId = Number(req.params.towerId);
  
  const tower = await prisma.tower.findUnique({
    where: { id: towerId },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          level: true,
          xp: true,
          matchesPlayed: true,
          matchesWon: true,
          kills: true,
          deaths: true,
          mvpCount: true,
          performancePoints: true
        }
      },
      members: {
        where: { approved: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              level: true,
              xp: true,
              matchesPlayed: true,
              matchesWon: true,
              kills: true,
              deaths: true,
              mvpCount: true,
              performancePoints: true
            }
          }
        },
        orderBy: { joinedAt: 'asc' }
      }
    }
  });
  
  if (!tower) return res.status(404).json({ error: 'Tower not found' });
  
  // Get co-leader
  let coLeader = null;
  if (tower.coLeaderId) {
    coLeader = await prisma.user.findUnique({
      where: { id: tower.coLeaderId },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        level: true,
        xp: true,
        matchesPlayed: true,
        matchesWon: true,
        kills: true,
        deaths: true,
        mvpCount: true,
        performancePoints: true
      }
    });
  }
  
  // Build members list with roles
  const membersList = [
    {
      ...tower.leader,
      role: 'OWNER',
      joinedAt: tower.createdAt,
      kdRatio: tower.leader.deaths > 0 ? (tower.leader.kills / tower.leader.deaths).toFixed(2) : tower.leader.kills,
      winRate: tower.leader.matchesPlayed > 0 ? ((tower.leader.matchesWon / tower.leader.matchesPlayed) * 100).toFixed(1) : 0
    }
  ];
  
  if (coLeader) {
    membersList.push({
      ...coLeader,
      role: 'CO_LEADER',
      joinedAt: tower.createdAt,
      kdRatio: coLeader.deaths > 0 ? (coLeader.kills / coLeader.deaths).toFixed(2) : coLeader.kills,
      winRate: coLeader.matchesPlayed > 0 ? ((coLeader.matchesWon / coLeader.matchesPlayed) * 100).toFixed(1) : 0
    });
  }
  
  tower.members.forEach(member => {
    membersList.push({
      ...member.user,
      role: member.role,
      joinedAt: member.joinedAt,
      kdRatio: member.user.deaths > 0 ? (member.user.kills / member.user.deaths).toFixed(2) : member.user.kills,
      winRate: member.user.matchesPlayed > 0 ? ((member.user.matchesWon / member.user.matchesPlayed) * 100).toFixed(1) : 0
    });
  });
  
  res.json({
    towerId: tower.id,
    towerName: tower.name,
    members: membersList,
    totalMembers: membersList.length
  });
});

// Get Tower Teams with Status
router.get('/towers/:towerId/teams-status', async (req, res) => {
  const towerId = Number(req.params.towerId);
  
  const teams = await prisma.team.findMany({
    where: { towerId },
    include: {
      captain: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true
            }
          }
        }
      },
      registrations: {
        where: {
          status: { in: ['PENDING', 'APPROVED'] }
        },
        include: {
          tournament: {
            select: {
              id: true,
              title: true,
              game: true,
              status: true,
              matchDateTime: true
            }
          }
        }
      },
      _count: {
        select: { members: true }
      }
    }
  });
  
  const teamsWithStatus = teams.map(team => {
    const ongoingTournaments = team.registrations.filter(r => 
      r.tournament.status === 'UPCOMING' || r.tournament.status === 'LIVE'
    );
    
    const status = ongoingTournaments.length > 0 ? 'REGISTERED' : 'FREE';
    
    return {
      ...team,
      status,
      memberCount: team._count.members,
      slotsAvailable: 4 - team._count.members, // Assuming 4 members per team
      currentTournaments: ongoingTournaments.map(r => ({
        id: r.tournament.id,
        title: r.tournament.title,
        status: r.status,
        tournamentStatus: r.tournament.status
      }))
    };
  });
  
  res.json(teamsWithStatus);
});

// Get Tower Tournaments
router.get('/towers/:towerId/tournaments', async (req, res) => {
  const towerId = Number(req.params.towerId);
  
  // Get all registrations for teams in this tower
  const registrations = await prisma.tournamentRegistration.findMany({
    where: {
      team: {
        towerId
      }
    },
    include: {
      tournament: {
        select: {
          id: true,
          title: true,
          game: true,
          logoUrl: true,
          status: true,
          matchDateTime: true,
          roomId: true,
          roomPassword: true,
          createdAt: true
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          logoUrl: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  // Separate into categories
  const ongoing = registrations.filter(r => 
    (r.tournament.status === 'UPCOMING' || r.tournament.status === 'LIVE') &&
    r.status === 'APPROVED'
  );
  
  const pending = registrations.filter(r => 
    r.status === 'PENDING'
  );
  
  const past = registrations.filter(r => 
    r.tournament.status === 'COMPLETED'
  );
  
  res.json({
    ongoing,
    pending,
    past,
    stats: {
      totalParticipated: registrations.length,
      totalApproved: registrations.filter(r => r.status === 'APPROVED').length,
      totalPending: pending.length
    }
  });
});

// Get Tower Leaderboard
router.get('/towers/:towerId/leaderboard', async (req, res) => {
  const towerId = Number(req.params.towerId);
  
  const tower = await prisma.tower.findUnique({
    where: { id: towerId },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          performancePoints: true,
          matchesPlayed: true,
          matchesWon: true,
          kills: true,
          deaths: true,
          mvpCount: true
        }
      },
      members: {
        where: { approved: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              performancePoints: true,
              matchesPlayed: true,
              matchesWon: true,
              kills: true,
              deaths: true,
              mvpCount: true
            }
          }
        }
      }
    }
  });
  
  if (!tower) return res.status(404).json({ error: 'Tower not found' });
  
  // Combine all members
  const allMembers = [
    tower.leader,
    ...tower.members.map(m => m.user)
  ];
  
  // Sort by performance points
  const leaderboard = allMembers
    .map((member, index) => ({
      rank: index + 1,
      ...member,
      kdRatio: member.deaths > 0 ? (member.kills / member.deaths).toFixed(2) : member.kills,
      winRate: member.matchesPlayed > 0 ? ((member.matchesWon / member.matchesPlayed) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.performancePoints - a.performancePoints)
    .map((member, index) => ({
      ...member,
      rank: index + 1
    }));
  
  res.json({
    towerId: tower.id,
    towerName: tower.name,
    leaderboard
  });
});

// Get Tower Announcements
router.get('/towers/:towerId/announcements', async (req, res) => {
  const towerId = Number(req.params.towerId);
  
  const announcements = await prisma.towerAnnouncement.findMany({
    where: { towerId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  
  res.json(announcements);
});

// Create Tower Announcement (Owner/Co-Leader only)
router.post('/towers/:towerId/announcements', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const { title, message } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ error: 'title and message required' });
  }
  
  if (!(await isTowerAdmin(req.userId, towerId))) {
    return res.status(403).json({ error: 'Only tower owner or co-leader can create announcements' });
  }
  
  const announcement = await prisma.towerAnnouncement.create({
    data: {
      towerId,
      title,
      message,
      createdBy: req.userId
    }
  });
  
  res.json(announcement);
});

// Update Tower Settings (Owner/Co-Leader only)
router.put('/towers/:towerId/settings', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const { name, logoUrl, bannerUrl, description, maxTeams, maxMembers } = req.body;
  
  if (!(await isTowerAdmin(req.userId, towerId))) {
    return res.status(403).json({ error: 'Only tower owner or co-leader can update settings' });
  }
  
  try {
    const tower = await prisma.tower.update({
      where: { id: towerId },
      data: {
        name,
        logoUrl,
        bannerUrl,
        description,
        maxTeams,
        maxMembers
      }
    });
    
    res.json(tower);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Tower name already exists' });
    }
    res.status(500).json({ error: 'Failed to update tower', details: e.message });
  }
});

// Promote Member to Elite (Owner/Co-Leader only)
router.post('/towers/:towerId/members/:memberId/promote', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const memberId = Number(req.params.memberId);
  
  if (!(await isTowerAdmin(req.userId, towerId))) {
    return res.status(403).json({ error: 'Only tower owner or co-leader can promote members' });
  }
  
  const member = await prisma.towerMember.update({
    where: { id: memberId },
    data: { role: 'ELITE_MEMBER' }
  });
  
  res.json(member);
});

// Demote Elite Member to Regular (Owner/Co-Leader only)
router.post('/towers/:towerId/members/:memberId/demote', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const memberId = Number(req.params.memberId);
  
  if (!(await isTowerAdmin(req.userId, towerId))) {
    return res.status(403).json({ error: 'Only tower owner or co-leader can demote members' });
  }
  
  const member = await prisma.towerMember.update({
    where: { id: memberId },
    data: { role: 'MEMBER' }
  });
  
  res.json(member);
});

// Assign Co-Leader (Owner only)
router.post('/towers/:towerId/assign-coleader/:userId', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  const coLeaderId = Number(req.params.userId);
  
  const tower = await prisma.tower.findUnique({ where: { id: towerId } });
  
  if (!tower) return res.status(404).json({ error: 'Tower not found' });
  
  if (tower.leaderId !== req.userId) {
    return res.status(403).json({ error: 'Only tower owner can assign co-leader' });
  }
  
  // Check if user is a member
  const member = await prisma.towerMember.findFirst({
    where: { towerId, userId: coLeaderId, approved: true }
  });
  
  if (!member) {
    return res.status(404).json({ error: 'User is not a member of this tower' });
  }
  
  // Update tower co-leader
  const updatedTower = await prisma.tower.update({
    where: { id: towerId },
    data: { coLeaderId }
  });
  
  // Update member role
  await prisma.towerMember.update({
    where: { id: member.id },
    data: { role: 'CO_LEADER' }
  });
  
  res.json(updatedTower);
});

// Remove Co-Leader (Owner only)
router.delete('/towers/:towerId/coleader', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  
  const tower = await prisma.tower.findUnique({ where: { id: towerId } });
  
  if (!tower) return res.status(404).json({ error: 'Tower not found' });
  
  if (tower.leaderId !== req.userId) {
    return res.status(403).json({ error: 'Only tower owner can remove co-leader' });
  }
  
  if (!tower.coLeaderId) {
    return res.status(400).json({ error: 'No co-leader assigned' });
  }
  
  // Find co-leader member
  const member = await prisma.towerMember.findFirst({
    where: { towerId, userId: tower.coLeaderId }
  });
  
  // Update tower
  const updatedTower = await prisma.tower.update({
    where: { id: towerId },
    data: { coLeaderId: null }
  });
  
  // Demote member to regular
  if (member) {
    await prisma.towerMember.update({
      where: { id: member.id },
      data: { role: 'MEMBER' }
    });
  }
  
  res.json(updatedTower);
});

// Delete Tower (Owner only)
router.delete('/towers/:towerId', auth, async (req, res) => {
  const towerId = Number(req.params.towerId);
  
  const tower = await prisma.tower.findUnique({ where: { id: towerId } });
  
  if (!tower) return res.status(404).json({ error: 'Tower not found' });
  
  if (tower.leaderId !== req.userId) {
    return res.status(403).json({ error: 'Only tower owner can delete tower' });
  }
  
  // Check if tower has teams
  const teamsCount = await prisma.team.count({ where: { towerId } });
  
  if (teamsCount > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete tower with existing teams. Delete all teams first.' 
    });
  }
  
  // Delete all members first
  await prisma.towerMember.deleteMany({ where: { towerId } });
  
  // Delete tower
  await prisma.tower.delete({ where: { id: towerId } });
  
  res.json({ message: 'Tower deleted successfully' });
});

module.exports = router;
