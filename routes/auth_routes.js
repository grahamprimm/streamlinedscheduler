import express from 'express';
import { getScheduleById } from '../data/schedule.js';
import { registerUser, loginUser, getAllUsersWithSchedules } from '../data/users.js';

const router = express.Router();

router.route('/').get(async (req, res) => {
  //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
  return res.json({error: 'YOU SHOULD NOT BE HERE!'});
});

router
  .route('/register')
  .get((req, res) => {
    res.render('register', { title: 'Register' });
  })
  .post(async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, timezone, role } = req.body;
    try {
      if (!firstName || !lastName || !email || !password || !confirmPassword || !timezone || !role) {
        throw new Error('All fields must be provided.');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      const result = await registerUser(firstName, lastName, email, password, timezone, role);
      console.log(result);
      if (result.signupCompleted) {
        res.status(200).redirect('/login')
        //return res.status(200).json({ success: true, message: "Registration successful! Redirecting to login...", redirectUrl: '/login' });
      } else {
        throw new Error('Internal Server Error');
      }
    } catch (e) {
      res.status(400).render('register', { title: 'Register', error: e.message });
    }
  });

router
  .route('/login')
  .get((req, res) => {
    res.render('login', { title: 'Login' });
  })
  .post(async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        throw new Error('Username and password must be provided.');
      }
      const user = await loginUser(email, password);
      
      req.session.user = user;
      if (user.role === 'admin') {
        res.status(200).redirect('/admin');
      } else {
        res.status(200).redirect('/schedule');
      }
    } catch (e) {
      res.status(400).render('login', { title: 'Login', error: e.message });
    }
  });

router.get('/logout', (req, res) => {
  const themePreference = req.session.user ? req.session.user.themePreference : 'light';
  req.session.destroy();
  res.status(200).render('logout', { message: 'You have been logged out. <a href="/login">Login again</a>', themePreference });
});


router.get('/admin', async (req, res) => {
  const { firstName, lastName, timezone } = req.session.user;

  let currentTime;
  if (timezone === 'CST') currentTime = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  if (timezone === 'EST') currentTime = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  if (timezone === 'PST') currentTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  try {
    const users = await getAllUsersWithSchedules();
    res.render('admin', {
      firstName,
      lastName,
      currentTime,
      timezone,
      users
    });
  } catch (e) {
    console.error("Error retrieving users and schedules:", e);
    res.status(500).send('Error retrieving users and schedules.');
  }
});

router.get('/schedule', async (req, res) => {
  try {
    const { firstName, lastName, email, role, timezone, schedule, eventsCreated, eventsShared } = req.session.user;

    if (!schedule) {
      return res.status(400).render('error', { message: 'No schedule found for this user.' });
    }

    let currentTime;

    if (timezone === 'CST') currentTime = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
    if (timezone === 'EST') currentTime = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    if (timezone === 'PST') currentTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

    const fullSchedule = await getScheduleById(schedule);

    res.render('schedule', {
      firstName,
      lastName,
      email,
      currentTime: currentTime,
      role,
      timezone,
      schedule: fullSchedule,
      eventsCreated,
      eventsShared
    });

  } catch (e) {
    console.error("Error retrieving schedule:", e);
    res.status(500).send('Error retrieving schedule.');
  }
});

export default router;
