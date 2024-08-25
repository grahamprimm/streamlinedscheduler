import { schedules, users, events } from '../config/mongoCollections.js';
import { isValidUserId, isValidEventId } from '../helpers.js';
import { ObjectId } from 'mongodb';
import { getUserById } from './users.js';

export const addEventToScheduleByUserId = async (userId, eventId) => {
  userId = isValidUserId(userId)
  eventId = isValidEventId(eventId)
  
  const schedulesCollection = await schedules();

  let user = await getUserById(userId)
  const schedule = await schedulesCollection.findOne({_id: new ObjectId(user.schedule)});

  if(!schedule){
    throw new Error(`No schedule found for user`)
  }

  // add the eventId to the schedule's events array
  const updateResult = await schedulesCollection.updateOne(
    { _id: new ObjectId(user.schedule) },
    { $push: { events: eventId } }
  );

  if (updateResult.modifiedCount === 0) {
      throw new Error('Could not add event to the schedule');
  }

  userId = ObjectId.createFromHexString(userId)
  user = await users()

  await user.updateOne({_id : userId},{$push : {eventsCreated : eventId}})

  userId = userId.toString()

  return `Event ${eventId} has been added to the schedule for user ${userId}`;
};

export const createSchedule = async () => {
  const schedulesCollection = await schedules();

  const newSchedule = {
    _id: new ObjectId(),
    title: 'My Schedule',
    events: []
  };

  const insertResult = await schedulesCollection.insertOne(newSchedule);

  if (insertResult.insertedCount === 0 || !insertResult.acknowledged || !insertResult.insertedId) {
    throw new Error('Could not add schedule');
  }

  const newId = insertResult.insertedId.toString();

  return newId;
}

export const getScheduleById = async (id) => {
    const schedulesCollection = await schedules();
    const eventsCollection = await events();

    if (!ObjectId.isValid(id)) throw 'Not a valid ID';

    const scheduleId = new ObjectId(id);
    const schedule = await schedulesCollection.findOne({ _id: scheduleId });

    if (!schedule) {
        throw new Error('Schedule not found');
    }

    // Fetch events associated with the schedule asynchronously
    const eventPromises = schedule.events.map(eventId => 
        eventsCollection.findOne({ _id: new ObjectId(eventId) })
    );
    const populatedEvents = await Promise.all(eventPromises);

    // Ensure startTime and endTime are Date objects and map the events to FullCalendar format
    schedule.events = populatedEvents.map(event => {
        return {
            title: event.title,
            startTime: new Date(event.startTime).toISOString(),  // Convert to ISO string
            endTime: new Date(event.endTime).toISOString(),      // Convert to ISO string
            location: event.location,
            description: event.description,
            reminder: event.reminder,
            createdBy: event.createdBy,
            eventId: event._id.toString()
        };
    });

    return schedule;
};

export const deleteEventFromSchedule = async (userId, eventId) => {
    // Validate userId and eventId
    userId = isValidUserId(userId);
    eventId = isValidEventId(eventId);

    const schedulesCollection = await schedules();

    const user = await getUserById(userId);

    // Validate if the user's schedule ID is a valid ObjectId
    if (!ObjectId.isValid(user.schedule)) {
        throw new Error('Invalid schedule ID format');
    }

    const scheduleId = new ObjectId(user.schedule);

    const schedule = await schedulesCollection.findOne({ _id: scheduleId });

    if (!schedule) {
        throw new Error('No schedule found for the user');
    }

    // Validate if the eventId is a valid ObjectId
    if (!ObjectId.isValid(eventId)) {
        throw new Error('Invalid event ID format');
    }

    const updateResult = await schedulesCollection.updateOne(
        { _id: scheduleId },
        { $pull: { events: new ObjectId(eventId) } }  // Convert eventId to ObjectId before pulling
    );

    // console.log(updateResult);
    // if (updateResult.modifiedCount === 0) {
    //     throw new Error(`Could not remove event ${eventId} from the schedule`);
    // }

    return `Event ${eventId} has been removed from the schedule for user ${userId}`;
};

export const updateScheduleEvents = async (userId, updatedEvent) => {
  const validUserId = isValidUserId(userId);
  const validEventId = isValidEventId(updatedEvent._id.toString());

  const schedulesCollection = await schedules();

  const schedule = await schedulesCollection.findOne({ userId: ObjectId(validUserId) });

  if (!schedule) {
    throw new Error('No schedule found for the user');
  }

  // update the event within the user's schedule's events array
  const updateResult = await schedulesCollection.updateOne(
    { userId: ObjectId(validUserId), "events._id": ObjectId(validEventId) },
    { 
      $set: {
        "events.$.title": updatedEvent.title,
        "events.$.description": updatedEvent.description,
        "events.$.startTime": updatedEvent.startTime,
        "events.$.endTime": updatedEvent.endTime,
        "events.$.location": updatedEvent.location,
        "events.$.reminder": updatedEvent.reminder,
        "events.$.isRecurring": updatedEvent.isRecurring,
        "events.$.recurrenceFrequency": updatedEvent.recurrenceFrequency,
        "events.$.sharedWith": updatedEvent.sharedWith
      }
    }
  );

  if (updateResult.modifiedCount === 0) {
    throw new Error(`Could not update event ${validEventId} in the schedule`);
  }

  return `Event ${validEventId} has been updated in the schedule for user ${validUserId}`;
};
