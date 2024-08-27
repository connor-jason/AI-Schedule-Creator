import React from 'react';

function SearchCourses({ searchedCourses, takenCourses, addTakenCourse, removeTakenCourse }) {
    return (
        <div className="scrollable-content">
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
