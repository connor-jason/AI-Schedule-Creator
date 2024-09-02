import React, { useState } from 'react';

function RemoveNicheCourses({ setNicheCourses }) {
    const [selectedNiches, setSelectedNiches] = useState(["Varsity Sports", "Club Sports"]);
    
    // Mapping from niche label to the terms to include in filtering
    const nicheMapping = {
        "Varsity Sports": ["Varsity"],
        "Club Sports": ["Club"]
    };
    
    const handleCheckboxChange = (niche) => {
        setSelectedNiches(prev => {
            // Determine which terms should be added or removed
            const terms = nicheMapping[niche];
            const newSelection = prev.includes(niche)
                ? prev.filter(item => item !== niche)
                : [...prev, niche];

            // Update the nicheCourses state with the new terms
            const updatedTerms = newSelection.flatMap(n => nicheMapping[n] || []);
            setNicheCourses(updatedTerms);
            
            return newSelection;
        });
    };

    return (
        <div>
            <h2 className="font-bold">Niche Courses</h2>
            <div className="scrollable-content">
                <ul>
                    {Object.keys(nicheMapping).map(niche => (
                        <li key={niche}>
                            <input
                                type="checkbox"
                                id={niche}
                                checked={!selectedNiches.includes(niche)}
                                onChange={() => handleCheckboxChange(niche)}
                            />
                            <label htmlFor={niche}>{niche}</label>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default RemoveNicheCourses;
