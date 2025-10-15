const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

// Global Player Leaderboard
router.get('/leaderboard/players', async (req, res) => {
  const { limit = 50, offset = 0, period = 'allTime' } = req.query;
  
  // Calculate date filter based on period
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: weekAgo } };
      break;
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: monthAgo } };
      break;
    case 'year':
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: yearAgo } };
      break;
    case 'allTime':
    default:
      dateFilter = {};
  }
  
  const players = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      gameId: true,
      role: true,
      level: true,
      xp: true,
      matchesPlayed: true,
      matchesWon: true,
      kills: true,
      deaths: true,
      wins: true,
      mvpCount: true,
      performancePoints: true,
      
      // Tower info
      ledTowers: {
        select: {
          id: true,
          name: true,
          logoUrl: true
        }
      },
      towerMemberships: {
        where: { approved: true },
        select: {
          tower: {
            select: {
              id: true,
              name: true,
              logoUrl: true
            }
          }
        }
      },
      
      // Team info
      captainedTeams: {
        select: {
          id: true,
          name: true,
          logoUrl: true
        }
      },
      teamMemberships: {
        select: {
          team: {
            select: {
              id: true,
              name: true,
              logoUrl: true
            }
          }
        }
      },
      
      // Tournament participation
      registrationsCreated: {
        where: {
          status: 'APPROVED'
        },
        select: {
          id: true,
          tournament: {
            select: {
              id: true,
              title: true,
              status: true
            }
          }
        }
      },
      
      // Badges
      badges: {
        include: {
          badge: true
        },
        take: 5
      }
    },
    orderBy: {
      performancePoints: 'desc'
    },
    take: Number(limit),
    skip: Number(offset)
  });
  
  // Calculate additional stats and rank
  const leaderboard = players.map((player, index) => {
    const kdRatio = player.deaths > 0 
      ? (player.kills / player.deaths).toFixed(2) 
      : player.kills;
    
    const winRate = player.matchesPlayed > 0 
      ? ((player.matchesWon / player.matchesPlayed) * 100).toFixed(1) 
      : 0;
    
    // Get current tower
    const currentTower = player.ledTowers.length > 0 
      ? player.ledTowers[0] 
      : (player.towerMemberships.length > 0 ? player.towerMemberships[0].tower : null);
    
    // Get current team
    const currentTeam = player.captainedTeams.length > 0 
      ? player.captainedTeams[0] 
      : (player.teamMemberships.length > 0 ? player.teamMemberships[0].team : null);
    
    // Tournament stats
    const tournamentsPlayed = player.registrationsCreated.length;
    const ongoingTournaments = player.registrationsCreated.filter(r => 
      r.tournament.status === 'LIVE' || r.tournament.status === 'UPCOMING'
    ).length;
    
    return {
      rank: Number(offset) + index + 1,
      id: player.id,
      name: player.name,
      username: player.username,
      avatarUrl: player.avatarUrl,
      gameId: player.gameId,
      role: player.role,
      level: player.level,
      xp: player.xp,
      
      // Stats
      performancePoints: player.performancePoints,
      matchesPlayed: player.matchesPlayed,
      matchesWon: player.matchesWon,
      kills: player.kills,
      deaths: player.deaths,
      wins: player.wins,
      mvpCount: player.mvpCount,
      kdRatio: parseFloat(kdRatio),
      winRate: parseFloat(winRate),
      
      // Current associations
      currentTower,
      currentTeam,
      
      // Tournament info
      tournamentsPlayed,
      ongoingTournaments,
      
      // Badges
      badges: player.badges.slice(0, 3).map(b => ({
        type: b.badge.type,
        name: b.badge.name,
        iconUrl: b.badge.iconUrl
      }))
    };
  });
  
  // Get total count for pagination
  const totalPlayers = await prisma.user.count();
  
  res.json({
    leaderboard,
    period,
    updatedAt: new Date().toISOString(),
    pagination: {
      total: totalPlayers,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < totalPlayers
    }
  });
});

