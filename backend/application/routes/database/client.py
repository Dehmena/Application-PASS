""" All the routes for database operations related to the Clients.

cf. Section V in Documentation backend routes
"""

import application.database.queries.client as query
import application.database.queries.log as query_log

from flask import Blueprint, jsonify, request
from application.utils.tools import list_table_to_dict
from config import Config

import json

database_client = Blueprint('database_client', __name__)


@database_client.route("/clients", methods=['GET'])
def clients():
    number_of_results = request.args.get("number_of_results", default=1000, type=int)
    offset = request.args.get("offset", default=0, type=int)

    sort_field = request.args.get("sort_field", default="clientNumber", type=str)
    sort_order = request.args.get("sort_order", default="desc", type=str)

    number_of_clients = query.get_client_count()
    list_clients = query.get_clients(sort_field, sort_order, number_of_results, offset)

    response = {
        "totalDataCount": number_of_clients,
        "link": {
            "first": {
                "href": Config.URL + "/clients?number_of_results=" + str(number_of_results)
                        + "&offset=0"
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "clients",
                "type": "GET"
            },
            "prev": {
                "href": Config.URL + "/clients?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "clients",
                "type": "GET"
            },
            "next": {
                "href": Config.URL + "/clients?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset + number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "clients",
                "type": "GET"
            },
            "last": {
                "href": Config.URL + "/clients?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(number_of_clients - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "clients",
                "type": "GET"
            }

        },
        "data": list_table_to_dict(list_clients)
    }

    resp = jsonify(response)
    resp.status_code = 200

    return resp


@database_client.route("/client/<client_number>", methods=['GET'])
def client_by_number(client_number):
    client = query.get_client_by_number(client_number)

    if client is None:
        return "No client has been found with this number", 404

    resp = jsonify(client.to_dict())
    resp.status_code = 200

    return resp


@database_client.route("/clients/<client_name>", methods=['GET'])
def client_by_name(client_name):
    number_of_results = request.args.get("number_of_results", default=1000, type=int)
    offset = request.args.get("offset", default=0, type=int)

    sort_field = request.args.get("sort_field", default="clientNumber", type=str)
    sort_order = request.args.get("sort_order", default="desc", type=str)

    number_of_clients = query.get_client_count_by_name(client_name)
    list_clients = query.get_client_by_name(client_name, sort_field, sort_order, number_of_results, offset)

    if number_of_clients == 0:
        return "No client has been found with this name", 404

    response = {
        "totalDataCount": number_of_clients,
        "link": {
            "first": {
                "href": Config.URL + "/clients/" + client_name + "?number_of_results=" + str(number_of_results)
                        + "&offset=0"
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "clients",
                "type": "GET"
            },
            "prev": {
                "href": Config.URL + "/clients/" + client_name + "?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "clients",
                "type": "GET"
            },
            "next": {
                "href": Config.URL + "/clients/" + client_name + "?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset + number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "clients",
                "type": "GET"
            },
            "last": {
                "href": Config.URL + "/clients/" + client_name + "?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(number_of_clients - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "clients",
                "type": "GET"
            }

        },
        "data": list_table_to_dict(list_clients)
    }

    resp = jsonify(response)
    resp.status_code = 200

    return resp


@database_client.route("/clients", methods=['POST'])
def insert_client():
    data = json.loads(request.form['data'])

    if query.client_exist_by_number(data['clientNumber']):
        return "This client number already exists", 400

    query.insert_client(data["clientName"],
                        data["clientMail"],
                        data["clientNumber"])

    query_log.insert_log('Un nouveau client ' + str(data['clientNumber']) +
                         ' a été inséré manuellement dans la base de données', 'database')

    resp = jsonify({"success": True})
    resp.status_code = 201

    return resp


@database_client.route("/client/<id_client>", methods=['PUT'])
def update_client(id_client):
    data = json.loads(request.form['data'])

    client = query.get_client_by_id(id_client)

    if client is None:
        return "Client not found", 404

    if client.clientNumber != data['clientNumber']:
        if query.client_exist_by_number(data['clientNumber']):
            return "This client number already exists", 400

    query.update_client(client,
                        data["clientNumber"],
                        data["clientName"],
                        data["clientMail"])

    query_log.insert_log('Le client ' + str(data['clientNumber']) + ' a été mis à jour', 'database')

    resp = jsonify({"success": True})
    resp.status_code = 200

    return resp


@database_client.route("/client/<id_client>", methods=['DELETE'])
def delete_client(id_client):
    client = query.get_client_by_id(id_client)

    if client is None:
        return "Client not found", 404

    client_number = client.clientNumber

    query.delete_client(client)

    query_log.insert_log('Le client ' + str(client_number) + ' a été supprimé', 'database')

    resp = jsonify({"success": "yes"})
    resp.status_code = 200

    return resp
