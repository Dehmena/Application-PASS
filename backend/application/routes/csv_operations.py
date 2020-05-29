""" All the routes for exporting and importing CSV file.

cf. Section VIII in Documentation backend routes
"""

from flask import Blueprint, jsonify, request, Response
import application.utils.csv_operations.quote as quote_csv_operation
import application.utils.csv_operations.order as order_csv_operation
import application.utils.csv_operations.invoice as invoice_csv_operation
import application.utils.csv_operations.client as client_csv_operation

import json

csv_operations = Blueprint('csv_operations', __name__)


@csv_operations.route('/csv/<data_type>', methods=['GET'])
def download_quotes_csv(data_type):
    try:
        if data_type == 'quote':
            csv_data = quote_csv_operation.export_data_csv()

        elif data_type == 'order':
            csv_data = order_csv_operation.export_data_csv()

        elif data_type == 'invoice':
            csv_data = invoice_csv_operation.export_data_csv()

        elif data_type == 'client':
            csv_data = client_csv_operation.export_data_csv()
        else:
            return 'Data type not recognized. The data type must be quote, order, invoice or client', 400

        return Response(csv_data,
                        mimetype="text/csv",
                        headers={"Content-Disposition": "attachment"})

    except Exception as e:
        print(e)
        return 'An error occurred when building the csv file', 500


@csv_operations.route('/csv/<data_type>', methods=['POST'])
def process_csv(data_type):
    data = json.loads(request.form['data'])
    csv_file = request.files['csv']
    csv_data = csv_file.read().decode('utf-8')

    if data_type == 'quote':
        result = quote_csv_operation.process_csv(csv_data, data['keepDatabase'])

    elif data_type == 'order':
        result = order_csv_operation.process_csv(csv_data, data['keepDatabase'])

    elif data_type == 'invoice':
        result = invoice_csv_operation.process_csv(csv_data, data['keepDatabase'])

    elif data_type == 'client':
        result = client_csv_operation.process_csv(csv_data, data['keepDatabase'])
    else:
        return {
                   'code': 2,
                   'message': 'Data type not recognized. The data type must be quote, order, invoice or client'
               }, 400

    data = result[0]
    has_error = result[1]
    resp = jsonify(data)

    if has_error:
        resp.status_code = 400
    else:
        resp.status_code = 200

    return resp


@csv_operations.route('/csv/<data_type>', methods=['PUT'])
def import_data(data_type):
    data = json.loads(request.form['data'])

    data_to_insert = data['dataToInsert']
    data_to_update = data['dataToUpdate']
    keep_database = data['keepDatabase']

    if data_type == 'quote':
        quote_csv_operation.import_data_csv(data_to_insert, data_to_update, keep_database)

    elif data_type == 'order':
        order_csv_operation.import_data_csv(data_to_insert, data_to_update, keep_database)

    elif data_type == 'invoice':
        invoice_csv_operation.import_data_csv(data_to_insert, data_to_update, keep_database)

    elif data_type == 'client':
        client_csv_operation.import_data_csv(data_to_insert, data_to_update, keep_database)

    else:
        return 'Data type not recognized. The data type must be quote, order, invoice or client', 400

    resp = jsonify({"success": True})
    resp.status_code = 200

    return resp