// Tower Leaderboard (Global)
router.get('/leaderboard/towers', async (req, res) => {
  const { limit = 50, offset = 0, period = 'allTime' } = req.query;
  
  // Calculate date filter based on period
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: weekAgo } };
      break;
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: monthAgo } };
      break;
    case 'year':
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: yearAgo } };
      break;
    case 'allTime':
    default:
      dateFilter = {};
  }
  
  const towers = await prisma.tower.findMany({
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true
        }
      },
      _count: {
        select: {
          members: true,
          teams: true
        }
      },
      badges: {
        take: 3
      }
    },
    orderBy: {
      totalPoints: 'desc'
    },
    take: Number(limit),
    skip: Number(offset)
  });
  
  const leaderboard = towers.map((tower, index) => ({
    rank: Number(offset) + index + 1,
    id: tower.id,
    name: tower.name,
    logoUrl: tower.logoUrl,
    bannerUrl: tower.bannerUrl,
    code: tower.code,
    level: tower.level,
    xp: tower.xp,
    totalPoints: tower.totalPoints,
    tournamentsParticipated: tower.tournamentsParticipated,
    tournamentsWon: tower.tournamentsWon,
    totalMembers: tower._count.members + 1, // +1 for leader
    totalTeams: tower._count.teams,
    leader: tower.leader,
    badges: tower.badges.map(b => ({
      type: b.type,
      name: b.name,
      iconUrl: b.iconUrl
    }))
  }));
  
  const totalTowers = await prisma.tower.count();
  
  res.json({
    leaderboard,
    period,
    updatedAt: new Date().toISOString(),
    pagination: {
      total: totalTowers,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < totalTowers
    }
  });
});

// Team Leaderboard (Global)
router.get('/leaderboard/teams', async (req, res) => {
  const { limit = 50, offset = 0, period = 'allTime' } = req.query;
  
  // Calculate date filter based on period
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: weekAgo } };
      break;
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: monthAgo } };
      break;
    case 'year':
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: yearAgo } };
      break;
    case 'allTime':
    default:
      dateFilter = {};
  }
  
  const teams = await prisma.team.findMany({
    include: {
      tower: {
        select: {
          id: true,
          name: true,
          logoUrl: true
        }
      },
      captain: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          performancePoints: true
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              performancePoints: true,
              kills: true,
              deaths: true,
              mvpCount: true
            }
          }
        }
      },
      registrations: {
        where: {
          status: 'APPROVED'
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
      }
    },
    take: Number(limit),
    skip: Number(offset)
  });
  
  // Calculate team stats
  const teamsWithStats = teams.map(team => {
    // Calculate total team performance points
    const totalPoints = team.members.reduce((sum, member) => 
      sum + member.user.performancePoints, 0
    );
    
    // Calculate total kills
    const totalKills = team.members.reduce((sum, member) => 
      sum + member.user.kills, 0
    );
    
    // Calculate total deaths
    const totalDeaths = team.members.reduce((sum, member) => 
      sum + member.user.deaths, 0
    );
    
    // Calculate team K/D
    const teamKD = totalDeaths > 0 
      ? (totalKills / totalDeaths).toFixed(2) 
      : totalKills;
    
    // Calculate total MVPs
    const totalMVPs = team.members.reduce((sum, member) => 
      sum + member.user.mvpCount, 0
    );
    
    // Tournament stats
    const tournamentsPlayed = team.registrations.length;
    const ongoingTournaments = team.registrations.filter(r => 
      r.tournament.status === 'LIVE' || r.tournament.status === 'UPCOMING'
    ).length;
    
    return {
      id: team.id,
      name: team.name,
      logoUrl: team.logoUrl,
      tower: team.tower,
      captain: team.captain,
      memberCount: team.members.length,
      totalPoints,
      totalKills,
      totalDeaths,
      teamKD: parseFloat(teamKD),
      totalMVPs,
      tournamentsPlayed,
      ongoingTournaments,
      members: team.members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        username: m.user.username,
        avatarUrl: m.user.avatarUrl,
        performancePoints: m.user.performancePoints
      }))
    };
  });
  
  // Sort by total points
  teamsWithStats.sort((a, b) => b.totalPoints - a.totalPoints);
  
  // Add rank
  const leaderboard = teamsWithStats.map((team, index) => ({
    rank: Number(offset) + index + 1,
    ...team
  }));
  
  const totalTeams = await prisma.team.count();
  
  res.json({
    leaderboard,
    period,
    updatedAt: new Date().toISOString(),
    pagination: {
      total: totalTeams,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < totalTeams
    }
  });
});

