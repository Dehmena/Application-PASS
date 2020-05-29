from application.extensions import db
from application.database.models import LogTable
from application.utils.tools import get_config_dict


"""     INSERTION QUERY      """


def insert_log(message, type_log, error=False):
    config = get_config_dict()
    max_number_of_logs = config['other_parameters']['max_number_of_logs']

    number_of_logs = get_log_count()

    while number_of_logs >= max_number_of_logs:
        delete_oldest_log()
        number_of_logs = number_of_logs - 1

    new_log = LogTable(message=message, typeLog=type_log, error=error)
    db.session.add(new_log)
    db.session.commit()


"""     GET QUERY      """


def get_all_logs():
    return LogTable.query.all()  # Return Type : List of LogTable


def get_log_count():
    return LogTable.query.count()


"""     DELETE QUERIES    """


def delete_oldest_log():
    oldest_log = LogTable.query.first()

    db.session.delete(oldest_log)
    db.session.commit()
