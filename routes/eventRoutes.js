import express from 'express';
import { createEvent, getEventById, updateEventInDb, deleteEventFromDb } from '../data/event.js';
import { deleteEventFromSchedule, addEventToScheduleByUserId } from '../data/schedule.js';
import { createNotification } from '../data/notification.js';
import { users } from '../config/mongoCollections.js';

//import { createNotification } from '../data/notification.js';

const router = express.Router();

// Route to render the event creation page
router.get('/create-event', async (req, res) => {
  try {
    // Render the create event page
    res.status(200).render('create-event', { title: 'Create Event' });
  } catch (e) {
    console.error("Error retrieving create-event page:", e);
    res.status(500).send('Error retrieving event creation page.');
  }
});

// Route to create a new event
router.post('/create-event', async (req, res) => {
  try {
    let { title,description, startTime, endTime, location, reminder, recurrenceFrequency, numberOfOccurrences} = req.body;
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    numberOfOccurrences = parseInt(numberOfOccurrences, 10);
    const userId = req.session.user.userId
    
    const isRecurring = req.body.isRecurring === 'on';
    console.log(req.body.sharedWith)
    let sharedWith = req.body.sharedWith
    sharedWith = sharedWith.map(element => element.trim())
    sharedWith = sharedWith.filter(element => element !== '')
    const event = await createEvent(title, userId, 
    description,
    startTime,
    endTime,
    location,
    reminder,
    isRecurring,
    recurrenceFrequency,
    sharedWith,
    numberOfOccurrences);

    // Add event to user's schedule
    
    console.log(event)

    let eventId = event._id.toString()

    await addEventToScheduleByUserId(userId, eventId);

    if (sharedWith.length > 0) {

      for (let i = 0; i<sharedWith.length; i++)
      {
        await addEventToScheduleByUserId(sharedWith[i], eventId)
        let userShared = await users()
        await userShared.updateOne({email : sharedWith[i]},{$push : {eventShared : eventId}})
      }

    } 

    // Create a notification for the user
    //await createNotification(userId, 'Event Created', `Event "${title}" has been created.`);

    res.status(201).redirect('/schedule');
  } catch (e) {
    console.error("Error adding event:", e);
    res.status(400).render('create-event', {title : 'Create Event', error : e//.message

    });
  }
});

router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let event = await getEventById(id);

        if (!event) {
            throw new Error('Event not found');
        }

        // Convert startTime and endTime to ISO strings for the form inputs
        let {
            title,
            description,
            startTime,
            endTime,
            location,
            reminder,
            isRecurring,
            recurrenceFrequency,
            sharedWith
        } = event;

        // Adjust times to local format
        const localStartTime = new Date(startTime).toISOString().slice(0, -1);
        const localEndTime = new Date(endTime).toISOString().slice(0, -1);

        res.status(200).render('edit-event', {
            id,
            title,
            description,
            startTime: localStartTime,
            endTime: localEndTime,
            location,
            reminder,
            isRecurring,
            recurrenceFrequency,
            sharedWith: sharedWith.join(', ') // Convert array to string for display
        });
    } catch (e) {
        res.status(400).render('error', { message: e.message });
    }
});


router.post('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            startTime,
            endTime,
            location,
            reminder,
            isRecurring,
            recurrenceFrequency,
            sharedWith
        } = req.body;

        // Convert form input values to Date objects
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        // Validate date objects
        if (isNaN(startDate.getTime())) {
            throw new Error('Start time is not a valid Date object');
        }
        if (isNaN(endDate.getTime())) {
            throw new Error('End time is not a valid Date object');
        }

        // Now pass the valid Date objects to the update function
        const updatedEvent = await updateEventInDb(
            id,
            title,
            description,
            startDate,  // Pass Date object
            endDate,    // Pass Date object
            location,
            parseInt(reminder, 10),
            isRecurring === 'on',
            recurrenceFrequency,
            sharedWith
        );

        // If the update is successful, redirect back to the schedule page
        if (updatedEvent) {
            return res.redirect('/schedule');
        } else {
            throw new Error('Event update failed');
        }
    } catch (e) {
        console.error('Error updating event:', e);
        res.status(400).render('edit-event', { error: e.message });
    }
});


// Route to delete an existing event
router.post('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        // Validate the userId before proceeding
        if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
            throw new Error('User ID must be a non-empty string.');
        }

        // Fetch the existing event
        const event = await getEventById(id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Delete the event from the database
        await deleteEventFromDb(id);

        // Remove the event from the user's schedule
        await deleteEventFromSchedule(userId, id);

        // Create a notification for the user
        await createNotification(userId, 'Event Deleted', `Event "${event.title}" has been deleted.`);

        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (e) {
        console.error("Error deleting event:", e);
        res.status(400).json({ success: false, message: e.message });
    }
});

export default router;
