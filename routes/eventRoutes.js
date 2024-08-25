import express from 'express';
import { createEvent, getEventById, updateEventInDb, deleteEventFromDb } from '../data/event.js';
import { updateScheduleEvents, deleteEventFromSchedule, addEventToScheduleByUserId } from '../data/schedule.js';
import { getIdFromEmail } from '../data/users.js';
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

router.get('edit/:id', async (req, res) => {

try{
let id = req.params.id

let event = await getEventById()

let title = event.title
let description = event.description
let startTime = event.startTime
let endTime = event.endTime
let location = event.location
let reminder = event.reminder
let isRecurring = event.isRecurring
let recurrenceFrequency = event.recurrenceFrequency
let sharedWith = event.sharedWith



res.status(200).render('edit-event', {id, title, description, startTime, endTime, location, reminder, isRecurring, recurrenceFrequency, sharedWith})

}catch(e){
  res.status(400).render('edit-event', {title : 'Edit Event', error : e//.message

  })
}

})
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
    recurrenceFrequency, sharedWith, userId } = req.body;

    // Fetch the existing event
    const event = await getEventById(id);

    if (!event) {
      return res.status(404).render('/schedule', {error : "Event not found"});
    }

    sharedWith = sharedWith.map(element => element.trim())
    sharedWith = sharedWith.filter(element => element !== '')

    let origSharedWith = event.sharedWith

    // Update the event
    const updatedEvent = await updateEventInDb(id, title, description, startTime, endTime, location, reminder, isRecurring, recurrenceFrequency, sharedWith);

    sharedWith = sharedWith.concat(origSharedWith)


    sharedWith = [...new Set(sharedWith)]

    if (sharedWith.length > 0) {

      for (let i = 0; i<sharedWith.length; i++)
      {
        await addEventToScheduleByUserId(sharedWith[i], id)
        let userShared = await users()
        await userShared.updateOne({email : sharedWith[i]},{$push : {eventShared : id}})
      }

    } 

    

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
