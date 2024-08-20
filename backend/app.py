import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine, distinct
from sqlalchemy.orm import sessionmaker, scoped_session
from functions_for_api import filter_courses_by_prerequisites, generate_valid_combinations, get_course_subject, remove_same_credit_courses
from models import Base, CourseSubject, Course, Section, Subject

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}}) 

# Database setup
DATABASE_URL = 'sqlite:///WPI_COURSE_LISTINGS.db'
engine = create_engine(DATABASE_URL)
Session = scoped_session(sessionmaker(bind=engine))

@app.route('/all_courses', methods=['GET'])
def get_courses():
    session = Session()
    try:
        courses = session.query(Course).all()
        data = []
        for course in courses:
            course_data = course.__dict__.copy()
            course_data.pop('_sa_instance_state', None)
            course_data['subjects'] = [cs.subject.name for cs in session.query(CourseSubject).filter_by(course_id=course.course_id).join(Subject).all()]
            data.append(course_data)
        
        return jsonify(data)
    finally:
        Session.remove()

@app.route('/filtered_courses/<my_prerequisites>', methods=['GET'])
def get_filtered_courses(my_prerequisites):
    session = Session()
    try:
        prerequisite_course_ids = my_prerequisites.split(',')
        
        all_courses = session.query(Course).all()
        filtered_courses = filter_courses_by_prerequisites(all_courses, prerequisite_course_ids, session)
        filtered_courses = remove_same_credit_courses(filtered_courses, prerequisite_course_ids, session)
        
        data = []
        for course in filtered_courses:
            course_data = {
                'course_id': course.course_id,
                'title': course.title,
                'credits': course.credits,
                'level': course.level,
                'description': course.description,
                'subjects': [cs.subject.name for cs in session.query(CourseSubject).filter_by(course_id=course.course_id).join(Subject).all()]
            }
            data.append(course_data)
        
        return jsonify(data)
    finally:
        Session.remove()


@app.route('/course/<course_id>', methods=['GET'])
def get_course(course_id):
    session = Session()
    try:
        course = session.query(Course).filter_by(course_id=course_id).first()
        if course:
            data = course.__dict__.copy()
            data.pop('_sa_instance_state', None)
            return jsonify(data)
        return jsonify({'error': 'Course not found'}), 404
    finally:
        Session.remove()

@app.route('/sections', methods=['GET'])
def get_sections():
    session = Session()
    try:
        sections = session.query(Section).all()
        data = [section.__dict__.copy() for section in sections]
        for item in data:
            item.pop('_sa_instance_state', None)
        return jsonify(data)
    finally:
        Session.remove()

@app.route('/filter-options', methods=['GET'])
def get_filter_options():
    session = Session()
    try:
        filters = {
            "delivery_mode": [row[0] for row in session.query(distinct(Section.delivery_mode)).all() if row[0]],
            "offering_period": [row[0] for row in session.query(distinct(Section.offering_period)).all() if row[0]],
            "subject": [row[0] for row in session.query(distinct(Subject.name)).join(CourseSubject).join(Course).all() if row[0]],
            "level": [row[0] for row in session.query(distinct(Course.level)).all() if row[0]]
        }
        return jsonify(filters)
    finally:
        Session.remove()

@app.route('/generate_schedules/<courses>', methods=['GET'])
def generate_schedules(courses):
    session = Session()
    try:
        course_list = courses.split(',')
        sections = session.query(Section).filter(Section.course_id.in_(course_list)).filter(Section.section_id.notlike('%Interest%')).filter(Section.course_id.notlike('%X%')).all()
        
        # Generate schedules with 3 courses, prioritizing different subjects
        schedules = generate_valid_combinations(sections, combination_size=3, session=session)

        # Convert schedules and sections to serializable format
        def section_to_dict(section):
            return {
                'course_id': section.course_id,
                'section_id': section.section_id,
                'meeting_patterns': section.meeting_patterns,
                'instructional_format': section.instructional_format,
                'cluster_id': section.cluster_id,
                'subject': get_course_subject(section.course_id, session)
            }
        
        # Convert each schedule to a dictionary
        schedules_data = []
        for schedule in schedules:
            schedule_data = []
            for section in schedule:
                schedule_data.append(section_to_dict(section))
            schedules_data.append(schedule_data)

        return jsonify(schedules_data)
    finally:
        Session.remove()
        
# Ensure the upload folder exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if the request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # If user does not select a file, the browser also submits an empty part without filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # ensure its a xlsx file
    if file and file.filename.endswith('.xlsx'):
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        return jsonify({'message': 'File successfully uploaded'}), 200
    
    return jsonify({'error': 'File type not allowed'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001)
