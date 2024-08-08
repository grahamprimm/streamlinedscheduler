import bcrypt from 'bcrypt';
import { users } from '../config/mongoCollections.js';
import { isValidString, isValidPassword, isValidTimezone, isValidRole } from '../helpers.js';

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
  email = isValidEmail(email, 5, 10, 'Email').toLowerCase();
  password = isValidPassword(password);
  timezone = isValidTimezone(timezone);
  // make sure schedule is null
  schedule = null;
  
  role = isValidRole(role, ['admin', 'user']);

  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    throw new Error('There is already a user with that email.');
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    timezone,
    role,
    schedule: createSchedule()
  };

  const insertResult = await usersCollection.insertOne(newUser);

  if (insertResult.insertedCount === 0) {
    throw new Error('Could not add user');
  }

  return { signupCompleted: true };
};

export const loginUser = async (email, password) => {
  
  const usersCollection = await users();
  
  email = isValidEmail(email, 8, 20, 'Username').toLowerCase(); // TODO: validate email
  password = isValidPassword(password);

  const user = await usersCollection.findOne({ email });

  if (!user) {
    throw new Error('Either the email or password is invalid');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Either the email or password is invalid');
  }

  const { firstName, lastName, email, timezone, schedule, role  } = user;

  return { firstName, lastName, email, timezone, schedule, role };
};
