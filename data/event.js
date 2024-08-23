import {events} from '../config/mongoCollections.js'
import { ObjectId } from 'mongodb';

export const createEvent = async (
    title,
    description,
    startTime,
    endTime,
    location,
    reminder,
    isRecurring,
    recurrenceFrequency
) => 
    
{

    const event = await events()
    

    if (!title) throw 'Title not provided'
    if (!description) throw 'not provided'
    if (!startTime) throw 'not provided'
    if (!endTime) throw 'not provided'
    if (!location) throw 'not provided'
    if (!reminder) throw 'not provided'
    if (typeof isRecurring !== 'boolean') throw 'Field isRecurring could not be read'
    if (!recurrenceFrequency) throw 'not provided'

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
        recurrenceFrequency}

        const insertInfo = await event.insertOne(newEvent);

        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add band';
          
        const newId = insertInfo.insertedId.toString();
          
        const insertedEvent = await get(newId);
          
        return insertedEvent;

}

export const getEventById = async (id) => {

    if (typeof id != 'string') throw 'ID must be a string';

    id = id.trim();
      
    if (id.length === 0) throw 'ID cannot be empty';
      
    if (!ObjectId.isValid(id)) throw 'Invalid ID';
      
    const events = await events();
      
    const idno = ObjectId.createFromHexString(id);
      
    const ev = await event.findOne({_id: idno});
      
    if (!ev) throw 'Could not find event';
      
    ev._id = idno.toString();
      
    return ev;

}

export const updateEventInDb = async (title,
    description,
    startTime,
    endTime,
    location,
    reminder,
    isRecurring,
    recurrenceFrequency, userId) => {if (!title) throw 'Title not provided'
        if (!description) throw 'not provided'
        if (!startTime) throw 'not provided'
        if (!endTime) throw 'not provided'
        if (!location) throw 'not provided'
        if (!reminder) throw 'not provided'
        if (typeof isRecurring !== 'boolean') throw 'Field isRecurring could not be read'
        if (!recurrenceFrequency) throw 'not provided'
    
        if (typeof title!== 'string' || title.length <1 || title.length>30) throw 'Title should be a string between 1 and 30 characters'
        if (typeof description !== 'string' || description.length <1 || description.length>300) throw 'Description should be a string between 1 and 300 characters'
        if (!(startTime instanceof Date)) throw 'Start time should be a valid instance of Date object'
        if (!(endTime instanceof Date)) throw 'Start time should be a valid instance of Date object'
        let currentTime = new Date()
        if (startTime > endTime || startTime < currentTime) throw 'Start time should be before end time , and cannot be before current time'
        if (typeof location !== 'string' || location.length <1 || location.length>30) throw 'Location should be a string between 1 and 30 characters'
        
        // INSERT THE VALIDATION FOR RECURRENCE FREQUENCY
    
        const event = await events()
    
        let updateInfo = {title,
            description,
            startTime,
            endTime,
            location,
            reminder,
            isRecurring,
            recurrenceFrequency}
        
            const idno = ObjectId.createFromHexString(userId);

            const updatedEvent = event.findOneAndUpdate(
  
                {_id: idno},
                {$set: updateInfo},
                {returnDocument: 'after'}
              
              )
              
              if (!updatedEvent) throw 'Could not update band';
              
              updatedEvent._id = idno.toString();
              
              return updatedEvent;
        
        }

export const removeEventFromDb = async (id) => {

    if (typeof id != 'string') throw 'ID must be a string';

    id = id.trim();
        
    if (id.length === 0) throw 'ID cannot be empty';
        
    if (!ObjectId.isValid(id)) throw 'Invalid ID';
        
    const event = await events();
      
    const idno = ObjectId.createFromHexString(id);
      
    const deletedEvent = await event.findOneAndDelete({_id: idno});
      
    if (!deletedEvent) throw 'Could not find band';
      
    return 'The event ' + deletedEvent.title + ' has been deleted';

}
