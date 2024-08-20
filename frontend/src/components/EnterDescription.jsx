import React, { useState } from 'react';

const EnterDescription = ({ onDescriptionSubmitted }) => {
const [description, setDescription] = useState('');

const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
};

const handleSubmit = () => {
    onDescriptionSubmitted(description);
};

return (
    <div>
    <h2>Enter Description</h2>
    <textarea
        value={description}
        onChange={handleDescriptionChange}
        maxLength={500}
    />
    <button onClick={handleSubmit}>Generate Schedules</button>
    </div>
);
};

export default EnterDescription;