import React from 'react';

function FilterOptions({ filterOptions, selectedFilters, handleFilterChange }) {
    return (
        <div>
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
    );
}

export default FilterOptions;
