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
        <div className="flex flex-col items-center justify-center">
            <h2>Select Year</h2>
            <div>
                <select value={selectedYear} onChange={handleYearChange} className="border border-black rounded px-3 py-1 my-2 mr-2">
                    <option value="">Select Year</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                    <option value="Graduate Student">Graduate Student</option>
                </select>
                <button onClick={handleNext} className="border border-black rounded px-3 py-1">Next</button>
            </div>
        </div>
    );
};

export default SelectYear;
