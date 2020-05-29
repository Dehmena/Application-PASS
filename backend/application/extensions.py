from flask_sqlalchemy import SQLAlchemy
from apscheduler.schedulers.background import BackgroundScheduler

db = SQLAlchemy()
quote_reminder_scheduler = BackgroundScheduler()
quote_cancellation_scheduler = BackgroundScheduler()
backup_scheduler = BackgroundScheduler()
