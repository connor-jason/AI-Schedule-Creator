import json
import os
import re
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Course, Prerequisite, School, Department, PrerequisiteGroup, SameCredit, Section, Subject, CourseSubject
from openai import OpenAI
from bs4 import BeautifulSoup

# Set up the database connection
DATABASE_URL = "sqlite:///WPI_COURSE_LISTINGS.db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

print("filling that jawn")

# Load the JSON data from the file
with open('WPI_course_catalog.json', 'r') as file:
    data = json.load(file)

# Initialize OpenAI client
client = OpenAI(api_key='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')

# Function to convert string to date
def parse_date(date_string):
    if not date_string:
        return None
    try:
        return datetime.strptime(date_string, '%Y-%m-%d').date()  # Adjust format as needed
    except ValueError:
        print(f"Error parsing date: {date_string}")
        return None

def clean_same_credit(text):
    # Patterns for cleaning "same credit" information
    pattern1 = r'\b([A-Z]{2})/([A-Z]{2}) (\d{4})\b'  # AB/CD 1531
    pattern2 = r'\b[A-Z]{2} \d{4}\b'                 # AB 1531
    pattern3 = r'\b[A-Z]{2}\d{4}\b'                  # AB1531

    # Process and clean the text using the patterns
    matches1 = re.findall(pattern1, text)
    split_ids = [f"{code1} {num}" for code1, code2, num in matches1] + \
                [f"{code2} {num}" for code1, code2, num in matches1]

    matches2 = [match for match in re.findall(pattern2, text) if match not in split_ids]
    matches3 = [f"{match[:2]} {match[2:]}" for match in re.findall(pattern3, text) if match not in split_ids]

    return split_ids + matches2 + matches3

def openai_chat(message):
    # Function to interact with OpenAI API
    if not message or "none" in message.lower():
        return ''

    filename = "responses.json"
    
    # Initialize an empty dictionary to store responses
    responses = {}
    
    # Check if the file exists and read existing responses
    if os.path.exists(filename):
        try:
            with open(filename, 'r') as file:
                responses_list = json.load(file)
                for entry in responses_list:
                    responses.update(entry)  # Each entry is a dictionary
        except json.JSONDecodeError:
            print("Error decoding JSON from file")
            return ''

    # Check if the message is already in the responses
    if message in responses:
        return responses[message]

    # Call the OpenAI API
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                'role': 'system',
                'content': (
                    'I want you to act as an english summarizer. I will paste in the recommended background for different courses and I want you to summarize it to just the requirements. For example, if you are given "PH 1110, PH 1111, and PH 1112", you will respond with "PH 1110 AND PH 1111 AND PH1112". If you are given "PH 1110 or PH 1111", you will respond with "PH 1110 OR PH 1111". If you are given "PH 1110/PH 1111 and PH 1112", you will respond with "PH 1110 OR PH 1111 AND PH 1112". If you are given "None", you will respond with "". If you are given course shorthand, such as "PH/MA 1024", you will respond with "PH 1024 OR MA 1024". Never include english in your responses, only course names. If you see "basic calculus", change it to MA 1021, and "linear algebra" to MA 2071.'
                ),
            },
            {'role': 'user', 'content': message},
        ]
    )

    response = completion.choices[0].message.content

    # Write the response to the file
    response_entry = {message: response}
    try:
        if os.path.exists(filename):
            with open(filename, 'r') as file:
                existing_data = json.load(file)
                existing_data.append(response_entry)
        else:
            existing_data = [response_entry]

        with open(filename, 'w') as file:
            json.dump(existing_data, file, indent=4)
    except Exception as e:
        print(f"Error writing to file: {e}")

    return response

def parse_prerequisites(prerequisite_text):
    # Strip trailing periods and lowercase to make parsing easier
    prerequisite_text = prerequisite_text.strip('.').lower()

    # Handle "None" case
    if prerequisite_text in ["none", "None"]:
        return []

    # Replace " or " with a pipe (|) for easier splitting later
    prerequisite_text = prerequisite_text.replace(' or ', '|')
    prerequisite_text = prerequisite_text.replace('(', '').replace(')', '')

    # Split on commas and "and", preserving groups joined by "|"
    groups = re.split(r',| and ', prerequisite_text)

    # For each group, split further on "|" to create lists of alternatives
    parsed_prerequisites = [group.split('|') for group in groups]

    # Reformat the alternatives to include double quotes and correct capitalization
    reformatted_prerequisites = [[course.strip().upper() for course in group] for group in parsed_prerequisites]

    return reformatted_prerequisites

def create_or_get_subjects(subject_names):
    subjects = []
    for name in subject_names:
        subject = session.query(Subject).filter_by(name=name.strip()).first()
        if not subject:
            subject = Subject(name=name.strip())
            session.add(subject)
            session.flush()
        subjects.append(subject)
    return subjects

