import { schedules } from '../config/mongoCollections.js';
import { isValidUserId, isValidEventId } from '../helpers.js';
import { ObjectId } from 'mongodb';
import { getUserById } from './users.js';

export const addEventToScheduleByUserId = async (userId, eventId) => {
  userId = isValidUserId(userId)
  eventId = isValidEventId(eventId)
  
  const schedulesCollection = await schedules();

  //find user's schedule
  //userId = ObjectId.createFromHexString(validUserId)
  //eventId = ObjectId.createFromHexString(validEventId)

  const user = await getUserById(userId)

  const scheduleId = ObjectId.createFromHexString(user.schedule)

  const schedule = await schedulesCollection.findOne({_id: scheduleId})

  if(!schedule){
    throw new Error(`No schedule found for user`)
  }

  // add the eventId to the schedule's events array
  const updateResult = await schedulesCollection.updateOne(
    { _id: scheduleId },
    { $push: { events: eventId } }
  );

  if (updateResult.modifiedCount === 0) {
      throw new Error('Could not add event to the schedule');
  }

  return `Event ${eventId} has been added to the schedule for user ${userId}`;
};

export const createSchedule = async () => {
  const schedulesCollection = await schedules();
  // let today = new Date();
  // let tomorrow = new Date(today);
  // tomorrow.setDate(tomorrow.getDate() + 1);
  // tomorrow.setHours(8, 0, 0, 0);
  // let tmrwEnd = tomorrow;
  // tmrwEnd.setHours(9, 0, 0, 0);
  
  // const newSchedule = {
  //   _id: new ObjectId(),
  //   title: 'My Schedule',
  //   events: [
  //     {
  //       title: 'Example Event',
  //       start: tomorrow.toISOString(),
  //       end: tmrwEnd.toISOString()
  //     }
  //   ]
  // };

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

  if(!ObjectId.isValid(id)) throw 'Not a valid ID';

  let scheduleId = ObjectId.createFromHexString(id)

  const schedule = await schedulesCollection.findOne({ _id: scheduleId });

  if (!schedule) {
    throw new Error('Schedule not found');
  }

  // Convert events to FullCalendar format
  schedule.events = schedule.events.map(event => ({
    title: event.title,
    start: event.start,
    end: event.end
  }));

  return schedule;
}

export const deleteEventFromSchedule = async(userId, eventId) => {
  const validUserId = isValidUserId(userId)
  const validEventId = isValidEventId(eventId)
  
  const schedulesCollection = await schedules();

  const schedule = await schedulesCollection.findOne({ userId: ObjectId(validUserId) });

  if (!schedule) {
    throw new Error('No schedule found for the user');
  }

  //removal logic
  const updateResult = await schedulesCollection.updateOne(
    { userId: ObjectId(validUserId) },
    { $pull: { events: ObjectId(validEventId) } }
  );

  if (updateResult.modifiedCount === 0) {
    throw new Error(`Could not remove event ${eventId} from the schedule`);
  }

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
