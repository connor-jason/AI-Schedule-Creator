from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, distinct
from sqlalchemy.orm import sessionmaker
from models import Base, CourseSubject, School, Department, Course, Section, PrerequisiteGroup, Prerequisite, SameCredit, Subject

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}}) 

# Database setup
DATABASE_URL = 'sqlite:///WPI_COURSE_LISTINGS.db'
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

def filter_courses_by_prerequisites(courses, my_prerequisites):
    """
    Filter out courses that do not meet their prerequisite groups.

    Parameters:
    - courses: List of Course objects to check
    - my_prerequisites: List of course IDs and/or prerequisites that the user has

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

def remove_same_credit_courses(courses, my_prerequisites):
    """
    Remove courses that have the same credit as any of the courses in my_prerequisites.

    Parameters:
    - courses: List of Course objects to check
    - my_prerequisites: List of course IDs for prerequisites taken

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
    courses = session.query(Course).all()
    data = []
    for course in courses:
        course_data = course.__dict__
        course_data.pop('_sa_instance_state', None)
        course_data['subjects'] = [cs.subject.name for cs in session.query(CourseSubject).filter_by(course_id=course.course_id).join(Subject).all()]
        data.append(course_data)
    
    return jsonify(data)


connor = ["CS 1102", "CS 2103", "INTL 2100", "MA 1023", "MA 1024", "PH 1110", 
                   "WPE 1601", "CS 2303", "CS 3733", "MA 2611", "MA 2621", "RE 1731", 
                   "WR 2010", "BB 1025", "CS 3431", "PSY 1402", "MA 1021", "MA 1022", 
                   "CS 1000", "EN 1000", "PSY 1400", "BB 1025", "CS 3431", "IMGD 2000", "PSY 1402"]
@app.route('/filtered_courses/<my_prerequisites>', methods=['GET'])
def get_filtered_courses(my_prerequisites):
    all_courses = session.query(Section).all()
    all_courses = filter_courses_by_prerequisites(all_courses, my_prerequisites)
    all_courses = remove_same_credit_courses(all_courses, my_prerequisites)
    
    data = [course.__dict__ for course in all_courses]
    for item in data:
        item.pop('_sa_instance_state', None)
    
    return jsonify(data)

@app.route('/course/<course_id>', methods=['GET'])
def get_course(course_id):
    course = session.query(Course).filter_by(course_id=course_id).first()
    if course:
        data = course.__dict__
        data.pop('_sa_instance_state', None)
        return jsonify(data)
    return jsonify({'error': 'Course not found'}), 404

@app.route('/sections', methods=['GET'])
def get_sections():
    sections = session.query(Section).all()
    data = [section.__dict__ for section in sections]
    for item in data:
        item.pop('_sa_instance_state', None)
    return jsonify(data)

@app.route('/filter-options', methods=['GET'])
def get_filter_options():
    filters = {
        "delivery_mode": [row[0] for row in session.query(distinct(Section.delivery_mode)).all() if row[0]],
        "offering_period": [row[0] for row in session.query(distinct(Section.offering_period)).all() if row[0]],
        "subject": [row[0] for row in session.query(distinct(Subject.name)).join(CourseSubject).join(Course).all() if row[0]]
    }
    return jsonify(filters)

if __name__ == '__main__':
    app.run(debug=True)
