import React, { useState } from 'react';
import GenerateSchedules from './GenerateSchedules';
import FilterOptions from './FilterOptions';
import './CourseEditPage.css'; // Assuming you'll use this CSS for styling

const CourseEditPage = () => {
    // State for managing any course/filter options or other data
    const [availableCourses, setAvailableCourses] = useState([]);
    const [takenCourseIds, setTakenCourseIds] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [description, setDescription] = useState('');
    const [reqList, setReqList] = useState(null);
    const [filterOptions, setFilterOptions] = useState({
        delivery_mode: [],
        offering_period: [],
        level: [],
        subject: []
    });
    const [selectedFilters, setSelectedFilters] = useState({
        delivery_mode: ["In-Person"],
        offering_period: [],
        level: [],
        subject: [],
    });

    const handleFilterChange = (category, value) => {
        setSelectedFilters(prev => {
            const updated = { ...prev };
            if (updated[category].includes(value)) {
                updated[category] = updated[category].filter(item => item !== value);
            } else {
                updated[category].push(value);
            }
            return updated;
        });
    };

    return (
        <div className="course-edit-page">
            <div className="left-panel">
                <h2>Generate Schedules</h2>
                <GenerateSchedules
                    availableCourses={availableCourses}
                    takenCourseIds={takenCourseIds}
                    selectedYear={selectedYear}
                    description={description}
                    reqList={reqList}
                />
            </div>
            <div className="right-panel">
                <h2>Filter Options</h2>
                <FilterOptions
                    filterOptions={filterOptions}
                    selectedFilters={selectedFilters}
                    handleFilterChange={handleFilterChange}
                />
            </div>
        </div>
    );
};

export default CourseEditPage;
