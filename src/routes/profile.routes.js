const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');
const bcrypt = require('bcrypt');

const router = express.Router();

// Get Complete Profile (Overview)
router.get('/profile/overview', auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      mobile: true,
      bio: true,
      avatarUrl: true,
      gameId: true,
      instagramUrl: true,
      youtubeUrl: true,
      discordUrl: true,
      customTagline: true,
      role: true,
      level: true,
      xp: true,
      createdAt: true,
      
      // Current Tower Info
      ledTowers: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          code: true,
          maxTeams: true,
          _count: { select: { teams: true, members: true } }
        }
      },
      towerMemberships: {
        where: { approved: true },
        select: {
          role: true,
          tower: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              leaderId: true
            }
          }
        }
      },
      
      // Current Team Info
      teamMemberships: {
        select: {
          team: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              captainId: true,
              tower: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      },
      captainedTeams: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          tower: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  // Determine tower role
  let towerRole = null;
  let currentTower = null;
  
  if (user.ledTowers.length > 0) {
    currentTower = user.ledTowers[0];
    towerRole = 'OWNER';
  } else if (user.towerMemberships.length > 0) {
    const membership = user.towerMemberships[0];
    currentTower = membership.tower;
    towerRole = membership.role;
  }
  
  // Determine team role
  let currentTeam = null;
  let teamRole = null;
  
  if (user.captainedTeams.length > 0) {
    currentTeam = user.captainedTeams[0];
    teamRole = 'CAPTAIN';
  } else if (user.teamMemberships.length > 0) {
    currentTeam = user.teamMemberships[0].team;
    teamRole = currentTeam.captainId === user.id ? 'CAPTAIN' : 'PLAYER';
  }
  
  res.json({
    ...user,
    currentTower,
    towerRole,
    currentTeam,
    teamRole
  });
});

// Get Performance Stats
router.get('/profile/stats', auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      
      // Stats
      matchesPlayed: true,
      matchesWon: true,
      kills: true,
      deaths: true,
      wins: true,
      mvpCount: true,
      performancePoints: true,
      level: true,
      xp: true,
      
      // Badges
      badges: {
        include: {
          badge: true
        },
        orderBy: {
          earnedAt: 'desc'
        }
      }
    }
  });
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  // Calculate K/D Ratio
  const kdRatio = user.deaths > 0 ? (user.kills / user.deaths).toFixed(2) : user.kills;
  
  // Calculate Win Rate
  const winRate = user.matchesPlayed > 0 
    ? ((user.matchesWon / user.matchesPlayed) * 100).toFixed(1) 
    : 0;
  
  res.json({
    ...user,
    kdRatio: parseFloat(kdRatio),
    winRate: parseFloat(winRate)
  });
});

// Get Tournament History
router.get('/profile/tournaments', auth, async (req, res) => {
  // Get all tournaments where user's teams participated
  const registrations = await prisma.tournamentRegistration.findMany({
    where: {
      team: {
        members: {
          some: {
            userId: req.userId
          }
        }
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
  
  // Separate into ongoing and completed
  const ongoing = registrations.filter(r => 
    r.tournament.status === 'UPCOMING' || r.tournament.status === 'LIVE'
  );
  
  const completed = registrations.filter(r => 
    r.tournament.status === 'COMPLETED'
  );
  
  // Get tournament wins (you can add winner tracking logic)
  const wins = completed.filter(r => r.status === 'APPROVED').length; // Placeholder
  
  res.json({
    ongoing,
    completed,
    totalParticipated: registrations.length,
    totalWins: wins,
    achievements: {
      firstTournament: registrations.length > 0,
      veteran: registrations.length >= 10,
      champion: wins >= 5
    }
  });
});

// Get Achievements & Badges
router.get('/profile/achievements', auth, async (req, res) => {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: req.userId },
    include: {
      badge: true
    },
    orderBy: {
      earnedAt: 'desc'
    }
  });
  
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: req.userId },
    include: {
      achievement: true
    },
    orderBy: {
      completedAt: 'desc'
    }
  });
  
  res.json({
    badges: userBadges,
    achievements: userAchievements,
    totalBadges: userBadges.length,
    totalAchievements: userAchievements.filter(a => a.completed).length
  });
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  const { 
    name, 
    bio, 
    avatarUrl, 
    gameId,
    instagramUrl,
    youtubeUrl,
    discordUrl,
    customTagline
  } = req.body;
  
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      name,
      bio,
      avatarUrl,
      gameId,
      instagramUrl,
      youtubeUrl,
      discordUrl,
      customTagline
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      mobile: true,
      bio: true,
      avatarUrl: true,
      gameId: true,
      instagramUrl: true,
      youtubeUrl: true,
      discordUrl: true,
      customTagline: true,
      role: true,
      level: true,
      xp: true,
      updatedAt: true
    }
  });
  
  res.json(user);
});

