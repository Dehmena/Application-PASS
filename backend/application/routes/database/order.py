""" All the routes for database operations related to the Orders.

cf. Section III in Documentation backend routes
"""

import application.database.queries.order as query
import application.database.queries.log as query_log

from flask import Blueprint, jsonify, request
from application.utils.tools import list_table_to_dict, convert_date_string_to_datetime
from config import Config

import json

database_order = Blueprint('database_order', __name__)


@database_order.route("/orders", methods=['GET'])
def orders():
    number_of_results = request.args.get("number_of_results", default=1000, type=int)
    offset = request.args.get("offset", default=0, type=int)

    sort_field = request.args.get("sort_field", default="orderNumber", type=str)
    sort_order = request.args.get("sort_order", default="desc", type=str)

    number_of_orders = query.get_order_count()
    list_orders = query.get_orders(sort_field, sort_order, number_of_results, offset)

    response = {
        "totalDataCount": number_of_orders,
        "link": {
            "first": {
                "href": Config.URL + "/orders?number_of_results=" + str(number_of_results)
                        + "&offset=0"
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "orders",
                "type": "GET"
            },
            "prev": {
                "href": Config.URL + "/orders?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "orders",
                "type": "GET"
            },
            "next": {
                "href": Config.URL + "/orders?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(offset + number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "orders",
                "type": "GET"
            },
            "last": {
                "href": Config.URL + "/orders?number_of_results=" + str(number_of_results)
                        + "&offset=" + str(number_of_orders - number_of_results)
                        + "&sort_field=" + sort_field
                        + "&sort_order=" + sort_order,
                "rel": "orders",
                "type": "GET"
            }

        },
        "data": list_table_to_dict(list_orders)
    }

    resp = jsonify(response)
    resp.status_code = 200

    return resp


@database_order.route("/order/<order_number>", methods=['GET'])
def order_by_number(order_number):
    order = query.get_order_by_number(order_number)

    if order is None:
        return "No order has been found with this number", 404

    resp = jsonify(order.to_dict())
    resp.status_code = 200

    return resp


@database_order.route("/orders", methods=['POST'])
def insert_order():
    data = json.loads(request.form['data'])

    data["orderDate"] = convert_date_string_to_datetime(data["orderDate"])

    if query.order_exist_by_number(data['orderNumber']):
        return "This order number already exists", 400

    query.insert_order(data["orderNumber"],
                       data["orderDate"],
                       data["orderTotalAmount"],
                       data["clientNumber"],
                       data["quoteNumber"])

    query_log.insert_log('Une nouvelle commande ' + str(data['orderNumber']) +
                         ' a été insérée manuellement dans la base de données', 'database')

    resp = jsonify({"success": True})
    resp.status_code = 200

    return resp


@database_order.route("/order/<id_order>", methods=['PUT'])
def update_order(id_order):
    data = json.loads(request.form['data'])

    data["orderDate"] = convert_date_string_to_datetime(data["orderDate"])

    order = query.get_order_by_id(id_order)

    if order is None:
        return "Order not found", 404

    if order.orderNumber != data['orderNumber']:
        if query.order_exist_by_number(data['orderNumber']):
            return "This order number already exists", 400

    query.update_order(order,
                       data["orderNumber"],
                       data["orderDate"],
                       data["orderTotalAmount"],
                       data["quoteNumber"],
                       data["clientNumber"])

    query_log.insert_log('La commande ' + str(data['orderNumber']) + ' a été mise à jour', 'database')

    resp = jsonify({"success": True})
    resp.status_code = 201

    return resp


@database_order.route("/order/<id_order>", methods=['DELETE'])
def delete_order(id_order):
    order = query.get_order_by_id(id_order)

    if order is None:
        return "Order not found", 404

    order_number = order.orderNumber

    query.delete_order(order)

    query_log.insert_log('La commande ' + str(order_number) + ' a été supprimée', 'database')

    resp = jsonify({"success": "yes"})
    resp.status_code = 200

    return resp
