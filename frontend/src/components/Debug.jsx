import React from 'react';

function DebugInfo({ selectedFilters, filteredCourses, courses }) {
    return (
        <div style={{border: '1px solid red', margin: '10px', padding: '10px'}}>
            <h3>Debug Info:</h3>
            <p>Selected Filters: {JSON.stringify(selectedFilters)}</p>
            <p>Number of Filtered Courses: {filteredCourses().length}</p>
            <p>Total Courses: {courses.length}</p>
            <p>Sample Course: {JSON.stringify(courses[0])}</p>
        </div>
    );
}

export default DebugInfo;
