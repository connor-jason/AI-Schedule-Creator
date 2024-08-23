import React, { useState } from 'react';
import axios from 'axios';

const UploadFile = ({ handleFileUpload }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false); // For showing a loading state if needed

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (file && file.name.endsWith('.xlsx')) {
            const formData = new FormData();
            formData.append('file', file); // Append the file to the form data

            try {
                setLoading(true);
                const response = await axios.post('http://127.0.0.1:5001/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.status === 200) {  
                    // Assuming the API returns a dict in response.data
                    const data = JSON.stringify(response.data);

                    // Pass the API response data to the parent component
                    handleFileUpload(data);
                } else {
                    alert('File upload failed, please try again.');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('An error occurred while uploading the file.');
            } finally {
                setLoading(false); // End loading state
            }
        } else {
            setFile(null);
            alert('Please select a .xlsx file.');
        }
    };

    return (
        <div>
            <h2>Upload Academic Progress .xlsx File</h2>
            <input type="file" accept=".xlsx" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Next'}
            </button>
        </div>
    );
};

export default UploadFile;
