import React, { useState } from 'react';

function SearchCourses({ all_courses, takenCourses, addTakenCourse, removeTakenCourse }) {

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (value) => setSearchTerm(value);

    const searchedCourses = all_courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="item">
                <h2 className="font-bold">Search and Select Taken Courses</h2>
                <input
                    type="text"
                    placeholder="Search for courses..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
                <div className="scrollable-content h-[calc(100%-3rem)]">
                    <ul>
                        {searchedCourses.slice(0, 10).map(course => (
                            <li className="px-2" key={course.course_id}>
                                {course.title} ({course.course_id})
                                <button className="border border-black b-2 hover:underline rounded-xl px-1" onClick={() => addTakenCourse(course)}>Add</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div> 
        <div className="item">
            <h3 className="font-bold">Taken Courses</h3>
            <div className="scrollable-content">
                <ul>
                    {takenCourses.map(course => (
                        <li className="px-2" key={course.course_id}>
                            {course.title} ({course.course_id})
                            <button className="border border-black b-2 hover:underline rounded-xl px-1" onClick={() => removeTakenCourse(course.course_id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        </>
    );
}

export default SearchCourses;
