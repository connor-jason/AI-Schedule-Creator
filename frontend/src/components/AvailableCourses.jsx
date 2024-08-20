import React, { useState } from 'react';

function AvailableCourses({ availableCourses, fetchCourse }) {
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleViewDetails = async (courseId) => {
        const courseData = await fetchCourse(courseId);
        setSelectedCourse(courseData);
    };

    return (
        <div>
            <h2>Available Courses</h2>
            <ul>
                {availableCourses.map(course => (
                    <li key={course.course_id}>
                        {course.title} ({course.course_id})
                        <button onClick={() => handleViewDetails(course.course_id)}>View Details</button>
                    </li>
                ))}
            </ul>

            {selectedCourse && (
                <div>
                    <h3>Course Details</h3>
                    <p><strong>Course ID:</strong> {selectedCourse.course_id}</p>
                    <p><strong>Title:</strong> {selectedCourse.title}</p>
                    <p><strong>Credits:</strong> {selectedCourse.credits}</p>
                    <p><strong>Level:</strong> {selectedCourse.level}</p>
                    <p><strong>Description:</strong> {selectedCourse.description}</p>
                </div>
            )}
        </div>
    );
}

export default AvailableCourses;
