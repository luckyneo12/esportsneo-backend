const express = require('express');
const { prisma } = require('../lib/prisma');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Apply for Organizer role
router.post('/organizer/apply', auth, async (req, res) => {
  const { reason } = req.body;
  
  // Check if user already has an application
  const existing = await prisma.organizerApplication.findUnique({
    where: { userId: req.userId }
  });
  
  if (existing) {
    if (existing.status === 'PENDING') {
      return res.status(409).json({ error: 'Application already pending' });
    }
    if (existing.status === 'APPROVED') {
      return res.status(409).json({ error: 'Already an organizer' });
    }
  }
  
  try {
    const application = await prisma.organizerApplication.upsert({
      where: { userId: req.userId },
      update: {
        reason,
        status: 'PENDING',
        reviewedBy: null
      },
      create: {
        userId: req.userId,
        reason,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            mobile: true
          }
        }
      }
    });
    
    res.json(application);
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit application', details: e.message });
  }
});

// Get my organizer application status
router.get('/organizer/my-application', auth, async (req, res) => {
  const application = await prisma.organizerApplication.findUnique({
    where: { userId: req.userId }
  });
  
  if (!application) {
    return res.status(404).json({ error: 'No application found' });
  }
  
  res.json(application);
});

// Super Admin: Get all organizer applications
router.get('/admin/organizer-applications', auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  
  if (user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only Super Admin can view applications' });
  }
  
  const { status } = req.query;
  const where = status ? { status } : {};
  
  const applications = await prisma.organizerApplication.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          mobile: true,
          role: true,
          createdAt: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(applications);
});

// Super Admin: Approve organizer application
router.post('/admin/organizer-applications/:applicationId/approve', auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  
  if (user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only Super Admin can approve applications' });
  }
  
  const applicationId = Number(req.params.applicationId);
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const application = await tx.organizerApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          reviewedBy: req.userId
        },
        include: { user: true }
      });
      
      // Update user role to ORGANISER
      await tx.user.update({
        where: { id: application.userId },
        data: { role: 'ORGANISER' }
      });
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: application.userId,
          type: 'ORGANIZER_APPROVED',
          title: 'Organizer Application Approved',
          message: 'Congratulations! Your organizer application has been approved. You can now create tournaments.',
          sentBy: req.userId
        }
      });
      
      return application;
    });
    
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to approve application', details: e.message });
  }
});

// Super Admin: Reject organizer application
router.post('/admin/organizer-applications/:applicationId/reject', auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  
  if (user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only Super Admin can reject applications' });
  }
  
  const applicationId = Number(req.params.applicationId);
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const application = await tx.organizerApplication.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED',
          reviewedBy: req.userId
        },
        include: { user: true }
      });
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: application.userId,
          type: 'ORGANIZER_REJECTED',
          title: 'Organizer Application Rejected',
          message: 'Your organizer application has been reviewed and rejected. You can apply again later.',
          sentBy: req.userId
        }
      });
      
      return application;
    });
    
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to reject application', details: e.message });
  }
});

// Super Admin: Get all organizers
router.get('/admin/organizers', auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  
  if (user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only Super Admin can view organizers' });
  }
  
  const organizers = await prisma.user.findMany({
    where: { role: 'ORGANISER' },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      mobile: true,
      createdAt: true,
      _count: {
        select: { organizedTournaments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(organizers);
});

// Super Admin: Block/Unblock organizer (change role back to PLAYER)
router.post('/admin/organizers/:userId/block', auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  
  if (user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only Super Admin can block organizers' });
  }
  
  const userId = Number(req.params.userId);
  
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: 'PLAYER' }
    });
    
    res.json({ message: 'Organizer blocked successfully', user: updated });
  } catch (e) {
    res.status(500).json({ error: 'Failed to block organizer', details: e.message });
  }
});

module.exports = router;
