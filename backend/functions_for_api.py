from datetime import datetime
from itertools import combinations, product
import re
import pandas as pd
from models import Base, CourseSubject, School, Department, Course, Section, PrerequisiteGroup, Prerequisite, SameCredit, Subject
from itertools import combinations, product
from openai import OpenAI

def remove_same_classes(courses, my_prerequisites, session): 
    """
    Remove courses that have the same title or course_id as the prerequisites.

    Parameters:
    - courses: List of Course objects to check
    - my_prerequisites: List of course IDs for prerequisites taken
    - session: Scoped session object

    Returns:
    - A filtered list of Course objects without courses that exclude prerequisites
    """
    prereqs = session.query(Course).filter(Course.course_id.in_(my_prerequisites)).all()
    filtered_courses = [course for course in courses if not any(course.course_id in prereq.course_id or course.title in prereq.title for prereq in prereqs)]

    return filtered_courses


def filter_courses_by_prerequisites(courses, my_prerequisites, session):
    """
    Filter out courses that do not meet their prerequisite groups.

    Parameters:
    - courses: List of Course objects to check
    - my_prerequisites: List of course IDs that the user has taken
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


def parse_meeting_times(meeting_patterns):
    """
    Parse meeting patterns into a list of tuples with day, start time, and end time.

    Parameters:
    - meeting_patterns: A string with meeting patterns (e.g., "W | 12:00 PM - 12:50 PM; R | 2:00 PM - 3:50 PM")

    Returns:
    - A list of tuples (day, start_time, end_time)
    """
    pattern = r"([MTWTF|S]+) \| (\d{1,2}:\d{2} (?:AM|PM)) - (\d{1,2}:\d{2} (?:AM|PM))"
    matches = re.findall(pattern, meeting_patterns)
    
    time_format = "%I:%M %p"
    
    return [(day, datetime.strptime(start_time, time_format).time(), datetime.strptime(end_time, time_format).time()) for day, start_time, end_time in matches]


def sections_interfere(section1, section2):
    """
    Check if two sections interfere with each other based on their meeting days and times.

    Parameters:
    - section1: Section object for the first section
    - section2: Section object for the second section

    Returns:
    - True if the sections interfere, False otherwise
    """
    times1 = parse_meeting_times(section1.meeting_patterns)
    times2 = parse_meeting_times(section2.meeting_patterns)
    
    days1 = set(day.strip() for day, _, _ in times1)
    days2 = set(day.strip() for day, _, _ in times2)
    
    for day1, start1, end1 in times1:
        for day2, start2, end2 in times2:
            if days1 & days2 and not (end1 <= start2 or end2 <= start1):
                return True
                
    return False


def group_sections_by_cluster(sections):
    """
    Group sections by their cluster_id.

    Parameters:
    - sections: List of Section objects

    Returns:
    - A dictionary with cluster_id as keys and lists of sections as values
    """
    clusters = {}
    for section in sections:
        if section.cluster_id and section.cluster_id != "":
            if section.cluster_id not in clusters:
                clusters[section.cluster_id] = []
            clusters[section.cluster_id].append(section)
    return clusters


def generate_valid_combinations(sections, combination_size=3, session=None):
    """
    Generate all valid combinations of sections based on their interference,
    prioritizing schedules with different subjects and including all instructional formats.

    Parameters:
    - sections: List of Section objects
    - combination_size: Number of courses in each combination (default is 3)
    - session: SQLAlchemy session

    Returns:
    - A list of valid section combinations where no two sections interfere
    """
    valid_combinations = []
    count = 0

    # Group sections by course_id and instructional_format
    course_sections = {}
    for section in sections:
        if section.course_id not in course_sections:
            course_sections[section.course_id] = {}
        if section.instructional_format not in course_sections[section.course_id]:
            course_sections[section.course_id][section.instructional_format] = []
        course_sections[section.course_id][section.instructional_format].append(section)

    # Get subject for each course
    course_subjects = {course_id: get_course_subject(course_id, session) for course_id in course_sections.keys()}

    # Generate all possible combinations of courses, sorted by subject diversity
    course_combinations = list(combinations(course_sections.keys(), combination_size))
    course_combinations.sort(key=lambda x: len(set(course_subjects[course_id] for course_id in x)), reverse=True)

    for course_combination in course_combinations:
        # For each course, generate all possible combinations of sections
        course_section_combinations = []
        for course_id in course_combination:
            course_section_combination = []
            instructional_formats = course_sections[course_id].keys()
            mode_combinations = [list(combo) for combo in product(*[
                course_sections[course_id][mode] for mode in instructional_formats
            ])]
            course_section_combination.extend(mode_combinations)
            course_section_combinations.append(course_section_combination)

        # Generate all possible combinations of sections for all courses
        for section_combination in product(*course_section_combinations):
            flat_combination = [s for sections in section_combination for s in sections]
            # Check each combination of sections for interference
            if all(not sections_interfere(flat_combination[i], flat_combination[j])
                   for i in range(len(flat_combination))
                   for j in range(i + 1, len(flat_combination))):
                valid_combinations.append(flat_combination)
                count += 1
                if count >= 100:
                    return valid_combinations

    return valid_combinations


def get_course_subject(course_id, session):
    course_subject = session.query(CourseSubject).filter_by(course_id=course_id).first()
    if course_subject:
        subject = session.query(Subject).filter_by(id=course_subject.subject_id).first()
        return subject.name if subject else None
    return None


def parse_xlsx_file(filepath):
    """
    Parse an Excel file and return a dictionary with aggregated data.

    Parameters:
    - filepath: Path to a FileStorage object from Flask

    Returns:
    - A dictionary with aggregated data from the Excel file
    """
    # Read the Excel file
    df = pd.read_excel(filepath, skiprows=7, skipfooter=1)

    df = df[df['Status'] != 'Satisfied']
    df = df.loc[~df['Requirement'].str.contains('WPI Total Credits Required', na=False)]
    df = df.loc[~df['Requirement'].str.contains('WPI Residency Requirement', na=False)]
    df = df.loc[df['Remaining'].notna()]
    df = df.drop(columns=['Grade', 'Academic Period', 'Credits', 'Registrations Used'])

    # Group by 'Requirement' and aggregate other columns
    grouped_df = df.groupby('Requirement').agg({
        'Status': lambda x: ', '.join(set(x)),
        'Remaining': lambda x: ', '.join(set(x))
    })

    # Convert DataFrame to dictionary
    result_dict = grouped_df.to_dict(orient='index')

    return result_dict

def call_openai_api(available_courses, taken_courses, selected_year, description, req_list):
    client = OpenAI(api_key="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")

    # The prompt for OpenAI API
    # prompt = f"""
    # I want you to act as a course schedule picker.
    # Based on the information about the student, including their year: [{selected_year}] and a description of what they are looking for: "{description}", analyze their list of courses they have already taken: [{taken_courses}], and choose multiple combinations of 3 classes from the list of classes they are eligible to take: {available_courses}.
    # When deciding which courses to recommend, consider the requirements they have remaining in order to complete their degree: [{req_list}]. Do not recommend courses that do not fulfill any of these requirements.
    # Recommend classes in areas the student has shown interest in and that will help them progress in their major. Prioritize schedules that offer balance, but appropriately cater to their degree requirements.
    # Avoid suggesting Varsity or Club sports unless explicitly mentioned in the description or taken in the past.
    # Please provide your recommendations with justifications for each course in the list and why they complement other classes for this specific student.
    # Important: At the end of your response, format the final output in plain dictionary format like so:
    # {{
    # 1: ["course_id_1", "course_id_2", "course_id_3"],
    # 2: ["course_id_4", "course_id_5", "course_id_6"]
    # }}
    # Do not include any additional text or explanations inside the dictionary section. The dictionary section should be machine-readable and in pure Python list format.
    # """
    # prompt = f"""
    # I want you to act as a course schedule picker.
    # Based on the information about the student, including their year: [{selected_year}] and a description of what they are looking for: "{description}", analyze their list of courses they have already taken: [{taken_courses}], to build a profile for the student.
    # Next, look at the courses they have the opportunity to take: {available_courses} and and choose multiple combinations of 3 classes from the list of classes they are eligible to take.
    # When deciding which courses to recommend, consider the requirements they have remaining in order to complete their degree: [{req_list}]. Do not recommend courses that do not fulfill any of these requirements.
    # Recommend classes in areas the student has shown interest in and that will help them progress in their major. Prioritize schedules that offer balance, but appropriately cater to their degree requirements.
    # Avoid suggesting Varsity or Club sports unless explicitly mentioned in the description or taken in the past.
    # For each schedule, list the three courses and then provide with a brief justification for why each course in the list complements each other for this specific students interests and background.
    # No yapping.
    # """
    prompt = f"""
    I want you to act as a course schedule picker.
    Based on the student's year: [{selected_year}] and their description: "{description}", analyze their taken courses: [{taken_courses}] to build a student profile.
    Next, examine the available courses: {available_courses} and suggest multiple combinations of 3 classes the student is eligible to take.
    Ensure the courses meet their remaining degree requirements: [{req_list}]. Avoid recommending Varsity or Club sports unless specified or previously taken.
    For each schedule, list the three courses and provide a **brief** justification for how they align with the student's interests and degree progress. Keep the justifications short and to the point.
    **IMPORTANT**
    Format:
    1. COURSE_CODE_1, COURSE_CODE_2, COURSE_CODE_3 - [Justification]
    2. COURSE_CODE_1, COURSE_CODE_2, COURSE_CODE_3 - [Justification]
    """

    # Send the prompt to the OpenAI API
    completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    'role': 'system',
                    'content': (
                        prompt
                    ),
                },
            ]
        )

    response = completion.choices[0].message.content

    print(response)
    
    return parse_response(response)

# Function to parse the OpenAI response into a structured format
def parse_response(response):
    schedules = []
    lines = response.split('\n')
    for line in lines:
        if line.strip():
            schedule_and_justification = line.split('-')
            if len(schedule_and_justification) == 2:
                schedule = schedule_and_justification[0].strip()
                justification = schedule_and_justification[1].strip()
                schedules.append({"schedule": schedule, "justification": justification})
    return schedules