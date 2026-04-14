from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    burnout_predictions = relationship("BurnoutPrediction", back_populates="user")

class StudentProfile(Base):
    __tablename__ = 'student_profiles'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    academic_year = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="student_profile")

class BurnoutPrediction(Base):
    __tablename__ = 'burnout_predictions'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Academic
    study_hours_per_day = Column(Float, nullable=False)
    exam_pressure = Column(Float, nullable=False)
    academic_performance = Column(Float, nullable=False)
    
    # Mental
    stress_level = Column(Float, nullable=False)
    anxiety_score = Column(Float, nullable=False)
    depression_score = Column(Float, nullable=False)
    
    # Lifestyle
    sleep_hours = Column(Float, nullable=False)
    physical_activity = Column(Float, nullable=False)
    social_support = Column(Float, nullable=False)
    
    # Digital
    screen_time = Column(Float, nullable=False)
    internet_usage = Column(Float, nullable=False)
    
    # External
    financial_stress = Column(Float, nullable=False)
    family_expectation = Column(Float, nullable=False)
    
    # Calculated
    mental_health_index = Column(Float, nullable=False)
    dropout_risk = Column(Float, nullable=False)
    
    # Output
    risk_level = Column(String, nullable=False)
    prediction = Column(String, nullable=False)
    
    # Other
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="burnout_predictions")

# Database setup
DATABASE_URL = "sqlite:///./predictions.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()