// Tournament Winners Leaderboard
router.get('/leaderboard/tournament-winners', async (req, res) => {
  const { limit = 20 } = req.query;
  
  // Get completed tournaments with winners
  const tournaments = await prisma.tournament.findMany({
    where: {
      status: 'COMPLETED'
    },
    include: {
      registrations: {
        where: {
          status: 'APPROVED'
        },
        include: {
          team: {
            include: {
              tower: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true
                }
              },
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
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: 3 // Top 3 teams (winners)
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: Number(limit)
  });
  
  const winners = tournaments.map(tournament => ({
    tournamentId: tournament.id,
    tournamentTitle: tournament.title,
    game: tournament.game,
    matchDateTime: tournament.matchDateTime,
    winners: tournament.registrations.map((reg, index) => ({
      position: index + 1,
      team: {
        id: reg.team.id,
        name: reg.team.name,
        logoUrl: reg.team.logoUrl,
        tower: reg.team.tower,
        captain: reg.team.captain,
        members: reg.team.members.map(m => ({
          id: m.user.id,
          name: m.user.name,
          username: m.user.username,
          avatarUrl: m.user.avatarUrl
        }))
      }
    }))
  }));
  
  res.json(winners);
});

// Player Detail with Full Stats
router.get('/leaderboard/players/:userId/details', async (req, res) => {
  const userId = Number(req.params.userId);
  
  const player = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      // Tower info
      ledTowers: {
        include: {
          _count: {
            select: { members: true, teams: true }
          }
        }
      },
      towerMemberships: {
        where: { approved: true },
        include: {
          tower: {
            include: {
              _count: {
                select: { members: true, teams: true }
              }
            }
          }
        }
      },
      
      // Team info
      captainedTeams: {
        include: {
          tower: true,
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
          }
        }
      },
      teamMemberships: {
        include: {
          team: {
            include: {
              tower: true,
              captain: true,
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
              }
            }
          }
        }
      },
      
      // Tournament history
      registrationsCreated: {
        include: {
          tournament: {
            select: {
              id: true,
              title: true,
              game: true,
              status: true,
              matchDateTime: true
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
      },
      
      // Badges & Achievements
      badges: {
        include: {
          badge: true
        }
      },
      achievements: {
        include: {
          achievement: true
        }
      }
    }
  });
  
  if (!player) return res.status(404).json({ error: 'Player not found' });
  
  // Calculate rank
  const higherRankedCount = await prisma.user.count({
    where: {
      performancePoints: {
        gt: player.performancePoints
      }
    }
  });
  const rank = higherRankedCount + 1;
  
  // Calculate stats
  const kdRatio = player.deaths > 0 
    ? (player.kills / player.deaths).toFixed(2) 
    : player.kills;
  
  const winRate = player.matchesPlayed > 0 
    ? ((player.matchesWon / player.matchesPlayed) * 100).toFixed(1) 
    : 0;
  
  // Get current tower
  const currentTower = player.ledTowers.length > 0 
    ? player.ledTowers[0] 
    : (player.towerMemberships.length > 0 ? player.towerMemberships[0].tower : null);
  
  // Get all teams
  const allTeams = [
    ...player.captainedTeams,
    ...player.teamMemberships.map(tm => tm.team)
  ];
  
  // Tournament stats
  const tournamentsPlayed = player.registrationsCreated.length;
  const ongoingTournaments = player.registrationsCreated.filter(r => 
    r.tournament.status === 'LIVE' || r.tournament.status === 'UPCOMING'
  );
  const completedTournaments = player.registrationsCreated.filter(r => 
    r.tournament.status === 'COMPLETED'
  );
  
  res.json({
    rank,
    player: {
      id: player.id,
      name: player.name,
      username: player.username,
      avatarUrl: player.avatarUrl,
      gameId: player.gameId,
      bio: player.bio,
      role: player.role,
      level: player.level,
      xp: player.xp,
      
      // Stats
      performancePoints: player.performancePoints,
      matchesPlayed: player.matchesPlayed,
      matchesWon: player.matchesWon,
      kills: player.kills,
      deaths: player.deaths,
      wins: player.wins,
      mvpCount: player.mvpCount,
      kdRatio: parseFloat(kdRatio),
      winRate: parseFloat(winRate),
      
      // Social
      instagramUrl: player.instagramUrl,
      youtubeUrl: player.youtubeUrl,
      discordUrl: player.discordUrl,
      customTagline: player.customTagline
    },
    
    currentTower,
    teams: allTeams,
    
    tournaments: {
      total: tournamentsPlayed,
      ongoing: ongoingTournaments,
      completed: completedTournaments
    },
    
    badges: player.badges.map(b => ({
      type: b.badge.type,
      name: b.badge.name,
      description: b.badge.description,
      iconUrl: b.badge.iconUrl,
      earnedAt: b.earnedAt
    })),
    
    achievements: player.achievements.map(a => ({
      type: a.achievement.type,
      name: a.achievement.name,
      description: a.achievement.description,
      iconUrl: a.achievement.iconUrl,
      progress: a.progress,
      completed: a.completed,
      completedAt: a.completedAt,
      xpReward: a.achievement.xpReward
    }))
  });
});

// Compare Players
router.get('/leaderboard/compare', async (req, res) => {
  const { userIds } = req.query;
  
  if (!userIds) {
    return res.status(400).json({ error: 'userIds query parameter required (comma-separated)' });
  }
  
  const ids = userIds.split(',').map(id => Number(id));
  
  if (ids.length < 2 || ids.length > 5) {
    return res.status(400).json({ error: 'Please provide 2-5 user IDs to compare' });
  }
  
  const players = await prisma.user.findMany({
    where: {
      id: { in: ids }
    },
    include: {
      ledTowers: {
        select: {
          id: true,
          name: true,
          logoUrl: true
        }
      },
      towerMemberships: {
        where: { approved: true },
        select: {
          tower: {
            select: {
              id: true,
              name: true,
              logoUrl: true
            }
          }
        }
      },
      captainedTeams: {
        select: {
          id: true,
          name: true,
          logoUrl: true
        }
      },
      teamMemberships: {
        select: {
          team: {
            select: {
              id: true,
              name: true,
              logoUrl: true
            }
          }
        }
      },
      badges: {
        include: {
          badge: true
        },
        take: 5
      },
      registrationsCreated: {
        where: {
          status: 'APPROVED'
        }
      }
    }
  });
  
  // Calculate ranks for each player
  const playersWithRanks = await Promise.all(players.map(async (player) => {
    const higherRankedCount = await prisma.user.count({
      where: {
        performancePoints: {
          gt: player.performancePoints
        }
      }
    });
    const rank = higherRankedCount + 1;
    
    const kdRatio = player.deaths > 0 
      ? (player.kills / player.deaths).toFixed(2) 
      : player.kills;
    
    const winRate = player.matchesPlayed > 0 
      ? ((player.matchesWon / player.matchesPlayed) * 100).toFixed(1) 
      : 0;
    
    const currentTower = player.ledTowers.length > 0 
      ? player.ledTowers[0] 
      : (player.towerMemberships.length > 0 ? player.towerMemberships[0].tower : null);
    
    const currentTeam = player.captainedTeams.length > 0 
      ? player.captainedTeams[0] 
      : (player.teamMemberships.length > 0 ? player.teamMemberships[0].team : null);
    
    return {
      rank,
      id: player.id,
      name: player.name,
      username: player.username,
      avatarUrl: player.avatarUrl,
      gameId: player.gameId,
      level: player.level,
      xp: player.xp,
      performancePoints: player.performancePoints,
      matchesPlayed: player.matchesPlayed,
      matchesWon: player.matchesWon,
      kills: player.kills,
      deaths: player.deaths,
      wins: player.wins,
      mvpCount: player.mvpCount,
      kdRatio: parseFloat(kdRatio),
      winRate: parseFloat(winRate),
      currentTower,
      currentTeam,
      tournamentsPlayed: player.registrationsCreated.length,
      badges: player.badges.slice(0, 3).map(b => ({
        type: b.badge.type,
        name: b.badge.name,
        iconUrl: b.badge.iconUrl
      }))
    };
  }));
  
  // Calculate comparison stats
  const comparison = {
    highest: {
      performancePoints: Math.max(...playersWithRanks.map(p => p.performancePoints)),
      kdRatio: Math.max(...playersWithRanks.map(p => p.kdRatio)),
      winRate: Math.max(...playersWithRanks.map(p => p.winRate)),
      mvpCount: Math.max(...playersWithRanks.map(p => p.mvpCount)),
      kills: Math.max(...playersWithRanks.map(p => p.kills))
    },
    lowest: {
      rank: Math.max(...playersWithRanks.map(p => p.rank))
    }
  };
  
  res.json({
    players: playersWithRanks,
    comparison,
    comparedAt: new Date().toISOString()
  });
});

// Get Player Rank History (placeholder for future implementation)
router.get('/leaderboard/players/:userId/rank-history', async (req, res) => {
  const userId = Number(req.params.userId);
  const { period = 'month' } = req.query;
  
  // For now, return current rank
  // In future, implement rank tracking system
  const player = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      performancePoints: true
    }
  });
  
  if (!player) return res.status(404).json({ error: 'Player not found' });
  
  const higherRankedCount = await prisma.user.count({
    where: {
      performancePoints: {
        gt: player.performancePoints
      }
    }
  });
  const currentRank = higherRankedCount + 1;
  
  res.json({
    userId: player.id,
    username: player.username,
    currentRank,
    performancePoints: player.performancePoints,
    period,
    history: [
      // Placeholder - implement rank tracking in future
      {
        date: new Date().toISOString(),
        rank: currentRank,
        points: player.performancePoints
      }
    ],
    message: 'Rank history tracking coming soon!'
  });
});

module.exports = router;
