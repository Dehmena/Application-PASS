from application.extensions import db
from application.database.models import InvoiceTable


"""     INSERTION QUERY      """


def insert_invoice(number, date, client_number, order_number):
    new_invoice = InvoiceTable(invoiceNumber=number,
                               invoiceDate=date,
                               clientNumber=client_number,
                               orderNumber=order_number)
    db.session.add(new_invoice)
    db.session.commit()


def bulk_insert_invoices(list_invoices):
    db.session.bulk_insert_mappings(InvoiceTable, list_invoices)
    db.session.commit()


"""     GET QUERIES      """


def get_all_invoices():
    return InvoiceTable.query.all()


def get_invoices(sort_field, sort_order, number_of_results, offset=0):
    field = InvoiceTable.get_field_from_name(sort_field)

    current_query = InvoiceTable.query
    current_query = sort_query_field_order(current_query, field, sort_order)

    return current_query.limit(number_of_results).offset(offset)


def get_invoice_by_number(invoice_number):
    return InvoiceTable.query.filter_by(invoiceNumber=invoice_number).first()


def get_invoice_by_id(id_invoice):
    return InvoiceTable.query.filter_by(idInvoice=id_invoice).first()


def get_client_invoices_by_number(client_number):
    return InvoiceTable.query.filter_by(clientNumber=client_number).all()  # Return Type : List of InvoiceTable


def get_invoice_count():
    return InvoiceTable.query.count()


"""     UPDATE QUERY    """


def update_invoice(invoice, invoice_number, date, order_number, client_number):
    invoice.invoiceNumber = invoice_number
    invoice.invoiceDate = date

    invoice.clientNumber = client_number
    invoice.orderNumber = order_number

    db.session.commit()


"""     DELETE QUERY    """


def delete_invoice(invoice):
    db.session.delete(invoice)
    db.session.commit()


def delete_all_invoices():
    db.session.query(InvoiceTable).delete()
    db.session.commit()


"""     EXIST QUERY    """


def invoice_exist_by_number(invoice_number):
    return get_invoice_by_number(invoice_number) is not None


"""     SORT A QUERY BY FIELD    """


def sort_query_field_order(query, sort_field, sort_order):
    if sort_order == "asc":
        query = query.order_by(sort_field.asc())
    if sort_order == "desc":
        query = query.order_by(sort_field.desc())

    return query
