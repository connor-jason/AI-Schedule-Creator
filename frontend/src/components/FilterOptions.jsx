import React from 'react';

function FilterOptions({ category, options, selectedFilters, handleFilterChange }) {

    if (!category){
        return null;
    }

    return (
        <div>
            <h2>{category.replace('_', ' ').toUpperCase()}</h2>
            {options.map(value => (
                <div key={value}>
                    <input
                        type="checkbox"
                        id={`${category}-${value}`}
                        name={category}
                        value={value}
                        checked={selectedFilters[category]?.includes(value)}
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
    );
}

export default FilterOptions;