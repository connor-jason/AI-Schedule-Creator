import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DebugInfo from './components/Debug';
import SearchCourses from './components/SearchCourses';
import FilterOptions from './components/FilterOptions';
import AvailableCourses from './components/AvailableCourses';

const defaultTakenCourseIds = [
    "CS 1102", "CS 2103", "INTL 2100", "MA 1023", "MA 1024", "PH 1110",
    "WPE 1601", "CS 2303", "CS 3733", "MA 2611", "MA 2621", "RE 1731",
    "WR 2010", "BB 1025", "CS 3431", "PSY 1402", "MA 1021", "MA 1022",
    "CS 1000", "EN 1000", "PSY 1400", "BB 1025", "CS 3431", "IMGD 2000", "PSY 1402"
];

function App() {
    const [all_courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({
        delivery_mode: [],
        offering_period: [],
        subject: []
    });
    const [filterOptions, setFilterOptions] = useState({
        delivery_mode: [],
        offering_period: [],
        subject: []
    });
    const [course, setCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableCourses, setAvailableCourses] = useState([]);
    const [takenCourses, setTakenCourses] = useState([]);
    const [takenCourseIds, setTakenCourseIds] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:5001/all_courses')
            .then(response => {
                setCourses(response.data);
                const takenCourseObjects = response.data.filter(course =>
                    defaultTakenCourseIds.includes(course.course_id)
                );
                setTakenCourses(takenCourseObjects);
                setTakenCourseIds(takenCourseObjects.map(course => course.course_id));
            })
            .catch(error => console.error('Error fetching courses:', error));
    
        axios.get('http://127.0.0.1:5001/filter-options')
            .then(response => setFilterOptions(response.data))
            .catch(error => console.error('Error fetching filter options:', error));
    
        axios.get('http://127.0.0.1:5001/sections')
            .then(response => setSections(response.data))
            .catch(error => console.error('Error fetching sections:', error));
    }, []);

    const filteredCourses = useCallback(() => {
        console.log('Filtering courses');
        
        if (Object.values(selectedFilters).every(arr => arr.length === 0)) {
            return [];
        }
        
        return availableCourses.filter(course => {
            const courseSections = sections.filter(section => section.course_id === course.course_id);
            
            return courseSections.some(section => (
                (selectedFilters.delivery_mode?.length === 0 || selectedFilters.delivery_mode.includes(section.delivery_mode)) &&
                (selectedFilters.offering_period?.length === 0 || selectedFilters.offering_period.includes(section.offering_period))
            )) &&
            (selectedFilters.subject?.length === 0 || selectedFilters.subject.some(sub => course.subjects?.includes(sub)));
        });
    }, [availableCourses, sections, selectedFilters]);
    

    const handleFilterChange = (category, value) => {
        setSelectedFilters(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            if (updated[category].includes(value)) {
                updated[category] = updated[category].filter(item => item !== value);
            } else {
                updated[category].push(value);
            }
            return updated;
        });
    };

    const fetchCourse = (courseId) => {
        axios.get(`http://127.0.0.1:5001/course/${courseId}`)
            .then(response => setCourse(response.data))
            .catch(error => console.error('Error fetching course:', error));
    };

    const fetchAvailableCourses = useCallback(() => {
        const takenCourseIdsString = takenCourseIds.join(',');
        axios.get(`http://127.0.0.1:5001/filtered_courses/${takenCourseIdsString}`)
            .then(response => setAvailableCourses(response.data))
            .catch(error => console.error('Error fetching available courses:', error));
    }, [takenCourseIds]);

    useEffect(() => {
        if (takenCourseIds.length > 0) {
            fetchAvailableCourses();
        }
    }, [takenCourseIds, fetchAvailableCourses]);

    const addTakenCourse = (course) => {
        if (!takenCourses.some(c => c.course_id === course.course_id)) {
            setTakenCourses([...takenCourses, course]);
            setTakenCourseIds([...takenCourseIds, course.course_id]);
        }
    };

    const removeTakenCourse = (courseId) => {
        setTakenCourses(takenCourses.filter(c => c.course_id !== courseId));
        setTakenCourseIds(takenCourseIds.filter(id => id !== courseId));
    };

    return (
        <div className="App">
            <DebugInfo
                selectedFilters={selectedFilters}
                filteredCourses={filteredCourses}
                courses={availableCourses}
            />
            <h1>Course List</h1>

            <SearchCourses
                courses={all_courses}
                searchTerm={searchTerm}
                handleSearchChange={setSearchTerm}
                addTakenCourse={addTakenCourse}
                removeTakenCourse={removeTakenCourse}
                takenCourses={takenCourses}
            />

            <FilterOptions
                filterOptions={filterOptions}
                selectedFilters={selectedFilters}
                handleFilterChange={handleFilterChange}
            />

            <AvailableCourses
                availableCourses={filteredCourses()}
                fetchCourse={fetchCourse}
            />
        </div>
    );
}

export default App;
