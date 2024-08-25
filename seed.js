import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { events, schedules, users } from './config/mongoCollections.js';

const uri = 'mongodb://localhost:27017/streamlinedscheduler';

const seedDatabase = async () => {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB client
    await client.connect();
    const db = client.db();

    // Get collections
    const usersCollection = await users();
    const schedulesCollection = await schedules();
    const eventsCollection = await events();

    // Clear existing data
    await usersCollection.deleteMany({});
    await schedulesCollection.deleteMany({});
    await eventsCollection.deleteMany({});

    // Create schedules
    const scheduleDocs = [
      { title: 'Schedule 1', events: [] },
      { title: 'Schedule 2', events: [] },
      { title: 'Schedule 3', events: [] },
      { title: 'Schedule 4', events: [] },
      { title: 'Schedule 5', events: [] },
    ];
    const insertedSchedules = await schedulesCollection.insertMany(scheduleDocs);

    // Create users with hashed passwords
    const hashedPassword1 = await bcrypt.hash('password1', 16);
    const hashedPassword2 = await bcrypt.hash('password2', 16);
    const hashedPassword3 = await bcrypt.hash('password3', 16);
    const hashedPassword4 = await bcrypt.hash('password4', 16);
    const hashedPassword5 = await bcrypt.hash('password5', 16);

    const userDocs = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@domain.com',
        password: hashedPassword1,
        timezone: 'EST',
        role: 'admin',
        schedule: insertedSchedules.insertedIds[0],
        eventsCreated: [],
        eventsShared: [],
      },
      {
        firstName: 'User1',
        lastName: 'Last1',
        email: 'user1@domain.com',
        password: hashedPassword2,
        timezone: 'EST',
        role: 'user',
        schedule: insertedSchedules.insertedIds[1],
        eventsCreated: [],
        eventsShared: [],
      },
      {
        firstName: 'User2',
        lastName: 'Last2',
        email: 'user2@domain.com',
        password: hashedPassword3,
        timezone: 'EST',
        role: 'user',
        schedule: insertedSchedules.insertedIds[2],
        eventsCreated: [],
        eventsShared: [],
      },
      {
        firstName: 'User3',
        lastName: 'Last3',
        email: 'user3@domain.com',
        password: hashedPassword4,
        timezone: 'EST',
        role: 'user',
        schedule: insertedSchedules.insertedIds[3],
        eventsCreated: [],
        eventsShared: [],
      },
      {
        firstName: 'User4',
        lastName: 'Last4',
        email: 'user4@domain.com',
        password: hashedPassword5,
        timezone: 'EST',
        role: 'user',
        schedule: insertedSchedules.insertedIds[4],
        eventsCreated: [],
        eventsShared: [],
      },
    ];
    const insertedUsers = await usersCollection.insertMany(userDocs);

    // Create events
    const eventDocs = [
      {
        title: 'Event 1',
        description: 'Event description 1',
        startTime: new Date('2024-08-26T12:00:00.000Z'),
        endTime: new Date('2024-08-26T16:00:00.000Z'),
        location: 'Location 1',
        reminder: '30',
        isRecurring: false,
        recurrenceFrequency: 'N/A',
        sharedWith: [],
        createdBy: insertedUsers.insertedIds[1],
      },
      {
        title: 'Event 2',
        description: 'Event description 2',
        startTime: new Date('2024-09-03T13:00:00.000Z'),
        endTime: new Date('2024-09-03T15:00:00.000Z'),
        location: 'Location 2',
        reminder: '45',
        isRecurring: false,
        recurrenceFrequency: 'N/A',
        sharedWith: [],
        createdBy: insertedUsers.insertedIds[1],
      },
      {
        title: 'Event 3',
        description: 'Event description 3',
        startTime: new Date('2024-09-10T10:00:00.000Z'),
        endTime: new Date('2024-09-10T11:00:00.000Z'),
        location: 'Location 3',
        reminder: '60',
        isRecurring: false,
        recurrenceFrequency: 'N/A',
        sharedWith: [],
        createdBy: insertedUsers.insertedIds[2],
      },
      {
        title: 'Event 4',
        description: 'Event description 4',
        startTime: new Date('2024-09-15T08:00:00.000Z'),
        endTime: new Date('2024-09-15T09:00:00.000Z'),
        location: 'Location 4',
        reminder: '15',
        isRecurring: false,
        recurrenceFrequency: 'N/A',
        sharedWith: [],
        createdBy: insertedUsers.insertedIds[3],
      },
      {
        title: 'Event 5',
        description: 'Event description 5',
        startTime: new Date('2024-09-20T09:00:00.000Z'),
        endTime: new Date('2024-09-20T10:00:00.000Z'),
        location: 'Location 5',
        reminder: '10',
        isRecurring: false,
        recurrenceFrequency: 'N/A',
        sharedWith: [],
        createdBy: insertedUsers.insertedIds[4],
      },
    ];
    const insertedEvents = await eventsCollection.insertMany(eventDocs);

    // Assign events to schedules and users
    await schedulesCollection.updateOne(
      { _id: insertedSchedules.insertedIds[1] },
      { $push: { events: insertedEvents.insertedIds[0] } }
    );
    await schedulesCollection.updateOne(
      { _id: insertedSchedules.insertedIds[1] },
      { $push: { events: insertedEvents.insertedIds[1] } }
    );
    await schedulesCollection.updateOne(
      { _id: insertedSchedules.insertedIds[2] },
      { $push: { events: insertedEvents.insertedIds[2] } }
    );
    await schedulesCollection.updateOne(
      { _id: insertedSchedules.insertedIds[3] },
      { $push: { events: insertedEvents.insertedIds[3] } }
    );
    await schedulesCollection.updateOne(
      { _id: insertedSchedules.insertedIds[4] },
      { $push: { events: insertedEvents.insertedIds[4] } }
    );

    // Add event IDs to users' eventsCreated and eventsShared fields
    await usersCollection.updateOne(
      { _id: insertedUsers.insertedIds[1] },
      { $push: { eventsCreated: insertedEvents.insertedIds[0], eventsShared: insertedEvents.insertedIds[1] } }
    );
    await usersCollection.updateOne(
      { _id: insertedUsers.insertedIds[1] },
      { $push: { eventsCreated: insertedEvents.insertedIds[1], eventsShared: insertedEvents.insertedIds[0] } }
    );
    await usersCollection.updateOne(
      { _id: insertedUsers.insertedIds[2] },
      { $push: { eventsCreated: insertedEvents.insertedIds[2] } }
    );
    await usersCollection.updateOne(
      { _id: insertedUsers.insertedIds[3] },
      { $push: { eventsCreated: insertedEvents.insertedIds[3] } }
    );
    await usersCollection.updateOne(
      { _id: insertedUsers.insertedIds[4] },
      { $push: { eventsCreated: insertedEvents.insertedIds[4] } }
    );

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    console.log('Closing connection.');
    await client.close(true);
  }
};

seedDatabase();
