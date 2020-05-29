from application.extensions import db
from application.database.models import OrderTable


"""     INSERTION QUERY      """


def insert_order(number, date, total_amount, client_number, quote_number):
    if quote_number == "":
        quote_number = None

    new_order = OrderTable(orderNumber=number,
                           orderDate=date,
                           orderTotalAmount=total_amount,
                           clientNumber=client_number,
                           quoteNumber=quote_number)
    db.session.add(new_order)
    db.session.commit()


def bulk_insert_orders(list_orders):
    db.session.bulk_insert_mappings(OrderTable, list_orders)
    db.session.commit()


"""     GET QUERIES      """


def get_all_orders():
    return OrderTable.query.all()


def get_orders(sort_field, sort_order, number_of_results, offset=0):
    field = OrderTable.get_field_from_name(sort_field)

    current_query = OrderTable.query
    current_query = sort_query_field_order(current_query, field, sort_order)

    return current_query.limit(number_of_results).offset(offset)


def get_order_by_number(order_number):
    return OrderTable.query.filter_by(orderNumber=order_number).first()


def get_order_by_id(id_order):
    return OrderTable.query.filter_by(idOrder=id_order).first()


def get_client_orders_by_number(client_number):
    return OrderTable.query.filter_by(clientNumber=client_number).all()  # Return Type : List of OrderTable


def get_order_count():
    return OrderTable.query.count()


"""     UPDATE QUERY    """


def update_order(order, order_number, date, total_amount, quote_number, client_number):
    order.orderNumber = order_number
    order.orderDate = date
    order.orderTotalAmount = total_amount

    order.clientNumber = client_number

    if quote_number == "":
        quote_number = None

    order.quoteNumber = quote_number

    db.session.commit()


"""     DELETE QUERY    """


def delete_order(order):
    db.session.delete(order)
    db.session.commit()


def delete_all_orders():
    db.session.query(OrderTable).delete()
    db.session.commit()


"""     EXIST QUERY    """


def order_exist_by_number(order_number):
    return get_order_by_number(order_number) is not None


"""     SORT A QUERY BY FIELD    """


def sort_query_field_order(query, sort_field, sort_order):
    if sort_order == "asc":
        query = query.order_by(sort_field.asc())
    if sort_order == "desc":
        query = query.order_by(sort_field.desc())

    return query
