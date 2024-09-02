import React from 'react';

const DescriptionBox = ({ description, setDescription }) => {
    return (
        <div>
            <h1 className="font-bold">Description</h1>
            <textarea 
                type="text-area" 
                className="scrollable-content h-[15vh] w-full resize-none"
                defaultValue={description} 
                placeholder="Enter a description..."
                onChange={(e) => setDescription(e.target.value)}
            />
        </div>
    );
};

export default DescriptionBox;
