from application.extensions import db
from application.database.models import ClientTable


"""     INSERTION QUERY      """


def insert_client(name, email, number):
    new_client = ClientTable(clientName=name,
                             mailAddress=email,
                             clientNumber=number)
    db.session.add(new_client)
    db.session.commit()


def bulk_insert_clients(list_clients):
    db.session.bulk_insert_mappings(ClientTable, list_clients)
    db.session.commit()


"""     GET QUERIES      """


def get_all_clients():
    return ClientTable.query.all()


def get_clients(sort_field, sort_order, number_of_results, offset=0):
    field = ClientTable.get_field_from_name(sort_field)

    current_query = ClientTable.query
    current_query = sort_query_field_order(current_query, field, sort_order)

    return current_query.limit(number_of_results).offset(offset)


def get_client_by_number(client_number):  # Return Type : ClientTable
    return ClientTable.query.filter_by(clientNumber=client_number).first()


def get_client_by_id(id_client):  # Return Type : ClientTable
    return ClientTable.query.filter_by(idClient=id_client).first()


def get_client_by_name(client_name, sort_field, sort_order, number_of_results, offset=0):
    field = ClientTable.get_field_from_name(sort_field)

    current_query = ClientTable.query.filter(ClientTable.clientName.contains(client_name))
    current_query = sort_query_field_order(current_query, field, sort_order)

    return current_query.limit(number_of_results).offset(offset)


def get_client_count():
    return ClientTable.query.count()


def get_client_count_by_name(client_name):
    return ClientTable.query.filter(ClientTable.clientName.contains(client_name)).count()


"""     UPDATE QUERIES    """


def update_client(client, client_number, client_name, mail_address):
    client.clientNumber = client_number
    client.mailAddress = mail_address
    client.clientName = client_name

    db.session.commit()


"""     DELETE QUERY    """


def delete_client(client):
    db.session.delete(client)
    db.session.commit()


def delete_all_clients():
    db.session.query(ClientTable).delete()
    db.session.commit()


"""     EXIST QUERIES    """


def client_exist_by_number(client_number):  # Does a client exist ? Return Type : Boolean
    return ClientTable.query.filter_by(clientNumber=client_number).first() is not None


"""     SORT A QUERY BY FIELD    """


def sort_query_field_order(query, sort_field, sort_order):
    if sort_order == "asc":
        query = query.order_by(sort_field.asc())
    if sort_order == "desc":
        query = query.order_by(sort_field.desc())

    return query
