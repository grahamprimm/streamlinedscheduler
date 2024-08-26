import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { users, schedules, events } from '../config/mongoCollections.js';
import { isValidString, isValidPassword, isValidEmail, isValidTimezone, isValidRole } from '../helpers.js';
import { createSchedule, getScheduleById } from './schedule.js'

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
  
  email = isValidEmail(email, 1, 256, 'Email').toLowerCase();
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

  let userId = user._id.toString()

  return { firstName, lastName, mail, timezone, schedule, role, eventsCreated, eventsShared, userId };
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
    const eventsCollection = await events();
    const schedulesCollection = await schedules();

    const usersWithSchedules = await usersCollection.find({}).toArray();

    for (let user of usersWithSchedules) {
        // Fetch the user's schedule
        const schedule = await schedulesCollection.findOne({ _id: new ObjectId(user.schedule) });
        
        if (schedule && schedule.events) {
            // Fetch all events in the schedule
            const eventPromises = schedule.events.map(eventId => 
                eventsCollection.findOne({ _id: new ObjectId(eventId) })
            );
            const allEvents = await Promise.all(eventPromises);

            // Ensure startTime and endTime are Date objects and convert to ISO string
            user.allEvents = allEvents.map(event => ({
                title: event.title,
                start: new Date(event.startTime).toISOString(),  // Convert to ISO string
                end: new Date(event.endTime).toISOString(),      // Convert to ISO string
                description: event.description,
                location: event.location,
                reminder: event.reminder,
                createdBy: event.createdBy,
                eventId: event._id.toString()
            }));
        } else {
            user.allEvents = []; // If no schedule or events, assign an empty array
        }
    }

    return usersWithSchedules;
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
