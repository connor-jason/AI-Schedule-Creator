# 🎓 SmartSchedule AI 🤖

👋 **Intro:**
- This project is a proof of concept for an AI-powered course schedule generation system for Worcester Polytechnic Institute (WPI) students
- Simplifies course selection through AI-driven personalized schedules based on academic history, preferences, and degree requirements

🛠️ **Tech Stack:**
- **Backend:**
  - Python
  - Flask
  - SQLAlchemy
  - OpenAI API
- **Frontend:**
  - React
  - Axios
- **Database:**
  - SQLite

✨ **Features:**
- Upload academic progress files (.xlsx format)
- Select academic year and term
- Provide personalized course descriptions
- Filter courses by delivery mode, offering period, subject, etc.
- Generate AI-recommended course schedules
- View detailed course and schedule information

🚦 **Setup and Installation:**
1. Clone the repository
2. Set up backend:
   ```
   cd backend
   pip install -r requirements.txt
   python setup_db.py
   python db_fill.py
   ```
3. Set up frontend:
   ```
   cd frontend
   npm install
   ```
4. Start backend server:
   ```
   python app.py
   ```
5. Start frontend:
   ```
   npm start
   ```
📝 **Usage:**
1. Upload your academic progress file (.xlsx format)
2. Select academic year and term
3. Describe your academic interests and goals
4. Adjust filters as needed
5. Generate and view AI-recommended schedules
6. Explore detailed course information

🔮 **Future Improvements:**
- Integration with WPI's official course registration system
- Enhanced AI model for better recommendations
- Mobile app development
- Collaborative group schedule planning

⚠️ **Disclaimer:**
This project is a proof of concept and is not officially affiliated with or endorsed by Worcester Polytechnic Institute. Generated schedules should be reviewed and approved by academic advisors before registration.
