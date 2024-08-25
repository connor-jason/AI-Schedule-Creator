import React, { useState } from 'react';
import axios from 'axios';

function GenerateSchedules({ availableCourses, takenCourseIds, selectedYear, description, reqList }) {
    const [result, setResult] = useState(''); // State to store the returned string
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateSchedules = () => {
        setLoading(true);
        setError(null);
        setResult('');

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
            <button onClick={handleGenerateSchedules} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Schedules'}
            </button>

            {error && <p>{error}</p>}

            {result && <p>{Object.entries(result)}</p>}
        </div>
    );
}

export default GenerateSchedules;
