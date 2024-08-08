import { schedules } from '../config/mongoCollections.js';

export const createSchedule = async () => {
  const schedulesCollection = await schedules();

  const newSchedule = {
    _id: new ObjectId(),
    title: 'My Schedule',
    events: [],
    sharedWith: []
  };

  const insertResult = await schedulesCollection.insertOne(newSchedule);

  if (insertResult.insertedCount === 0) {
    throw new Error('Could not add schedule');
  }

  return { schedule: newSchedule };
}

export const getScheduleById = async (id) => {
  const schedulesCollection = await schedules();

  const schedule = await schedulesCollection.findOne({ _id: id });

  if (!schedule) {
    throw new Error('Schedule not found');
  }

  return schedule;
}