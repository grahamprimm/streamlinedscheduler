import bcrypt from 'bcrypt';
import { users } from '../config/mongoCollections.js';
import { isValidString, isValidPassword, isValidEmail, isValidTimezone, isValidRole } from '../helpers.js';
import {createSchedule, getScheduleById} from './schedules.js'

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
  // make sure schedule is null
  let schedule = null;
  
  role = isValidRole(role, ['admin', 'user']);

  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    throw new Error('There is already a user with that email.');
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  schedule = await createSchedule()

  const newUser = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    timezone,
    role,
    schedule
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

  

  const { firstName, lastName, mail, timezone, schedule, role  } = user;

  

  return { firstName, lastName, mail, timezone, schedule, role };
};

export const getUserById = async (userId) => {
  const usersCollection = await users();
  console.log("Fetching user by ID:", userId);

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    console.log("No user found with ID:", userId);
    throw new Error('User not found');
  }

  console.log("User found:", user);
  return user;
};