# Process each course entry from the JSON data
count = 1
for entry in data.get('Report_Entry', []):
    course_section = entry.get('Course_Section', '').strip()

    # Extract course ID, section, and title
    course_section_part = course_section.rsplit(' - ', 1)[0]
    course_id, section = course_section_part.split('-', 1)
    course_id = course_id.strip()
    section = section.strip()
    title = ' - '.join(entry.get('Course_Title', '').split(' - ')[1:]).strip()

    # Extract other course details
    credits = float(entry.get('Credits', 0)) if entry.get('Credits') else 0
    description = entry.get('Course_Description', '').strip()
    description = BeautifulSoup(description, "html.parser").get_text()

    # Extract recommended background
    rec_background = []
    for term in ['Recommended Background', 'Recommended background', 'recommended background', 'Suggested Background', 'Suggested background', 'suggested background']:
        if term in description:
            rec_background = description.split(term)[1].strip()
            break

    rec_background = openai_chat(rec_background)
    rec_background = parse_prerequisites(rec_background)

    # Extract same credit information
    same_credit = ''
    for term in ['Students may not', 'Students cannot', 'Students who have']:
        if term in description:
            same_credit = clean_same_credit(description.split(term)[1])
            break

    # Extract meeting pattern and times
    meeting_pattern = entry.get('Meeting_Patterns', '')
    time_pattern = r'\d{1,2}:\d{2} [AP]M'
    start_time = end_time = None
    if meeting_pattern:
        times = re.findall(time_pattern, meeting_pattern)
        if len(times) == 2:
            start_time = datetime.strptime(times[0], '%I:%M %p').time()
            end_time = datetime.strptime(times[1], '%I:%M %p').time()

    # Check if the course exists
    course = session.query(Course).filter_by(course_id=course_id).first()

    # Prepare course data for the database
    course_data = {
        'course_id': course_id,
        'title': title,
        'credits': credits,
        'level': entry.get('Academic_Level', ''),
        'description': description,
        'department_id': None,  # To be set after checking for the department
        'school_id': None,      # To be set after checking for the school
    }

    # Check if the school exists, if not create it
    school_name = "Worcester Polytechnic Institute"
    school = session.query(School).filter_by(name=school_name).first()
    if not school:
        school = School(name=school_name)
        session.add(school)
        session.commit()  # Commit to get the school ID

    # Check if the department exists, if not create it
    department_name = entry.get('Course_Section_Owner', '').strip()
    department = session.query(Department).filter_by(name=department_name).first()
    if not department:
        department = Department(name=department_name)
        session.add(department)
        session.commit()  # Commit to get the department ID

    # Extract and process subjects
    subject_string = entry.get('Subject', '')
    subject_names = [s.strip() for s in subject_string.replace(',', ';').split(';')]
    subjects = create_or_get_subjects(subject_names)

    # If the course does not exist, create it
    if not course:
        # Update course data with foreign key references
        course_data['school_id'] = school.id
        course_data['department_id'] = department.id
        course = Course(**course_data)
        session.add(course)
        session.flush()

    # Associate subjects with the course
    for subject in subjects:
        course_subject = CourseSubject(course_id=course.course_id, subject_id=subject.id)
        session.add(course_subject)

    # Create a new Section entry
    section_data = {
        'section_id': section.split(' ')[0],  # Assuming section is unique (e.g., "PSY 4400-A01")
        'course_id': course_id,
        'cluster_id': entry.get('CF_LRV_Cluster_Ref_ID', ''),
        'offering_period': entry.get('Offering_Period', ''),
        'instructional_format': entry.get('Instructional_Format', ''),
        'delivery_mode': entry.get('Delivery_Mode', ''),
        'location': entry.get('Locations', ''),
        'start_date': parse_date(entry.get('Course_Section_Start_Date', '')),
        'end_date': parse_date(entry.get('Course_Section_End_Date', '')),
        'meeting_patterns': meeting_pattern,
        'instructor': entry.get('Instructors', ''),
        'section_status': entry.get('Section_Status', ''),
        'enrolled_capacity': entry.get('Enrolled_Capacity', 0),
        'waitlist_capacity': entry.get('Waitlist_Capacity', 0),
    }
    
    # Add the section to the database
    section = Section(**section_data)
    session.add(section)

    for prerequisite_list in rec_background:
        # Create a new PrerequisiteGroup for this course
        prerequisite_group = PrerequisiteGroup(parent_course_id=course_id)
        session.add(prerequisite_group)
        session.flush()  # This will generate the group_id for the PrerequisiteGroup

        for course in prerequisite_list:
            # Add each course in the list as a Prerequisite in the group
            prerequisite = Prerequisite(group_id=prerequisite_group.id, course_id=course)
            session.add(prerequisite)
    
    session.commit()

    # Add same credit courses to the SameCredit table
    for same_credit_course in same_credit:
        same_credit_entry = SameCredit(parent_course_id=course_id, course_id=same_credit_course)
        session.add(same_credit_entry)

    # Commit same credit courses
    session.commit()

# Close the session
session.close()

print("filled that jawn")