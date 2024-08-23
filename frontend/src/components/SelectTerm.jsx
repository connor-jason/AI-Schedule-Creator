import React, { useState } from 'react';

const SelectTerm = ({ onTermSelected, termOptions }) => {
const [selectedTerm, setSelectedTerm] = useState('');

const handleTermChange = (event) => {
    setSelectedTerm(event.target.value);
};

const handleNext = () => {
    if (!selectedTerm) {
        alert('Please select a term.');
    } else {
        onTermSelected(selectedTerm);
    }
};

return (
    <div>
    <h2>Which Term Would You Like to Generate Schedules For?</h2>
    <select value={selectedTerm} onChange={handleTermChange}>
        <option value="">Select Term</option>
        {termOptions.map((term) => (
        <option key={term} value={term}>
            {term}
        </option>
        ))}
    </select>
    <button onClick={handleNext}>Next</button>
    </div>
);
};

export default SelectTerm;