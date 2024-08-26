import express from 'express';
import session from 'express-session';
import { create } from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import configRoutes from './routes/index.js';
import loggingMiddleware from './middleware.js';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/fullcalendar', express.static(__dirname + '/node_modules/fullcalendar'));

const hbs = create({
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials'
});

Handlebars.registerHelper('ifeq', function(a, b, options) {
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(session({
  name: 'AuthenticationState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false
}));

app.use(loggingMiddleware);

configRoutes(app);

cron.schedule('* * * * *', async () => {  // Runs every minute
    console.log('Cron job running at:', new Date());

    const notificationsCollection = await notifications();
    const currentTime = new Date();

    // Find notifications that need to be sent
    const dueNotifications = await notificationsCollection.find({
        reminderTime: { $lte: currentTime },
        sentTime: null  // Only send unsent notifications
    }).toArray();

    console.log('Due notifications:', dueNotifications.length);

    for (const notification of dueNotifications) {
        console.log(`Sending notification ID ${notification._id} for user ID ${notification.userID}`);

        try {
            // Update sentTime to indicate the notification has been sent
            const updateResult = await notificationsCollection.updateOne(
                { _id: notification._id },
                { $set: { sentTime: new Date() } }
            );

            if (updateResult.modifiedCount === 0) {
                throw new Error(`Failed to update sentTime for notification ID ${notification._id}`);
            }

            console.log(`Notification ID ${notification._id} sent and marked as sent.`);
        } catch (error) {
            console.error(`Error sending notification ID ${notification._id} for user ID ${notification.userID}:`, error);
        }
    }
});
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
