from sqlalchemy import Column, String, Float, Date, Time, ForeignKey, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

Base = declarative_base()

class School(Base):
    __tablename__ = 'schools'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    courses = relationship("Course", back_populates="school")


class Department(Base):
    __tablename__ = 'departments'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    courses = relationship("Course", back_populates="department")


class Course(Base):
    __tablename__ = 'courses'
    
    course_id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    credits = Column(Float)
    level = Column(String)
    description = Column(String)
    department_id = Column(Integer, ForeignKey('departments.id'), nullable=False)
    school_id = Column(Integer, ForeignKey('schools.id'), nullable=False)

    department = relationship("Department", back_populates="courses")
    school = relationship("School", back_populates="courses")
    sections = relationship("Section", back_populates="course")
    prerequisites = relationship("PrerequisiteGroup", back_populates="course")
    same_credits = relationship("SameCredit", back_populates="course")
    subjects = relationship("CourseSubject", back_populates="course")


class Section(Base):
    __tablename__ = 'sections'
    
    id = Column(Integer, primary_key=True, autoincrement=True)  
    section_id = Column(String)  # Unique identifier for the section (e.g., "PSY 4400-A01")
    course_id = Column(String, ForeignKey('courses.course_id'), nullable=False)  # Link to course
    offering_period = Column(String)  # The term in which the section is offered (e.g., "2024 Fall A Term")
    section_status = Column(String)  # Status of the section (e.g., "Open")
    enrolled_capacity = Column(Integer)  # Enrolled capacity for the section
    waitlist_capacity = Column(Integer)  # Waitlist capacity for the section
    delivery_mode = Column(String)  # Mode of delivery (e.g., "In-Person")
    location = Column(String)  # Where the section is held
    start_date = Column(Date)  # Start date of the section
    end_date = Column(Date)  # End date of the section
    meeting_patterns = Column(String)  # Class meeting patterns (e.g., "M-R | 1:00 PM - 2:50 PM")
    instructor = Column(String)  # Instructor for the section

    course = relationship("Course", back_populates="sections")


class Subject(Base):
    __tablename__ = 'subjects'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    courses = relationship("CourseSubject", back_populates="subject")


class CourseSubject(Base):
    __tablename__ = 'course_subjects'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(String, ForeignKey('courses.course_id'), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)
    
    course = relationship("Course", back_populates="subjects")
    subject = relationship("Subject", back_populates="courses")


class PrerequisiteGroup(Base):
    __tablename__ = 'prerequisite_groups'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_course_id = Column(String, ForeignKey('courses.course_id'), nullable=False)  # Link to parent course
    prerequisites = relationship("Prerequisite", back_populates="prerequisite_group")  # Link to Prerequisite

    course = relationship("Course", back_populates="prerequisites")


class Prerequisite(Base):
    __tablename__ = 'prerequisites'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    group_id = Column(Integer, ForeignKey('prerequisite_groups.id'), nullable=False)  # Link to prerequisite group
    course_id = Column(String, nullable=False)  # Course required as a prerequisite

    prerequisite_group = relationship("PrerequisiteGroup", back_populates="prerequisites")  # Link back to PrerequisiteGroup


class SameCredit(Base):
    __tablename__ = 'same_credits'

    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_course_id = Column(String, ForeignKey('courses.course_id'), nullable=False)  # Link to parent course
    course_id = Column(String, nullable=False)  # Course considered for same credit

    course = relationship('Course', back_populates='same_credits')

# Database connection
DATABASE_URL = 'sqlite:///WPI_COURSE_LISTINGS.db'
engine = create_engine(DATABASE_URL)

# Create all tables in the database
Base.metadata.create_all(engine)

# Create a session
Session = sessionmaker(bind=engine)
session = Session()
