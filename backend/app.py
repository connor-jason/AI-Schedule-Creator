from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, distinct
from sqlalchemy.orm import sessionmaker, scoped_session
from models import Base, CourseSubject, School, Department, Course, Section, PrerequisiteGroup, Prerequisite, SameCredit, Subject

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}}) 

# Database setup
DATABASE_URL = 'sqlite:///WPI_COURSE_LISTINGS.db'
engine = create_engine(DATABASE_URL)
Session = scoped_session(sessionmaker(bind=engine))

def filter_courses_by_prerequisites(courses, my_prerequisites, session):
    """
    Filter out courses that do not meet their prerequisite groups.

    Parameters:
    - courses: List of Course objects to check
    - my_prerequisites: List of course IDs and/or prerequisites that the user has
    - session: Scoped session object

    Returns:
    - A list of Course objects that meet all prerequisite groups
    """
    filtered_courses = []

    for course in courses:
        # Check all prerequisite groups for this course
        prerequisite_groups = session.query(PrerequisiteGroup).filter(PrerequisiteGroup.parent_course_id == course.course_id).all()

        meets_all_groups = True  # Flag to check if all groups are met

        for group in prerequisite_groups:
            # Get all prerequisites for the current group
            prerequisites = [prerequisite.course_id for prerequisite in group.prerequisites if prerequisite.course_id]

            # Check if the group contains only non-numeric words
            if all(not any(char.isdigit() for char in prerequisite) for prerequisite in prerequisites):
                # If all items in the group are non-numeric words, assume the requirement is met
                continue

            # Check if at least one prerequisite from this group is satisfied
            if not any(prerequisite in my_prerequisites for prerequisite in prerequisites):
                meets_all_groups = False
                break  # Exit loop early if one group is not met

        if meets_all_groups:
            filtered_courses.append(course)

    return filtered_courses

def remove_same_credit_courses(courses, my_prerequisites, session):
    """
    Remove courses that have the same credit as any of the courses in my_prerequisites.

    Parameters:
    - courses: List of Course objects to check
    - my_prerequisites: List of course IDs for prerequisites taken
    - session: Scoped session object

    Returns:
    - A filtered list of Course objects without courses that have the same credit as prerequisites
    """
    prerequisite_ids = set(my_prerequisites)
    filtered_courses = []

    for course in courses:
        # Retrieve courses with the same credit
        same_credit_courses = session.query(SameCredit).filter(SameCredit.parent_course_id == course.course_id).all()

        if not any(same_credit.course_id in prerequisite_ids for same_credit in same_credit_courses):
            filtered_courses.append(course)

    return filtered_courses

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
        prerequisites = session.query(Course).filter(Course.course_id.in_(my_prerequisites.split(','))).all()
        
        all_courses = session.query(Course).all()
        all_courses = filter_courses_by_prerequisites(all_courses, prerequisites, session)
        all_courses = remove_same_credit_courses(all_courses, prerequisites, session)
        
        data = []
        for course in all_courses:
            course_data = course.__dict__.copy()
            course_data.pop('_sa_instance_state', None)
            course_data['subjects'] = [cs.subject.name for cs in session.query(CourseSubject).filter_by(course_id=course.course_id).join(Subject).all()]
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
            "subject": [row[0] for row in session.query(distinct(Subject.name)).join(CourseSubject).join(Course).all() if row[0]]
        }
        return jsonify(filters)
    finally:
        Session.remove()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
