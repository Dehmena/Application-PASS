""" The route for database operation related to the Logs.

cf. Section VI in Documentation backend routes
"""

import application.database.queries.log as query

from flask import Blueprint, jsonify
from application.utils.tools import list_table_to_dict

database_log = Blueprint('database_log', __name__)


@database_log.route("/logs", methods=['GET'])
def logs():
    list_logs = query.get_all_logs()

    resp = jsonify(list_table_to_dict(list_logs))
    resp.status_code = 200

    return resp
