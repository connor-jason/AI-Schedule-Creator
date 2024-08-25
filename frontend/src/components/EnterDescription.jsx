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
    <div className="flex flex-col items-center justify-center">
    <h2>Enter Description</h2>
    <textarea
        value={description}
        onChange={handleDescriptionChange}
        maxLength={500}
        className="border border-black rounded px-3 py-1 m-3"
    />
    <button onClick={handleSubmit} className="border border-black rounded px-3 py-1 w-fit">Generate Schedules</button>
    </div>
);
};

export default EnterDescription;