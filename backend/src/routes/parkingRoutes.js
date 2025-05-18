const express = require('express');
const router = express.Router();
const Slot = require('../models/slotsModel');
const Booking = require('../models/bookingModel');
const slotsController = require('../controllers/slotController');
const bookingController = require('../controllers/bookingController');
const { authenticate, isAdmin } = require('../middleware/auth');


// Admin: Create a parking slot
// router.post('/slots', authenticate, isAdmin, async (req, res) => {
//   const { slot_number, floor, vehicle_type } = req.body;

//   if (!slot_number || !floor || !vehicle_type) {
//     return res.status(400).json({ error: 'Slot number, floor, and vehicle type are required' });
//   }

//   if (!['car', 'bike', 'truck'].includes(vehicle_type)) {
//     return res.status(400).json({ error: 'Invalid vehicle type. Must be car, bike, or truck' });
//   }

//   try {
//     const slot = await Slot.create({ slot_number, floor, vehicle_type });
//     res.status(201).json({ message: 'Slot created successfully', slot });
//   } catch (error) {
//     console.error('Create slot error:', error.message);
//     res.status(500).json({ error: error.message || 'Failed to create slot' });
//   }
// });


router.get('/available', authenticate, slotsController.getAvailableSlots);

router.post('/bookings', authenticate, bookingController.createBooking);

// Admin: Get all bookings
router.get('/bookings', authenticate, isAdmin, bookingController.getAllBookings);

// Admin: Update booking status
router.patch('/bookings/:id', authenticate, isAdmin, bookingController.updateBookingStatus);

router.post('/', authenticate, isAdmin, slotsController.bulkCreateSlots);

router.get('/', authenticate, isAdmin, slotsController.getAllSlots);

router.get('/available', authenticate, isAdmin, slotsController.getAvailableSlots);

router.put('/:id', authenticate, isAdmin, slotsController.updateSlot);

router.delete('/:id', authenticate, isAdmin, slotsController.deleteSlot);


module.exports = router;