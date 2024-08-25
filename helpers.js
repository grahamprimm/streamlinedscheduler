import { ObjectId } from "mongodb";

export const isValidString = (input, minLength, maxLength, field) => {

  if (typeof input !== 'string' || input.trim().length < minLength || input.trim().length > maxLength) {
    throw new Error(`${field} must be a string between ${minLength} and ${maxLength} characters.`);
  }
  if (/\d/.test(input)) {
    throw new Error(`${field} should not contain numbers.`);
  }
  return input.trim();
};

export const isValidPassword = (password) => {

  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter, one number, and one special character.');
  }
  return password;
};

export const isValidTimezone = (timezone) => {
  if (!timezone || ( timezone !== 'EST' && timezone !== 'PST' && timezone != 'CST' )) throw new Error('Timezone must either be EST or PST or CST')  
  return timezone;
};

export const isValidEmail = (input, minLength, maxLength, field) => {
  if (typeof input !== 'string' || input.trim().length < minLength || input.trim().length > maxLength) {
    throw new Error(`${field} must be a string between ${minLength} and ${maxLength} characters.`);
  }

  let email = input.trim()

  if(!email || ! /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)){
    throw new Error('Email must be valid.');
  }

  return email;
};

export const isValidRole = (role, roleList) => {
  // TODO: validate role

  if (typeof role !== 'string') throw new Error('Role must be string');

  role = role.trim()

  if (!roleList.includes(role)) throw new Error('Role must either be admin or user')

  return role.trim();
};

export const isValidUserId = (userId) => {
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('User ID must be a non-empty string.');
  }

  if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid User ID.');
  }

  return userId.trim();
}

export const isValidEventId = (eventId) => {
  if (typeof eventId !== 'string' || eventId.trim().length === 0) {
      throw new Error('Event ID must be a non-empty string.');
  }
  if (!ObjectId.isValid(eventId)) {
      throw new Error('Invalid Event ID.');
  }
  return eventId.trim();
};
