const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const { router: towersRoutes } = require('./towers.routes');
const teamsRoutes = require('./teams.routes');
const { router: tournamentsRoutes } = require('./tournaments.routes');
const registrationsRoutes = require('./registrations.routes');
const matchesRoutes = require('./matches.routes');

const router = express.Router();

router.use(authRoutes);
router.use(usersRoutes);
router.use(towersRoutes);
router.use(teamsRoutes);
router.use(tournamentsRoutes);
router.use(registrationsRoutes);
router.use(matchesRoutes);

module.exports = router;


