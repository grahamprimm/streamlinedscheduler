import { notifications } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

export const createNotification = async (userID, type, message) => {
    const notificationsCollection = await notifications();

    const newNotification = {
        _id: new ObjectId(),
        userID: new ObjectId(userID),
        type: type,
        message: message,
        sentTime: new Date()
    };

    const insertResult = await notificationsCollection.insertOne(newNotification);

    if (insertResult.insertedCount === 0) {
        throw new Error('Could not create notification');
    }

    return { notification: newNotification };
};

export const getNotificationById = async (id) => {
    const notificationsCollection = await notifications();

    const notification = await notificationsCollection.findOne({ _id: new ObjectId(id) });

    if (!notification) {
        throw new Error('Notification not found');
    }

    return notification;
};
