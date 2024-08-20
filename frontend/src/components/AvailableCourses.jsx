import React from 'react';

function AvailableCourses({ availableCourses, fetchCourse }) {
    return (
        <div>
            <h2>Available Courses</h2>
            <ul>
                {availableCourses.map(course => (
                    <li key={course.course_id}>
                        {course.title} ({course.course_id})
                        <button onClick={() => fetchCourse(course.course_id)}>View Details</button>
                    </li>
                ))}x
            </ul>
        </div>
    );
}

export default AvailableCourses;
