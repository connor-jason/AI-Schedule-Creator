from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, School, Department, Course, Section, PrerequisiteGroup, Prerequisite, SameCredit

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE_URL = 'sqlite:///WPI_COURSE_LISTINGS.db'
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

@app.route('/courses', methods=['GET'])
def get_courses():
    courses = session.query(Course).all()
    data = [course.__dict__ for course in courses]
    for item in data:
        item.pop('_sa_instance_state', None)  # Remove SQLAlchemy state
    return jsonify(data)

@app.route('/course/<course_id>', methods=['GET'])
def get_course(course_id):
    course = session.query(Course).filter_by(course_id=course_id).first()
    if course:
        data = course.__dict__
        data.pop('_sa_instance_state', None)  # Remove SQLAlchemy state
        return jsonify(data)
    return jsonify({'error': 'Course not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
