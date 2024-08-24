import {dbConnection} from './mongoConnection.js';

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export const users = getCollectionFn('users');
export const schedules = getCollectionFn('schedules');
export const events = getCollectionFn('events')
export const notifications = getCollectionFn('notifications');
