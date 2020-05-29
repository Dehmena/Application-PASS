from flask import Flask
from flask_cors import CORS

from application.utils.scheduler.scheduler import init_schedule


def create_app():
    """Initialize the core application."""
    app = Flask(__name__, instance_relative_config=False)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dbfile.sqlite'
    # app.config.from_object('config.Config')

    CORS(app)

    register_extensions(app)
    register_blueprints(app)

    init_schedule()

    return app


def register_extensions(app):
    from application.extensions import db

    db.app = app
    db.init_app(app)

    with app.app_context():
        db.create_all()


def register_blueprints(app):
    from application.routes.pdf_processing import pdf_processing
    from application.routes.config_manager import config_manager
    from application.routes.csv_operations import csv_operations
    from application.routes.database.quote import database_quote
    from application.routes.database.order import database_order
    from application.routes.database.invoice import database_invoice
    from application.routes.database.client import database_client
    from application.routes.database.log import database_log

    app.register_blueprint(pdf_processing)
    app.register_blueprint(config_manager)
    app.register_blueprint(csv_operations)
    app.register_blueprint(database_quote)
    app.register_blueprint(database_order)
    app.register_blueprint(database_invoice)
    app.register_blueprint(database_client)
    app.register_blueprint(database_log)
