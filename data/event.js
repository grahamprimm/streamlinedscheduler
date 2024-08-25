import {events, users, schedules} from '../config/mongoCollections.js'
import { ObjectId } from 'mongodb';
import {isValidEmail} from '../helpers.js'
import {getAllUsersWithSchedules , getIdFromEmail} from './users.js'
import { deleteEventFromSchedule } from './schedule.js';
import { createNotification } from './notification.js';

export const createEvent = async (
    title,
    createdBy,
    description,
    startTime,
    endTime,
    location,
    reminder,
    isRecurring,
    recurrenceFrequency,
    sharedWith,
    numberOfOccurrences
) => {
    const event = await events()

    let allUsers = await getAllUsersWithSchedules()
    let allUserIDs = []

    for (let user of allUsers)
    {
    let userId = user._id.toString()
    allUserIDs.push(userId)
    }

    if (!title) throw 'Title not provided'
    if (!description) throw 'not provided'
    if (!startTime) throw 'not provided'
    if (!endTime) throw 'not provided'
    if (!location) throw 'not provided'
    if (!reminder) throw 'not provided'
    if (typeof isRecurring !== 'boolean') throw 'Field isRecurring could not be read'
    if (isRecurring && (!recurrenceFrequency || recurrenceFrequency === '')) throw 'Recurrence frequency not provided';
    if (!sharedWith) throw 'sharedWith not provided'
    if (!createdBy) throw 'Event creator not provided'

    console.log(createdBy)
    console.log(sharedWith)
    console.log(sharedWith.length)

    if (!ObjectId.isValid(createdBy)) throw 'Invalid ID';

    if(!allUserIDs.includes(createdBy)) throw 'Invalid event creator'


    if (!Array.isArray(sharedWith)) throw 'sharedWith must be an array'

    if(sharedWith.length>0)
    {
        for (let i = 0; i < sharedWith.length; i++) {
            let userSharedWith = await getIdFromEmail(sharedWith[i])
            if (userSharedWith === createdBy) throw 'You cannot add yourself to the list of shared users'
            if (!ObjectId.isValid(userSharedWith)) throw 'Invalid ID';
            if (!allUserIDs.includes(userSharedWith)) throw 'Could not find user'
            sharedWith[i] = userSharedWith

        }
    }

    if (typeof title!== 'string' || title.length <1 || title.length>30) throw 'Title should be a string between 1 and 30 characters'
    if (typeof description !== 'string' || description.length <1 || description.length>300) throw 'Description should be a string between 1 and 300 characters'
    if (!(startTime instanceof Date)) throw 'Start time should be a valid instance of Date object'
    if (!(endTime instanceof Date)) throw 'Start time should be a valid instance of Date object'
    let currentTime = new Date()
    if (startTime > endTime || startTime < currentTime) throw 'Start time should be before end time , and cannot be before current time'
    if (typeof location !== 'string' || location.length <1 || location.length>30) throw 'Location should be a string between 1 and 30 characters'
    
    // INSERT THE VALIDATION FOR RECURRENCE FREQUENCY
    

    let newEvent = {title,
        description,
        startTime,
        endTime,
        location,
        reminder,
        isRecurring,
        recurrenceFrequency,
        sharedWith,
        createdBy
    }

        const insertInfo = await event.insertOne(newEvent);

        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add band';

        const newId = insertInfo.insertedId.toString();
        const insertedEvent = await getEventById(newId);

        if (isRecurring) {
            await generateRecurringEvents(insertedEvent, newId, numberOfOccurrences);
        }    

        return insertedEvent;
}

export const getEventById = async (id) => {

    if (typeof id != 'string') throw 'ID must be a string';
    id = id.trim();
    if (id.length === 0) throw 'ID cannot be empty';
    if (!ObjectId.isValid(id)) throw 'Invalid ID';

    const event = await events();
    const idno = ObjectId.createFromHexString(id);
    const ev = await event.findOne({_id: idno});

    if (!ev) throw 'Could not find event';
    ev._id = idno.toString();

    return ev;
}


