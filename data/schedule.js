import { schedules } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

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
