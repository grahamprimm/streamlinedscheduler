import express from 'express';
import { createEvent, getEventById, updateEventInDb, deleteEventFromDb } from '../data/event.js';
import { updateScheduleEvents, removeEventFromSchedule, addEventToScheduleByUserId } from '../data/schedules.js';
import { createNotification } from '../data/notification.js';

const router = express.Router();

// Route to add a new event
router.post('/add', async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, reminder, isRecurring, recurrenceFrequency, userId } = req.body;

    const { event } = await createEvent(title,
    description,
    startTime,
    endTime,
    location,
    reminder,
    isRecurring,
    recurrenceFrequency);

    // Add event to user's schedule
    await addEventToScheduleByUserId(userId, event._id);

    // Create a notification for the user
    await createNotification(userId, 'Event Created', `Event "${title}" has been created.`);

    res.status(201).json({ success: true, event });
  } catch (e) {
    console.error("Error adding event:", e);
    res.status(400).json({ success: false, message: e.message });
  }
});

// Route to edit an existing event
router.post('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title,
    description,
    startTime,
    endTime,
    location,
    reminder,
    isRecurring,
    recurrenceFrequency, userId } = req.body;

    // Fetch the existing event
    const event = await getEventById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Update the event
    const updatedEvent = await updateEventInDb(id, title, description, startTime, endTime, location, reminder, isRecurring, recurrencePattern);

    // Update the user's schedule
    await updateScheduleEvents(userId, updatedEvent);

    // Create a notification for the user
    await createNotification(userId, 'Event Updated', `Event "${title}" has been updated.`);

    res.json({ success: true, event: updatedEvent });
  } catch (e) {
    console.error("Error editing event:", e);
    res.status(400).json({ success: false, message: e.message });
  }
});

// Route to delete an existing event
router.post('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Fetch the existing event
    const event = await getEventById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Delete the event from the database
    await deleteEventFromDb(id);

    // Remove the event from the user's schedule
    await removeEventFromSchedule(userId, id);

    // Create a notification for the user
    await createNotification(userId, 'Event Deleted', `Event "${event.title}" has been deleted.`);

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (e) {
    console.error("Error deleting event:", e);
    res.status(400).json({ success: false, message: e.message });
  }
});

export default router;
