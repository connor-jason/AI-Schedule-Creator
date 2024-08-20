import React, { useState } from 'react';
import axios from 'axios';

function GenerateSchedules({ availableCourses }) {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateSchedules = () => {
        setLoading(true);
        setError(null);

        // Create a comma-separated list of course_ids
        const courseIds = availableCourses.map(course => course.course_id).join(',');

        // Send a GET request with the available courses
        axios.get(`http://127.0.0.1:5001/generate_schedules/${courseIds}`)
            .then(response => {
                setSchedules(response.data); // Directly set response data as schedules
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

            {schedules.length > 0 && (
                <div>
                    {schedules.map((schedule, index) => (
                        <div key={index}>
                            <h3>Schedule {index + 1}</h3>
                            <ul>
                                {schedule.map((course, idx) => (
                                    <li key={idx}>
                                        {course.course_id}-{course.section_id} {course.instructional_format}: {course.meeting_patterns}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GenerateSchedules;
