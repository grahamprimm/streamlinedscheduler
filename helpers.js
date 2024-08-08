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
  // TODO: validate timezone
  return timezone;
};

export const isValidEmail = (email) => {
  // TODO: validate email
  return email.trim();
};
