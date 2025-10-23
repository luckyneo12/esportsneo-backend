const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const { router: towersRoutes } = require('./towers.routes');
const towerDetailsRoutes = require('./tower-details.routes');
const teamsRoutes = require('./teams.routes');
const { router: tournamentsRoutes } = require('./tournaments.routes');
const registrationsRoutes = require('./registrations.routes');
const matchesRoutes = require('./matches.routes');
const uploadRoutes = require('./upload.routes');
const organizerRoutes = require('./organizer.routes');
const { router: notificationRoutes } = require('./notification.routes');
const { router: profileRoutes } = require('./profile.routes');
const leaderboardRoutes = require('./leaderboard.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Handle preflight requests for all routes
router.options('*', (req, res) => {
  res.status(200).end();
});

router.use(authRoutes);
router.use(usersRoutes);
router.use(profileRoutes);
router.use(towersRoutes);
router.use(towerDetailsRoutes);
router.use(teamsRoutes);
router.use(tournamentsRoutes);
router.use(registrationsRoutes);
router.use(matchesRoutes);
router.use(uploadRoutes);
router.use(organizerRoutes);
router.use(notificationRoutes);
router.use(leaderboardRoutes);

module.exports = router;


