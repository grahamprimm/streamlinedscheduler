const validateForm = (form) => {
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const confirmPassword = form.confirmPassword.value.trim();
  const timezone = form.timezone.value.trim();
  const role = form.role.value.trim().toLowerCase();

  const errors = [];

  if (!firstName || firstName.length < 2 || firstName.length > 25 || /\d/.test(firstName)) {
    errors.push('First name must be a valid string between 2 and 25 characters without numbers.');
  }
  if (!lastName || lastName.length < 2 || lastName.length > 25 || /\d/.test(lastName)) {
    errors.push('Last name must be a valid string between 2 and 25 characters without numbers.');
  }
  if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
    errors.push('Password must be at least 8 characters long and contain an uppercase letter, a number, and a special character.');
  }
  if (password !== confirmPassword) {
    errors.push('Passwords do not match.');
  }
  if (role !== 'admin' && role !== 'user') {
    errors.push('Role must be either "admin" or "user".');
  }
  // TODO: Add validation for timezone and email

  if (errors.length > 0) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = errors.join('<br>');
    errorContainer.style.display = 'block';
    return false;
  }
  return true;
};

document.getElementById('signup-form').addEventListener('submit', function (event) {
  if (!validateForm(this)) {
    event.preventDefault();
  }
});

document.getElementById('signin-form').addEventListener('submit', function (event) {
  const email = this.email.value.trim();
  const password = this.password.value.trim();
  const errors = [];

  if (!email || email.length < 5 || email.length > 10) {
    errors.push('Username must be a valid string between 5 and 10 characters.');
  }
  if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
    errors.push('Password must be at least 8 characters long and contain an uppercase letter, a number, and a special character.');
  }

  if (errors.length > 0) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = errors.join('<br>');
    errorContainer.style.display = 'block';
    event.preventDefault();
  }
});

