""" All the routes for database operations related to the Quotes.

cf. Section IV in Documentation backend routes
"""

import application.database.queries.quote as query
import application.database.queries.log as query_log

from flask import Blueprint, jsonify, request
from application.utils.tools import list_table_to_dict, convert_date_string_to_datetime
from config import Config
from application.utils.data.quote import Quote

import json

database_quote = Blueprint('database_quote', __name__)


@database_quote.route("/quotes", methods=['GET'])
def quotes():
    number_of_results = request.args.get("number_of_results", default=1000, type=int)
    offset = request.args.get("offset", default=0, type=int)

    sort_field = request.args.get("sort_field", default="quoteNumber", type=str)
    sort_order = request.args.get("sort_order", default="desc", type=str)

    number_of_quotes = query.get_quote_count()
    list_quotes = query.get_quotes(sort_field, sort_order, number_of_results, offset)

    response = {
        "totalDataCount": number_of_quotes,
        "link": {
            "first": {
                "href": Config.URL + "/quotes?number_of_results=" + str(number_of_results)
                        + "&offset=0"
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "quotes",
                "type": "GET"
            },
            "prev": {
                "href": Config.URL + "/quotes?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "quotes",
                "type": "GET"
            },
            "next": {
                "href": Config.URL + "/quotes?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset + number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "quotes",
                "type": "GET"
            },
            "last": {
                "href": Config.URL + "/quotes?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(number_of_quotes - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "quotes",
                "type": "GET"
            }

        },
        "data": list_table_to_dict(list_quotes)
    }

    resp = jsonify(response)
    resp.status_code = 200

    return resp


@database_quote.route("/quote/<quote_number>", methods=['GET'])
def quote_by_number(quote_number):
    quote = query.get_quote_by_number(quote_number)

    if quote is None:
        return "No quote has been found with this number", 404

    resp = jsonify(quote.to_dict())
    resp.status_code = 200

    return resp


@database_quote.route("/quotes/<quote_state>", methods=['GET'])
def quote_by_state(quote_state):
    number_of_results = request.args.get("number_of_results", default=1000, type=int)
    offset = request.args.get("offset", default=0, type=int)

    sort_field = request.args.get("sort_field", default="quoteNumber", type=str)
    sort_order = request.args.get("sort_order", default="desc", type=str)

    number_of_quotes = query.get_quote_count_by_state(quote_state)
    list_quotes = query.get_quote_by_state(quote_state, sort_field, sort_order, number_of_results, offset)

    response = {
        "totalDataCount": number_of_quotes,
        "link": {
            "first": {
                "href": Config.URL + "/quotes/" + quote_state + "?number_of_results=" + str(number_of_results)
                        + "&offset=0"
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "quotes",
                "type": "GET"
            },
            "prev": {
                "href": Config.URL + "/quotes/" + quote_state + "?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "quotes",
                "type": "GET"
            },
            "next": {
                "href": Config.URL + "/quotes/" + quote_state + "?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset + number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "quotes",
                "type": "GET"
            },
            "last": {
                "href": Config.URL + "/quotes/" + quote_state + "?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(number_of_quotes - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "quotes",
                "type": "GET"
            }

        },
        "data": list_table_to_dict(list_quotes)
    }

    resp = jsonify(response)
    resp.status_code = 200

    return resp


@database_quote.route("/quotes", methods=['POST'])
def insert_quote():
    data = json.loads(request.form['data'])

    data["quoteDate"] = convert_date_string_to_datetime(data["quoteDate"])

    if query.quote_exist_by_number(data['quoteNumber']):
        return "This quote number already exists", 400

    query.insert_quote(data['quoteNumber'],
                       data["quoteDate"],
                       data["quoteTotalAmount"],
                       data["clientNumber"])

    query_log.insert_log('Un nouveau devis ' + str(data['quoteNumber']) +
                         ' a été inséré manuellement dans la base de données', 'database')

    resp = jsonify({"success": True})
    resp.status_code = 201

    return resp


@database_quote.route("/quote/<id_quote>", methods=['PUT'])
def update_quote(id_quote):
    data = json.loads(request.form['data'])

    data["quoteDate"] = convert_date_string_to_datetime(data["quoteDate"])

    quote = query.get_quote_by_id(id_quote)

    if quote is None:
        return "Quote not found", 404

    if quote.quoteNumber != data['quoteNumber']:
        if query.quote_exist_by_number(data['quoteNumber']):
            return "This quote number already exists", 400

    old_quote_state = quote.quoteState
    quote_pdf_name = quote.quotePdfName

    query.update_quote(quote,
                       data['quoteNumber'],
                       data["quoteDate"],
                       data["quoteTotalAmount"],
                       data["quoteState"],
                       data["clientNumber"])

    if old_quote_state == 'waiting' and (data["quoteState"] == 'validated' or data["quoteState"] == 'cancelled'):
        Quote.delete_quote_pdf_file_reminder(quote_pdf_name, data['quoteState'])

    query_log.insert_log('Le devis ' + str(data['quoteNumber']) + ' a été mis à jour', 'database')

    resp = jsonify({"success": True})
    resp.status_code = 200

    return resp


@database_quote.route("/quote/<id_quote>", methods=['DELETE'])
def delete_quote(id_quote):
    quote = query.get_quote_by_id(id_quote)

    if quote is None:
        return "Quote not found", 404

    quote_number = quote.quoteNumber

    query.delete_quote(quote)

    query_log.insert_log('Le devis ' + str(quote_number) + ' a été supprimé', 'database')

    resp = jsonify({"success": True})
    resp.status_code = 200

    return resp
