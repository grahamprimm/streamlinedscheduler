import { schedules } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

export const createSchedule = async () => {
  const schedulesCollection = await schedules();

  const newSchedule = {
    _id: new ObjectId(),
    title: 'My Schedule',
    events: [],
    sharedWith: []
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

  if(!ObjectId.isValid(id)) throw 'Not a valid ID'

  let idno = ObjectId.createFromHexString(id)

  const schedule = await schedulesCollection.findOne({ _id: idno });

  if (!schedule) {
    throw new Error('Schedule not found');
  }

  return schedule;
}
