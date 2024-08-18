import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function App() {
    // State variables
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);
    const [filterOptions, setFilterOptions] = useState({});
    const [selectedFilters, setSelectedFilters] = useState({
        delivery_mode: [],
        offering_period: [],
        subject: []
    });
    const [course, setCourse] = useState(null);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/all_courses')
            .then(response => {
                console.log('Courses fetched:', response.data);
                setCourses(response.data);
            })
            .catch(error => console.error('Error fetching courses:', error));

        axios.get('http://127.0.0.1:5000/filter-options')
            .then(response => {
                console.log('Filter options fetched:', response.data);
                setFilterOptions(response.data);
            })
            .catch(error => console.error('Error fetching filter options:', error));

        axios.get('http://127.0.0.1:5000/sections')
            .then(response => {
                console.log('Sections fetched:', response.data);
                setSections(response.data);
            })
            .catch(error => console.error('Error fetching sections:', error));
    }, []);

// Callback function to filter courses based on selected filters
const filteredCourses = useCallback(() => {
    console.log('Filtering courses');
    
    // Base case: if no filters are selected, return all courses
    if (Object.values(selectedFilters).every(arr => arr.length === 0)) {
        return [];
    }
    
    return courses.filter(course => {
        // Filter sections for the current course
        const courseSections = sections.filter(section => section.course_id === course.course_id);
        
        return courseSections.some(section => (
            (selectedFilters.delivery_mode.length === 0 || selectedFilters.delivery_mode.includes(section.delivery_mode)) &&
            (selectedFilters.offering_period.length === 0 || selectedFilters.offering_period.includes(section.offering_period))
        )) &&
        (selectedFilters.subject.length === 0 || selectedFilters.subject.some(sub => course.subjects.includes(sub)));
    });
}, [courses, sections, selectedFilters]); // Dependencies to recalculate filteredCourses when any of these change


    // Function to handle changes in filter checkboxes
    const handleFilterChange = (category, value) => {
        console.log('Checkbox clicked:', category, value);
        setSelectedFilters(prev => {
            const updated = JSON.parse(JSON.stringify(prev)); // Create a deep copy to avoid mutating state directly
            if (updated[category].includes(value)) {
                // If the value is already selected, remove it
                updated[category] = updated[category].filter(item => item !== value);
            } else {
                // If the value is not selected, add it
                updated[category].push(value);
            }
            console.log('Updated filters:', updated);
            return updated;
        });
    };

    // fetch details of a specific course
    const fetchCourse = (courseId) => {
        axios.get(`http://127.0.0.1:5000/course/${courseId}`)
            .then(response => {
                setCourse(response.data);
            })
            .catch(error => console.error('Error fetching course:', error));
    };

    // display current filter and course info
    const debugInfo = (
        <div key={JSON.stringify(selectedFilters)} style={{border: '1px solid red', margin: '10px', padding: '10px'}}>
            <h3>Debug Info:</h3>
            <p>Selected Filters: {JSON.stringify(selectedFilters)}</p>
            <p>Number of Filtered Courses: {filteredCourses().length}</p>
            <p>Total Courses: {courses.length}</p>
            <p>Sample Course: {JSON.stringify(courses[0])}</p>
        </div>
    );

    return (
        <div className="App">
            {debugInfo}
            <h1>Course List</h1>
            <div>
                {/* Render filter options */}
                {Object.keys(filterOptions).map(category => (
                    <div key={category}>
                        <h2>{category.replace('_', ' ').toUpperCase()}</h2>
                        {filterOptions[category]?.map(value => (
                            <div key={value}>
                                <input
                                    type="checkbox"
                                    id={`${category}-${value}`}
                                    name={category}
                                    value={value}
                                    checked={selectedFilters[category].includes(value)}
                                    onChange={() => handleFilterChange(category, value)}
                                />
                                <label 
                                    htmlFor={`${category}-${value}`}
                                    onClick={() => handleFilterChange(category, value)}
                                >
                                    {value}
                                </label>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <ul>
                {/* Render filtered courses */}
                {filteredCourses().map(course => (
                    <li key={course.course_id}>
                        {course.title}
                        <button onClick={() => fetchCourse(course.course_id)}>View Details</button>
                    </li>
                ))}
            </ul>
            {/* Render course details if a course is selected */}
            {course && (
                <div>
                    <h2>Course Details</h2>
                    <p>Course ID: {course.course_id}</p>
                    <p>Title: {course.title}</p>
                    <p>Description: {course.description}</p>
                </div>
            )}
        </div>
    );
}

export default App;