// Update Notification Preferences
router.put('/profile/notifications', auth, async (req, res) => {
  const { notifyTournaments, notifyTeams, notifyTowers } = req.body;
  
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      notifyTournaments: notifyTournaments !== undefined ? notifyTournaments : undefined,
      notifyTeams: notifyTeams !== undefined ? notifyTeams : undefined,
      notifyTowers: notifyTowers !== undefined ? notifyTowers : undefined
    },
    select: {
      id: true,
      notifyTournaments: true,
      notifyTeams: true,
      notifyTowers: true
    }
  });
  
  res.json(user);
});

// Change Password
router.put('/profile/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  
  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.userId }
  });
  
  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update password
  await prisma.user.update({
    where: { id: req.userId },
    data: { password: hashedPassword }
  });
  
  res.json({ message: 'Password changed successfully' });
});

// Get Public Profile (by username)
router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;
  
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      gameId: true,
      instagramUrl: true,
      youtubeUrl: true,
      discordUrl: true,
      customTagline: true,
      role: true,
      level: true,
      xp: true,
      
      // Stats
      matchesPlayed: true,
      matchesWon: true,
      kills: true,
      deaths: true,
      wins: true,
      mvpCount: true,
      performancePoints: true,
      
      // Badges
      badges: {
        include: {
          badge: true
        },
        orderBy: {
          earnedAt: 'desc'
        },
        take: 10
      },
      
      // Teams
      teamMemberships: {
        select: {
          team: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              tower: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      },
      
      // Towers
      ledTowers: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          _count: { select: { teams: true, members: true } }
        }
      },
      
      createdAt: true
    }
  });
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  // Calculate K/D Ratio
  const kdRatio = user.deaths > 0 ? (user.kills / user.deaths).toFixed(2) : user.kills;
  
  // Calculate Win Rate
  const winRate = user.matchesPlayed > 0 
    ? ((user.matchesWon / user.matchesPlayed) * 100).toFixed(1) 
    : 0;
  
  res.json({
    ...user,
    kdRatio: parseFloat(kdRatio),
    winRate: parseFloat(winRate)
  });
});

// Helper function to award badge (can be called from other routes)
async function awardBadge(userId, badgeType) {
  try {
    // Check if badge exists
    const badge = await prisma.badge.findUnique({
      where: { type: badgeType }
    });
    
    if (!badge) return null;
    
    // Check if user already has this badge
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id
        }
      }
    });
    
    if (existing) return existing;
    
    // Award badge
    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id
      },
      include: {
        badge: true
      }
    });
    
    return userBadge;
  } catch (e) {
    console.error('Error awarding badge:', e);
    return null;
  }
}

// Helper function to update achievement progress
async function updateAchievement(userId, achievementType, progress = 1) {
  try {
    const achievement = await prisma.achievement.findFirst({
      where: { type: achievementType }
    });
    
    if (!achievement) return null;
    
    const userAchievement = await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id
        }
      },
      update: {
        progress: {
          increment: progress
        }
      },
      create: {
        userId,
        achievementId: achievement.id,
        progress
      },
      include: {
        achievement: true
      }
    });
    
    // Check if achievement is completed (you can add custom logic)
    // For now, simple milestone check
    if (!userAchievement.completed && userAchievement.progress >= 1) {
      await prisma.userAchievement.update({
        where: { id: userAchievement.id },
        data: {
          completed: true,
          completedAt: new Date()
        }
      });
      
      // Award XP
      if (achievement.xpReward > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: {
              increment: achievement.xpReward
            }
          }
        });
      }
    }
    
    return userAchievement;
  } catch (e) {
    console.error('Error updating achievement:', e);
    return null;
  }
}

// Helper function to add XP and level up
async function addXP(userId, xpAmount) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true }
  });
  
  const newXP = user.xp + xpAmount;
  const xpForNextLevel = user.level * 100; // Simple formula: level * 100 XP
  
  let newLevel = user.level;
  let remainingXP = newXP;
  
  // Check for level up
  while (remainingXP >= xpForNextLevel) {
    remainingXP -= xpForNextLevel;
    newLevel++;
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: remainingXP,
      level: newLevel
    }
  });
  
  return { newLevel, newXP: remainingXP, leveledUp: newLevel > user.level };
}

module.exports = {
  router,
  awardBadge,
  updateAchievement,
  addXP
};
