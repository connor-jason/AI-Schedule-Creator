# AI-Powered Course Schedule Generator for WPI Students

## Overview

This project is a proof of concept for an AI-powered course schedule generation system designed for students at Worcester Polytechnic Institute (WPI). The system aims to simplify the course selection process by leveraging artificial intelligence to create personalized course schedules based on a student's academic history, preferences, and degree requirements.

## Features

- Upload academic progress files (.xlsx format)
- Select academic year and term
- Provide personalized course descriptions
- Filter courses based on various criteria (delivery mode, offering period, subject, etc.)
- Generate AI-recommended course schedules
- View detailed information about recommended courses and schedules

## Technology Stack

### Backend
- Python
- Flask
- SQLAlchemy
- OpenAI API

### Frontend
- React
- Axios for API calls

### Database
- SQLite

## Setup and Installation

1. Clone the repository
2. Set up the backend:
   ```
   cd backend
   pip install -r requirements.txt
   python setup_db.py
   python db_fill.py
   ```
3. Set up the frontend:
   ```
   cd frontend
   npm install
   ```
4. Start the backend server:
   ```
   python app.py
   ```
5. Start the frontend development server:
   ```
   npm start
   ```

## Usage

1. Upload your academic progress file (.xlsx format)
2. Select your academic year and term
3. Enter a description of your academic interests and goals
4. Adjust filters as needed
5. Generate and view AI-recommended course schedules
6. Explore detailed information about recommended courses and schedules

## Future Improvements

- Integration with WPI's official course registration system
- Enhanced AI model for more accurate and personalized recommendations
- Mobile app development for increased accessibility
- Collaborative features for group schedule planning

## Disclaimer

This project is a proof of concept and is not officially affiliated with or endorsed by Worcester Polytechnic Institute. The generated schedules should be reviewed and approved by academic advisors before registration.
