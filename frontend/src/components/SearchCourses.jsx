import React from 'react';

function SearchCourses({ courses, searchTerm, handleSearchChange, addTakenCourse, removeTakenCourse, takenCourses }) {
    const searchedCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h2>Search and Select Taken Courses</h2>
            <input
                type="text"
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
            />
            <ul>
                {searchedCourses.slice(0, 10).map(course => (
                    <li key={course.course_id}>
                        {course.title} ({course.course_id})
                        <button onClick={() => addTakenCourse(course)}>Add</button>
                    </li>
                ))}
            </ul>

            <h3>Taken Courses</h3>
            <ul>
                {takenCourses.map(course => (
                    <li key={course.course_id}>
                        {course.title} ({course.course_id})
                        <button onClick={() => removeTakenCourse(course.course_id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SearchCourses;
