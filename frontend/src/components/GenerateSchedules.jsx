import React, { useState } from 'react';
import axios from 'axios';

function GenerateSchedules({ availableCourses, takenCourseIds, selectedYear, description, reqList }) {
    const [result, setResult] = useState(''); // State to store the returned string
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState('');

    const handleGenerateSchedules = () => {
        setLoading(true);
        setError(null);
        setResult('');
        setSelectedEntry('');

        // Create a comma-separated list of course_ids
        const courseIds = availableCourses.map(course => course.course_id).join(',');

        // Add all the relevant data to the headers
        const headers = {
            'Content-Type': 'application/json',
            'Available-Courses': JSON.stringify(courseIds), // Available courses as a JSON string
            'Taken-Course-Ids': JSON.stringify(takenCourseIds), // Taken courses as a JSON string
            'Selected-Year': selectedYear, // Selected year
            'Description': description, // Description
            'Requirements': JSON.stringify(reqList), // API response as a JSON string
        };

        // Send a GET request with the headers
        axios.get('http://127.0.0.1:5001/call_ai', { headers })
            .then(response => {
                setResult(response.data); // Store the string in result
                setLoading(false);
            })
            .catch(err => {
                setError('Error generating schedules. Please try again.');
                setLoading(false);
                console.error('Error generating schedules:', err);
            });
    };

    return (
        <div>
            <button className="border border-black b-2 p-1" onClick={handleGenerateSchedules} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Schedules'}
            </button>

            {error && <p>{error}</p>}

            <div className="flex flex-col">
                {result && result.map(entry => (
                    <button className="border border-black b-2 w-fit p-1" key={entry.id} onClick={() => setSelectedEntry(entry.justification)}>
                        {entry.schedule}
                    </button>
                ))}
                {selectedEntry && <p>{selectedEntry}</p>}
            </div>
        </div>
    );
}

export default GenerateSchedules;
