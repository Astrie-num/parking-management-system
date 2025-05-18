const Booking = require('../models/bookingModel');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');

const createBooking = async (req, res) => {
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
};

const getAllBookings = async (req, res) => {
  try {
    await Booking.updateCompletedBookings();
    const bookings = await Booking.getAllBookings();
    console.log('Bookings sent to client:', bookings);
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Get all bookings error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch bookings' });
  }
};

const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  let { status } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid or missing booking ID' });
  }

  const isApproval = status === 'approved';
  if (status === 'approved') {
    status = 'active';
  } else if (status === 'rejected') {
    status = 'cancelled';
  }

  if (!['active', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Status must be active or cancelled' });
  }

  try {
    const booking = await Booking.updateStatus(parseInt(id), status);
    console.log('Updated booking:', booking);
    if (!booking.email) {
      console.error('No email found for booking:', booking);
      return res.status(400).json({ error: 'No recipient email available for this booking' });
    }
    if (!booking.slot_number || !booking.slot_location) {
      console.error('Missing slot details for booking:', booking);
      return res.status(400).json({ error: 'Slot number or location missing' });
    }

    const vehicle = { plate_number: booking.vehicle_registration };
    const message = status === 'active' ? 'Booking approved' : 'Booking cancelled';
    if (isApproval) {
      await sendApprovalEmail(booking.email, booking.slot_number, vehicle, booking.slot_location);
    } else {
      await sendRejectionEmail(booking.email, vehicle, booking.slot_location, 'No available slots');
    }
    res.status(200).json({ message, booking });
  } catch (error) {
    console.error('Update booking status error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to update booking status' });
  }
};

module.exports = { createBooking, getAllBookings, updateBookingStatus };