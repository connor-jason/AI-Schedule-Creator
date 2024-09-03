import React, { useState } from 'react';
import axios from 'axios';

function GenerateSchedules({ availableCourses, takenCourseIds, selectedYear, description, reqList, selectedFilters }) {
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showSchedules, setShowSchedules] = useState(false);

    const handleGenerateSchedules = () => {
        setLoading(true);
        setError(null);
        setResult([]);
        setSelectedEntry(null);
        setShowSchedules(false);

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
            'Selected-Filters': JSON.stringify(selectedFilters), // Selected filters as a JSON string
        };

        // Send a GET request with the headers
        axios.get('http://127.0.0.1:5001/call_ai', { headers })
            .then(response => {
                setResult(response.data); // Store the data in result
                setLoading(false);
            })
            .catch(err => {
                setError('Error generating schedules. Please try again.');
                setLoading(false);
                console.error('Error generating schedules:', err);
            });
    };

    const handleShowDetails = (entry) => {
        // Toggle the selected entry and reset showSchedules
        if (selectedEntry === entry) {
            setSelectedEntry(null);
            setShowSchedules(false);
        } else {
            setSelectedEntry(entry);
            setShowSchedules(false);
        }
    };

    // Function to render schedule details
    const renderSchedules = (schedules) => {
        if (!schedules || schedules.length === 0) {
            return <p>No schedules available</p>;
        }

        return (
            <div>
                {schedules.map((schedule, index) => (
                    <div key={index}>
                        <h4>Schedule {index + 1}</h4>
                        <ul>
                            {schedule.map((section, idx) => (
                                <li className="mb-5" key={idx}>
                                    <strong>Course ID:</strong> {section.course_id} <br />
                                    <strong>Section ID:</strong> {section.section_id} <br />
                                    <strong>Instructor:</strong> {section.instructor} <br />
                                    <strong>Location:</strong> {section.location} <br />
                                    <strong>Meeting Patterns:</strong> {section.meeting_patterns} <br />
                                    <strong>Start Date:</strong> {section.start_date} <br />
                                    <strong>End Date:</strong> {section.end_date} <br />
                                    <strong>Capacity:</strong> {section.enrolled_capacity} / {section.waitlist_capacity} <br />
                                    <strong>Delivery Mode:</strong> {section.delivery_mode} <br />
                                    <strong>Offering Period:</strong> {section.offering_period} <br />
                                    <strong>Instructional Format:</strong> {section.instructional_format}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <button className="border border-black b-2 p-1 hover:underline rounded-xl" onClick={handleGenerateSchedules} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Schedules'}
            </button>

            {error && <p>{error}</p>}

            <div className="flex flex-col">
                {result && result.map((entry, index) => (
                    <div key={index}>
                        <button className="border border-black b-2 w-fit p-1" onClick={() => handleShowDetails(entry)}>
                            {entry.schedule.join(', ')}
                        </button>

                        {selectedEntry === entry && (
                            <div>
                                <p>{entry.justification}</p>
                                <button onClick={() => setShowSchedules(!showSchedules)} className="hover:underline border border-black b-2 w-fit p-1">
                                    {showSchedules ? 'Hide Schedules' : 'View Schedules'}
                                </button>

                                {showSchedules && renderSchedules(entry.schedules)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GenerateSchedules;
