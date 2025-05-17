const express = require('express');
const router = express.Router();
const Slot = require('../models/slotsModel');
const Booking = require('../models/bookingModel');
const { authenticate, isAdmin } = require('../middleware/auth');

// Admin: Create a parking slot
router.post('/slots', authenticate, isAdmin, async (req, res) => {
  const { slot_number, floor, vehicle_type } = req.body;

  if (!slot_number || !floor || !vehicle_type) {
    return res.status(400).json({ error: 'Slot number, floor, and vehicle type are required' });
  }

  if (!['car', 'bike', 'truck'].includes(vehicle_type)) {
    return res.status(400).json({ error: 'Invalid vehicle type. Must be car, bike, or truck' });
  }

  try {
    const slot = await Slot.create({ slot_number, floor, vehicle_type });
    res.status(201).json({ message: 'Slot created successfully', slot });
  } catch (error) {
    console.error('Create slot error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to create slot' });
  }
});

// User: Get available slots
router.get('/slots/available', authenticate, async (req, res) => {
  const { vehicle_type, floor } = req.query;

  if (vehicle_type && !['car', 'bike', 'truck'].includes(vehicle_type)) {
    return res.status(400).json({ error: 'Invalid vehicle type. Must be car, bike, or truck' });
  }

  try {
    const slots = await Slot.getAvailableSlots({ vehicle_type, floor });
    res.status(200).json({ slots });
  } catch (error) {
    console.error('Get available slots error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch available slots' });
  }
});

// User: Book a slot
router.post('/bookings', authenticate, async (req, res) => {
  const { slot_id, vehicle_registration, vehicle_type, start_time, end_time } = req.body;

  if (!slot_id || !vehicle_registration || !vehicle_type || !start_time || !end_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['car', 'bike', 'truck'].includes(vehicle_type)) {
    return res.status(400).json({ error: 'Invalid vehicle type. Must be car, bike, or truck' });
  }

  const start = new Date(start_time);
  const end = new Date(end_time);
  if (isNaN(start) || isNaN(end) || end <= start) {
    return res.status(400).json({ error: 'Invalid start or end time' });
  }

  try {
    const booking = await Booking.create({
      user_id: req.user.id,
      slot_id,
      vehicle_registration,
      vehicle_type,
      start_time: start,
      end_time: end,
    });
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Create booking error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to create booking' });
  }
});

module.exports = router;