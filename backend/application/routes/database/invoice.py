""" All the routes for database operations related to the Invoices.

cf. Section II in Documentation backend routes
"""

import application.database.queries.invoice as query
import application.database.queries.log as query_log

from flask import Blueprint, jsonify, request
from application.utils.tools import list_table_to_dict, convert_date_string_to_datetime
from config import Config

import json

database_invoice = Blueprint('database_invoice', __name__)


@database_invoice.route("/invoices", methods=['GET'])
def invoices():
    number_of_results = request.args.get("number_of_results", default=1000, type=int)
    offset = request.args.get("offset", default=0, type=int)

    sort_field = request.args.get("sort_field", default="invoiceNumber", type=str)
    sort_order = request.args.get("sort_order", default="desc", type=str)

    number_of_invoices = query.get_invoice_count()
    list_invoices = query.get_invoices(sort_field, sort_order, number_of_results, offset)

    response = {
        "totalDataCount": number_of_invoices,
        "link": {
            "first": {
                "href": Config.URL + "/invoices?number_of_results=" + str(number_of_results)
                        + "&offset=0"
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "invoices",
                "type": "GET"
            },
            "prev": {
                "href": Config.URL + "/invoices?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "invoices",
                "type": "GET"
            },
            "next": {
                "href": Config.URL + "/invoices?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset + number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "invoices",
                "type": "GET"
            },
            "last": {
                "href": Config.URL + "/invoices?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(number_of_invoices - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "invoices",
                "type": "GET"
            }

        },
        "data": list_table_to_dict(list_invoices)
    }

    resp = jsonify(response)
    resp.status_code = 200

    return resp


@database_invoice.route("/invoice/<invoice_number>", methods=['GET'])
def invoice_by_number(invoice_number):
    invoice = query.get_invoice_by_number(invoice_number)

    if invoice is None:
        return "No invoice has been found with this number", 404

    resp = jsonify(invoice.to_dict())
    resp.status_code = 200

    return resp


@database_invoice.route("/invoices", methods=['POST'])
def insert_invoice():
    data = json.loads(request.form['data'])

    data["invoiceDate"] = convert_date_string_to_datetime(data["invoiceDate"])

    if query.invoice_exist_by_number(data['invoiceNumber']):
        return "This invoice number already exists", 400

    query.insert_invoice(data["invoiceNumber"],
                         data["invoiceDate"],
                         data["clientNumber"],
                         data["orderNumber"])

    query_log.insert_log('Une nouvelle facture ' + str(data['invoiceNumber']) +
                         ' a été insérée manuellement dans la base de données', 'database')

    resp = jsonify({"success": True})
    resp.status_code = 201

    return resp


@database_invoice.route("/invoice/<id_invoice>", methods=['PUT'])
def update_invoice(id_invoice):
    data = json.loads(request.form['data'])

    data["invoiceDate"] = convert_date_string_to_datetime(data["invoiceDate"])

    invoice = query.get_invoice_by_id(id_invoice)

    if invoice is None:
        return "Invoice not found", 404

    if invoice.invoiceNumber != data['invoiceNumber']:
        if query.invoice_exist_by_number(data['invoiceNumber']):
            return "This invoice number already exists", 400

    query.update_invoice(invoice,
                         data["invoiceNumber"],
                         data["invoiceDate"],
                         data["orderNumber"],
                         data["clientNumber"])

    query_log.insert_log('La facture ' + str(data['invoiceNumber']) + ' a été mise à jour', 'database')

    resp = jsonify({"success": True})
    resp.status_code = 200

    return resp


@database_invoice.route("/invoice/<id_invoice>", methods=['DELETE'])
def delete_invoice(id_invoice):
    invoice = query.get_invoice_by_id(id_invoice)

    if invoice is None:
        return "Invoice not found", 404

    invoice_number = invoice.invoiceNumber

    query.delete_invoice(invoice)

    query_log.insert_log('La facture ' + str(invoice_number) + ' a été supprimée', 'database')

    resp = jsonify({"success": "yes"})
    resp.status_code = 200

    return resp
