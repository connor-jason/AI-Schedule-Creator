from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from models import Base  # Import your models that include School and Course tables

# Use SQLite as the database
DATABASE_URL = 'sqlite:///WPI_COURSE_LISTINGS.db'

# Create a database engine
engine = create_engine(DATABASE_URL)

# Create a connection
with engine.connect() as connection:
    # Get a list of all tables in the database
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    # Disable foreign key checks (SQLite doesn't support this directly, but we can skip it)
    connection.execute(text("PRAGMA foreign_keys = OFF"))

    # Drop all tables
    for table in tables:
        connection.execute(text(f"DROP TABLE IF EXISTS {table}"))

    # Re-enable foreign key checks
    connection.execute(text("PRAGMA foreign_keys = ON"))

    # Commit the transaction
    connection.commit()

# Create all tables in the database
Base.metadata.create_all(engine)

# Create a session
Session = sessionmaker(bind=engine)
session = Session()

print("Database setup complete.")
