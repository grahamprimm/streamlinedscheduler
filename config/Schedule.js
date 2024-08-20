import React, { useState, useEffect } from 'react';
import scheduleApi from '../api/scheduleApi';

const Schedule = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Fetch user's schedule events
        const fetchEvents = async () => {
            const events = await scheduleApi.getEvents();
            setEvents(events);
        };

        fetchEvents();
    }, []);

    return (
        <div>
            <h1>Schedule</h1>
            {/* Render schedule events here */}
        </div>
    );
};

export default Schedule;