export const updateEventInDb = async (
    id,
    title,
    description,
    startTime,
    endTime,
    location,
    reminder,
    isRecurring,
    recurrenceFrequency,
    sharedWith
) => {
    // Input validations
    if (!title) throw 'Title not provided';
    if (!description) throw 'Description not provided';
    if (!startTime) throw 'Start time not provided';
    if (!endTime) throw 'End time not provided';
    if (!location) throw 'Location not provided';
    if (!reminder) throw 'Reminder not provided';
    if (typeof isRecurring !== 'boolean') throw 'Field isRecurring could not be read';
    if (isRecurring && (!recurrenceFrequency ||  recurrenceFrequency === '')) throw 'Recurrence frequency not provided';

    if (typeof title !== 'string' || title.length < 1 || title.length > 30) throw 'Title should be a string between 1 and 30 characters';
    if (typeof description !== 'string' || description.length < 1 || description.length > 300) throw 'Description should be a string between 1 and 300 characters';
    if (!(startTime instanceof Date)) throw 'Start time should be a valid instance of Date object';
    if (!(endTime instanceof Date)) throw 'End time should be a valid instance of Date object';
    let currentTime = new Date();
    if (startTime > endTime || startTime < currentTime) throw 'Start time should be before end time and cannot be before current time';
    if (typeof location !== 'string' || location.length < 1 || location.length > 30) throw 'Location should be a string between 1 and 30 characters';

    if (!Array.isArray(sharedWith)) throw 'sharedWith must be an array'

    if(sharedWith.length>0)
    {
        for (let i = 0; i < sharedWith.length; i++) {
            let userSharedWith = await getIdFromEmail(sharedWith[i])
            if (userSharedWith === createdBy) throw 'You cannot add yourself to the list of shared users'
            if (!ObjectId.isValid(userSharedWith)) throw 'Invalid ID';
            if (!allUserIDs.includes(userSharedWith)) throw 'Could not find user'
            sharedWith[i] = userSharedWith

        }
    }

    


    let allUsers = await getAllUsersWithSchedules();
    let allUserIDs = allUsers.map(user => user._id.toString());

    

    const eventCollection = await events();

    const idno = ObjectId.createFromHexString(id);

    let origSharedWith = await eventCollection.findOne({_id : idno})
    origSharedWith = origSharedWith.sharedWith

    sharedWith = sharedWith.concat(origSharedWith)


    sharedWith = [...new Set(sharedWith)]


    let updateInfo = {
        title,
        description,
        startTime,
        endTime,
        location,
        reminder,
        isRecurring,
        recurrenceFrequency,
        sharedWith
    };

    

    const updatedEvent = await eventCollection.findOneAndUpdate(
        { _id: idno },
        { $set: updateInfo },
        { returnDocument: 'after' }
    );

    if (!updatedEvent.value) throw 'Could not update event';

    // Notification Logic
    try {
        // Notify the event creator
        await createNotification(updatedEvent.value.createdBy, 'Event Updated', `Your event "${title}" has been updated.`);

        // Notify all users in sharedWith array
        for (const email of sharedWith) {
            // Assuming getIdFromEmail is a function that retrieves a user's ID from their email
            const userId = await getIdFromEmail(email);
            await createNotification(userId, 'Event Updated', `The event "${title}" you are part of has been updated.`);
        }
    } catch (notificationError) {
        console.error('Failed to send notifications:', notificationError);
    }

    updatedEvent.value._id = idno.toString();

    return updatedEvent.value;
};

export const deleteEventFromDb = async (id) => {

    if (typeof id != 'string') throw 'ID must be a string';

    id = id.trim();
        
    if (id.length === 0) throw 'ID cannot be empty';
        
    if (!ObjectId.isValid(id)) throw 'Invalid ID';

    
    const event = await events();
    const idno = ObjectId.createFromHexString(id);
    const deletedEvent = await event.findOneAndDelete({_id: idno});

    if (!deletedEvent) throw 'Could not find event';
    
    let userId = deletedEvent.createdBy
    let user = await users()

    userId = ObjectId.createFromHexString(userId)

    let eventCreator = await user.findOne({_id : userId})
    let schedule = await schedules()
    let updatedUser = await user.updateOne({_id : userId},{$pull : {eventsCreated : id}})

    await user.updateMany(
        {}, 
        {
           $pull: { eventsShared: id }         }
     )

    if(!updatedUser) throw 'Event could not be removed from user events created'
    userId = userId.toString()
    
     await schedule.updateMany({}, {$pull : {events : id}})

    return 'The event ' + deletedEvent.title + ' has been deleted';


}

export const generateRecurringEvents = async (event, originalEventId, numberOfOccurrences) => {
    const eventsCollection = await events();

    if (!Number.isInteger(numberOfOccurrences) || numberOfOccurrences <= 0) {
        throw new Error('Number of occurrences must be a positive integer.');
    }

    let currentStartTime = new Date(event.startTime);
    let currentEndTime = new Date(event.endTime);

    for (let i = 1; i <= numberOfOccurrences; i++) {
        if (event.recurrenceFrequency === 'weekly') {
            currentStartTime.setDate(currentStartTime.getDate() + 7);
            currentEndTime.setDate(currentEndTime.getDate() + 7);
        } else if (event.recurrenceFrequency === 'monthly') {
            currentStartTime.setMonth(currentStartTime.getMonth() + 1);
            currentEndTime.setMonth(currentEndTime.getMonth() + 1);
        }

        const recurringEvent = {
            ...event,
            _id: new ObjectId(),
            startTime: new Date(currentStartTime),
            endTime: new Date(currentEndTime),
            originalEventId: new ObjectId(originalEventId) 
        };

        await eventsCollection.insertOne(recurringEvent);
    }
};