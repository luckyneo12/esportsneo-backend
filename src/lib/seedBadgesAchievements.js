const { prisma } = require('./prisma');

async function seedBadgesAndAchievements() {
  console.log('Seeding badges and achievements...');
  
  // Seed Badges
  const badges = [
    {
      type: 'FIRST_TOURNAMENT',
      name: 'Tournament Debut',
      description: 'Participated in your first tournament',
      iconUrl: '/badges/first-tournament.png'
    },
    {
      type: 'FIRST_WIN',
      name: 'First Victory',
      description: 'Won your first match',
      iconUrl: '/badges/first-win.png'
    },
    {
      type: 'TOWER_OWNER',
      name: 'Tower Master',
      description: 'Created and own a tower',
      iconUrl: '/badges/tower-owner.png'
    },
    {
      type: 'TEAM_CAPTAIN',
      name: 'Team Leader',
      description: 'Captain of a team',
      iconUrl: '/badges/team-captain.png'
    },
    {
      type: 'MVP_MASTER',
      name: 'MVP Master',
      description: 'Earned MVP 10 times',
      iconUrl: '/badges/mvp-master.png'
    },
    {
      type: 'TOURNAMENT_WINNER',
      name: 'Champion',
      description: 'Won a tournament',
      iconUrl: '/badges/tournament-winner.png'
    },
    {
      type: 'ORGANIZER',
      name: 'Event Organizer',
      description: 'Became an approved organizer',
      iconUrl: '/badges/organizer.png'
    },
    {
      type: 'VETERAN',
      name: 'Veteran Player',
      description: 'Played 50+ matches',
      iconUrl: '/badges/veteran.png'
    },
    {
      type: 'SHARPSHOOTER',
      name: 'Sharpshooter',
      description: 'Achieved 100+ kills',
      iconUrl: '/badges/sharpshooter.png'
    },
    {
      type: 'TEAM_PLAYER',
      name: 'Team Player',
      description: 'Member of 3+ teams',
      iconUrl: '/badges/team-player.png'
    }
  ];
  
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { type: badge.type },
      update: badge,
      create: badge
    });
  }
  
  console.log(`✅ Seeded ${badges.length} badges`);
  
  // Seed Achievements
  const achievements = [
    {
      type: 'TOURNAMENT_PARTICIPATION',
      name: 'Tournament Participant',
      description: 'Participate in a tournament',
      iconUrl: '/achievements/tournament-participation.png',
      xpReward: 50
    },
    {
      type: 'TOURNAMENT_WIN',
      name: 'Tournament Victor',
      description: 'Win a tournament',
      iconUrl: '/achievements/tournament-win.png',
      xpReward: 200
    },
    {
      type: 'TEAM_CREATED',
      name: 'Team Founder',
      description: 'Create a team',
      iconUrl: '/achievements/team-created.png',
      xpReward: 30
    },
    {
      type: 'TOWER_CREATED',
      name: 'Tower Founder',
      description: 'Create a tower',
      iconUrl: '/achievements/tower-created.png',
      xpReward: 50
    },
    {
      type: 'MVP_EARNED',
      name: 'MVP Award',
      description: 'Earn MVP in a match',
      iconUrl: '/achievements/mvp-earned.png',
      xpReward: 25
    },
    {
      type: 'KILLS_MILESTONE',
      name: 'Kill Streak',
      description: 'Reach kill milestones',
      iconUrl: '/achievements/kills-milestone.png',
      xpReward: 10
    },
    {
      type: 'WINS_MILESTONE',
      name: 'Winning Streak',
      description: 'Reach win milestones',
      iconUrl: '/achievements/wins-milestone.png',
      xpReward: 15
    }
  ];
  
  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: { type: achievement.type }
    });
    
    if (!existing) {
      await prisma.achievement.create({
        data: achievement
      });
    }
  }
  
  console.log(`✅ Seeded ${achievements.length} achievements`);
  console.log('✅ Seeding complete!');
}

// Run if called directly
if (require.main === module) {
  seedBadgesAndAchievements()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((e) => {
      console.error('Error seeding:', e);
      process.exit(1);
    });
}

module.exports = { seedBadgesAndAchievements };
