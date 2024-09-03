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
                        <h1 className="font-bold">Schedule {index + 1}</h1>
                        <ul>
                            {schedule.map((section, idx) => (
                                <li className="mb-5" key={idx}>
                                    <p>Section: {section.course_id}-{section.section_id} </p> 
                                    <p>Instructor: {section.instructor} </p> 
                                    <p>Location: {section.location} </p> 
                                    <p>Meeting Patterns: {section.meeting_patterns} </p> 
                                    <p>Date: {section.start_date} - {section.end_date} </p> 
                                    <p>Capacity: {section.enrolled_capacity} / {section.waitlist_capacity} </p> 
                                    <p>Delivery Mode: {section.delivery_mode} </p> 
                                    <p>Instructional Format: {section.instructional_format}</p> 
                                    <p>Offering Period: {section.offering_period}</p>
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
                    <div className="py-1" key={index}>
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
