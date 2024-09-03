import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SearchCourses from './components/SearchCourses';
import FilterOptions from './components/FilterOptions';
import AvailableCourses from './components/AvailableCourses';
import GenerateSchedules from './components/GenerateSchedules';
import UploadFile from './components/UploadFile';
import SelectYear from './components/SelectYear';
import SelectTerm from './components/SelectTerm';
import EnterDescription from './components/EnterDescription';
import './index.css';
import RemoveNicheCourses from './components/RemoveNicheCourses';
import DescriptionBox from './components/DescriptionBox';

function App() {
    const [all_courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        delivery_mode: [],
        offering_period: [],
        level: [],
        subject: []
    });    
    const [selectedFilters, setSelectedFilters] = useState({
        delivery_mode: ["In-Person"], // assume people want in person classes
        offering_period: [],
        level: [],
        subject: [],
    });    
    const [availableCourses, setAvailableCourses] = useState([]);
    const [takenCourses, setTakenCourses] = useState([]);
    const [takenCourseIds, setTakenCourseIds] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [nicheCourses, setNicheCourses] = useState(['Varsity', 'Club']);
    const [description, setDescription] = useState('');
    const [reqList, setReqList] = useState(null);

    const defaultTakenCourseIds = [
        "CS 1102", "CS 2103", "INTL 2100", "MA 1023", "MA 1024", "PH 1110",
        "WPE 1601", "CS 2303", "CS 3733", "MA 2611", "MA 2621", "RE 1731",
        "WR 2010", "BB 1025", "CS 3431", "PSY 1402", "MA 1021", "MA 1022",
        "CS 1000", "EN 1000", "PSY 1400", "BB 1025", "CS 3431", "IMGD 2000", "PSY 1402"
    ];

    const NoNoSubjects = ["Air Science", "Arabic", "Art", "Chinese", "Co-Operative Education", "Education", "English as a Second Language", "Fire Protection", "First Year", "Interdisciplinary", "Interdisciplinary - Graduate", "International Students - English", "Japanese", "Military Leadership", "Music", "Spanish", "Theatre", "Wellness and Physical Education"]

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
            .then(response => {
                // Sort subjects alphabetically
                const sortedSubjects = response.data.subject.sort((a, b) => a.localeCompare(b));
                setFilterOptions(prevOptions => ({
                    ...prevOptions,
                    ...response.data,
                    subject: sortedSubjects
                }));
    
                // Set selectedFilters.subject to include all subjects by default
                setSelectedFilters(prevFilters => ({
                    ...prevFilters,
                    subject: sortedSubjects.filter(subject => !NoNoSubjects.includes(subject)) // Default all subjects to be checked
                }));
            })
            .catch(error => console.error('Error fetching filter options:', error));
    
        axios.get('http://127.0.0.1:5001/sections')
            .then(response => setSections(response.data))
            .catch(error => console.error('Error fetching sections:', error));
    }, []);

    const filteredCourses = useCallback(() => {
        console.log('Filtering courses');
        
        if (Object.values(selectedFilters).every(arr => arr.length === 0) && nicheCourses.length === 0) {
            return availableCourses;
        }

        return availableCourses.filter(course => {
            const courseSections = sections.filter(section => section.course_id === course.course_id);
            
            // Check for niche courses
            const isNicheExcluded = nicheCourses.some(niche => {
                return course.title.toLowerCase().includes(niche.toLowerCase());
            });

            // Skip this course if it matches any niche criteria
            if (isNicheExcluded) {
                return false;
            }

            return courseSections.some(section => (
                (selectedFilters.delivery_mode?.length === 0 || selectedFilters.delivery_mode.includes(section.delivery_mode)) &&
                (selectedFilters.offering_period?.length === 0 || selectedFilters.offering_period.includes(section.offering_period)) &&
                (selectedFilters.level?.length === 0 || selectedFilters.level.includes(course.level))
            )) &&
            (selectedFilters.subject?.length === 0 || selectedFilters.subject.some(sub => course.subjects?.includes(sub)));
        });
    }, [availableCourses, sections, selectedFilters, nicheCourses]);

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

    // const fetchCourse = (courseId) => {
    //     return axios.get(`http://127.0.0.1:5001/course/${courseId}`)
    //         .then(response => {
    //             const { course_id, title, credits, level, description } = response.data;
    //             return { course_id, title, credits, level, description };
    //         })
    //         .catch(error => {
    //             console.error('Error fetching course:', error);
    //             return null;
    //         });
    // };
    
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

    const handleFileUpload = (data) => {
        setReqList(data);
        setCurrentStep(2);
    };
    
    const handleYearSelected = (year) => {
        setSelectedYear(year);
        setCurrentStep(3);
    };

    const handleLevelChanged = (levels) => {
        setSelectedFilters(prev => ({
            ...prev,
            level: levels
        }));
    };
    
    const handleTermSelected = (term) => {
        setSelectedTerm(term);
        setSelectedFilters(prev => ({
            ...prev,
            offering_period: [term]
        }));
        setCurrentStep(4);
    };
    
    const handleDescriptionSubmitted = (desc) => {
        setDescription(desc);
        setCurrentStep(5);
    };
    
    return (
        <div className="App app-bg">
            <div className="min-h-screen flex flex-col items-center justify-center">
                    {currentStep === 1 && (
                        <div id="glass" className="w-[80vw] h-[80vh] flex items-center justify-center p-16">
                            <UploadFile handleFileUpload={handleFileUpload} className="z-10" />
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div id="glass" className="w-[80vw] h-[80vh] flex items-center justify-center p-16">
                            <SelectYear onYearSelected={handleYearSelected} onLevelChanged={handleLevelChanged} />
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div id="glass" className="w-[80vw] h-[80vh] flex items-center justify-center p-16">
                            <SelectTerm onTermSelected={handleTermSelected} termOptions={filterOptions.offering_period} />
                        </div>
                    )}
                    {currentStep === 4 && (
                        <div id="glass" className="w-[80vw] h-[80vh] flex items-center justify-center p-16">
                            <EnterDescription onDescriptionSubmitted={handleDescriptionSubmitted} />
                        </div>
                    )}
                {currentStep === 5 && (
                    <div className="flex flex-row">
                        <div id="glass" className="w-[30vw] h-[90vh] p-6 m-3">
                            <GenerateSchedules availableCourses={filteredCourses()} takenCourseIds={takenCourseIds} selectedYear={selectedYear} description={description} reqList={reqList} sections={sections} selectedFilters={selectedFilters} />
                        </div>
                        <div id="glass" className="w-[65vw] h-[90vh] p-6 m-3 flex">
                            <div id="bento-grid">
                                <div className="left-stack">
                                    <SearchCourses
                                        all_courses={all_courses}
                                        takenCourses={takenCourses}
                                        addTakenCourse={addTakenCourse}
                                        removeTakenCourse={removeTakenCourse}
                                    />
                                </div>

                                <div className="middle-stack">
                                    <div className="item">
                                        <AvailableCourses
                                            availableCourses={filteredCourses()}
                                            // fetchCourse={fetchCourse()}
                                        />
                                    </div>
                                    <div className="item">
                                        <RemoveNicheCourses 
                                            setNicheCourses={setNicheCourses}
                                        />
                                    </div>
                                    <div className="item">
                                        <DescriptionBox description={description} setDescription={setDescription} />
                                    </div>
                                </div>

                                <div className="right-stack">
                                    {Object.entries(filterOptions).map(([category, options]) => (
                                        <div className="item" key={category}>
                                            <h2 className="font-bold">{category.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase())}</h2>
                                            <div className="scrollable-content">
                                                <FilterOptions
                                                    category={category}
                                                    options={options}
                                                    selectedFilters={selectedFilters}
                                                    handleFilterChange={handleFilterChange}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
    }
    
    export default App;