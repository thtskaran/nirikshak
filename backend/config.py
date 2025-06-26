# config.py

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration."""
    
    # Flask settings
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')

    # Database settings
    DATABASE_URL = os.getenv('DATABASE_URL')
    DB_NAME = "nirikshak" # You can also parse this from the URL if needed

    # Ollama and Model settings
    OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL')
    RED_TEAMING_MODEL = os.getenv('RED_TEAMING_MODEL')
    RED_TEAM_EVAL_MODEL = os.getenv('RED_TEAM_EVAL_MODEL', 'llama3')  # Fixed missing variable
    SAFETY_MODEL = os.getenv('SAFETY_MODEL')

    # Red Teaming constants
    RED_TEAM_PROMPT_COUNT = 5 # Number of prompts to generate

    # S3 Configuration
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION = os.getenv("AWS_REGION", "ap-northeast-2")
    AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
    AWS_S3_BUCKET_KEY = os.getenv("AWS_S3_BUCKET_KEY", "nirikshak")

# A simple check to ensure critical configs are set
if not Config.DATABASE_URL or not Config.OLLAMA_BASE_URL:
    raise ValueError("DATABASE_URL and OLLAMA_BASE_URL must be set in the .env file.")