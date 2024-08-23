import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { users, schedules } from '../config/mongoCollections.js';
import { isValidString, isValidPassword, isValidEmail, isValidTimezone, isValidRole } from '../helpers.js';
import {createSchedule} from './schedule.js'

const saltRounds = 16;

export const registerUser = async (
  firstName,
  lastName,
  email,
  password,
  timezone,
  role
) => {
  const usersCollection = await users();

  firstName = isValidString(firstName, 2, 25, 'First Name');
  lastName = isValidString(lastName, 2, 25, 'Last Name');
  email = isValidEmail(email, 1, 256, 'Email').toLowerCase();
  password = isValidPassword(password);
  timezone = isValidTimezone(timezone);

  role = isValidRole(role, ['admin', 'user']);

  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    throw new Error('There is already a user with that email.');
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create a new schedule for the user
  const newScheduleId = await createSchedule();

  const newUser = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    timezone,
    role,
    schedule: newScheduleId,
    eventsCreated: [],
    eventsShared: []
  };

  const insertResult = await usersCollection.insertOne(newUser);

  if (insertResult.insertedCount === 0) {
    throw new Error('Could not add user');
  }

  return { signupCompleted: true };
};


export const loginUser = async (email, password) => {
  const usersCollection = await users();
  
  email = isValidEmail(email, 1, 256, 'Email').toLowerCase(); // TODO: validate email
  password = isValidPassword(password);

  const user = await usersCollection.findOne({ email });

  if (!user) {
    throw new Error('Either the email or password is invalid');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Either the email or password is invalid');
  }

  const { firstName, lastName, mail, timezone, schedule, role, eventsCreated, eventsShared  } = user;

  return { firstName, lastName, mail, timezone, schedule, role, eventsCreated, eventsShared };
};

export const getUserById = async (userId) => {
  const usersCollection = await users();
  console.log("Fetching user by ID:", userId);

  let id = ObjectId.createFromHexString(userId)

  const user = await usersCollection.findOne({ _id: id });

  if (!user) {
    console.log("No user found with ID:", userId);
    throw new Error('User not found');
  }

  console.log("User found:", user);
  return user;
};

export const getAllUsersWithSchedules = async () => {
  const usersCollection = await users();
  const schedulesCollection = await schedules();

  const usersList = await usersCollection.find({}).toArray();

  for (let user of usersList) {
    if (user.schedule) {
      let id = ObjectId.createFromHexString(user.schedule)
      const schedule = await schedulesCollection.findOne({ _id: id });
      
      if (schedule) {
        // Convert events to FullCalendar format
        schedule.events = schedule.events.map(event => ({
          title: event.title,
          start: event.start,
          end: event.end
        }));
      }
      
      user.schedule = schedule || { events: [] };  // Attach the schedule to the user object
    } else {
      user.schedule = { events: [] };  // Handle users without a schedule
    }
  }

  return usersList;
};

export const getIdFromEmail = async (email) => {

email = isValidEmail(email)

const userList = await users()

const user = await userList.findOne({ email: email });

if (!user) {
throw new Error('User not found');
}

    
return user._id.toString();

}
