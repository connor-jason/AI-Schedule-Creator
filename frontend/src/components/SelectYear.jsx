import React, { useState, useEffect } from 'react';

const SelectYear = ({ onYearSelected, onLevelChanged }) => {
    const [selectedYear, setSelectedYear] = useState('');

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const handleNext = () => {
        if (!selectedYear) {
            alert('Please select a year.');
        } else {
            onYearSelected(selectedYear);
            // Determine level based on selectedYear and pass it to the parent
            if (selectedYear === 'Graduate Student') {
                onLevelChanged(['Graduate']);
            } else {
                onLevelChanged(['Undergraduate']);
            }
        }
    };

    return (
        <div>
            <h2>Select Year</h2>
            <select value={selectedYear} onChange={handleYearChange}>
                <option value="">Select Year</option>
                <option value="First Year">First Year</option>
                <option value="Second Year">Second Year</option>
                <option value="Third Year">Third Year</option>
                <option value="Fourth Year">Fourth Year</option>
                <option value="Graduate Student">Graduate Student</option>
            </select>
            <button onClick={handleNext}>Next</button>
        </div>
    );
};

export default SelectYear;
