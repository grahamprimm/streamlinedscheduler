import { notifications } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

export const createNotification = async (userID, type, message, reminderTime) => {
    const notificationsCollection = await notifications();

    const newNotification = {
        _id: new ObjectId(),
        userID: new ObjectId(userID),
        type: type,
        message: message,
        reminderTime: reminderTime,  // Store when the notification should be sent
        sentTime: null  // Set to null initially, to be updated when sent
    };

    try {
        const insertResult = await notificationsCollection.insertOne(newNotification);

        if (!insertResult.acknowledged) {
            console.error('Notification insertion was not acknowledged:', newNotification);
            throw new Error('Could not create notification');
        }

        console.log(`Notification created for user ${userID}: ${message}`);
        return { notification: newNotification };
    } catch (error) {
        console.error('Failed to create notification:', error);
        throw error;
    }
};


export const getNotificationsByUserId = async (userID) => {
    const notificationsCollection = await notifications();

    try {
        const currentTime = new Date();

        console.log(`Fetching notifications for user ${userID} at ${currentTime}`);

        const query = {
            userID: new ObjectId(userID),
            sentTime: { $ne: null },  // Ensure the notification was sent
            reminderTime: { $lte: currentTime },  // Reminder time should be less than or equal to current time
        };

        console.log('Query:', query);

        const userNotifications = await notificationsCollection.find(query).toArray();

        console.log(`Total notifications found for user ${userID}: ${userNotifications.length}`);
        userNotifications.forEach(notification => {
            console.log(`Notification: ${notification._id} - Reminder Time: ${notification.reminderTime}, Sent Time: ${notification.sentTime}, Start Time: ${notification.startTime}`);
        });

        return userNotifications;
    } catch (error) {
        console.error(`Error fetching notifications for user ${userID}:`, error);
        return []; // Return an empty array in case of error
    }
};



