import React from 'react';

const Event = ({ event }) => {
    return (
        <div>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p>{new Date(event.startTime).toLocaleString()}</p>
            <p>{new Date(event.endTime).toLocaleString()}</p>
        </div>
    );
};

export default Event;
