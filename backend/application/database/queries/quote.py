from application.extensions import db
from application.database.models import QuoteTable

"""     INSERTION QUERY      """


def get_all_quotes():
    return QuoteTable.query.all()


def insert_quote(number, date, total_amount, client_number, quote_pdf_name=None, state='waiting'):
    new_quote = QuoteTable(quoteNumber=number,
                           quoteDate=date,
                           quoteTotalAmount=total_amount,
                           quoteState=state,
                           clientNumber=client_number,
                           quotePdfName=quote_pdf_name)
    db.session.add(new_quote)
    db.session.commit()


def bulk_insert_quotes(list_quotes):
    db.session.bulk_insert_mappings(QuoteTable, list_quotes)
    db.session.commit()


"""     GET QUERIES      """


def get_quotes(sort_field, sort_order, number_of_results, offset=0):
    field = QuoteTable.get_field_from_name(sort_field)

    current_query = QuoteTable.query
    current_query = sort_query_field_order(current_query, field, sort_order)

    return current_query.limit(number_of_results).offset(offset)


def get_quote_by_number(quote_number):
    return QuoteTable.query.filter_by(quoteNumber=quote_number).first()


def get_quote_by_id(id_quote):
    return QuoteTable.query.filter_by(idQuote=id_quote).first()


def get_quote_by_state_only(quote_state):
    return QuoteTable.query.filter_by(quoteState=quote_state).all()


def get_quote_by_state(quote_state, sort_field, sort_order, number_of_results, offset=0):
    field = QuoteTable.get_field_from_name(sort_field)

    current_query = QuoteTable.query.filter_by(quoteState=quote_state)
    current_query = sort_query_field_order(current_query, field, sort_order)

    return current_query.limit(number_of_results).offset(offset).all()


def get_client_quotes_by_number(client_number):
    return QuoteTable.query.filter_by(clientNumber=client_number).all()  # Return Type : List of QuoteTable


def get_quote_count():
    return QuoteTable.query.count()


def get_quote_count_by_state(quote_state):
    return QuoteTable.query.filter_by(quoteState=quote_state).count()


"""     UPDATE QUERY    """


def update_quote(quote, quote_number, date, total_amount, state, client_number):
    quote.quoteNumber = quote_number
    quote.quoteDate = date
    quote.quoteTotalAmount = total_amount
    quote.quoteState = state
    quote.clientNumber = client_number

    db.session.commit()


def update_quote_state(quote, state):
    quote.quoteState = state

    db.session.commit()


def update_quote_has_first_reminder(quote, has_first_reminder):
    quote.hasFirstReminder = has_first_reminder

    db.session.commit()


def update_quote_has_second_reminder(quote, has_second_reminder):
    quote.hasSecondReminder = has_second_reminder

    db.session.commit()


"""     DELETE QUERY    """


def delete_quote(quote):
    db.session.delete(quote)
    db.session.commit()


def delete_all_quotes():
    db.session.query(QuoteTable).delete()
    db.session.commit()


"""     EXIST QUERY    """


def quote_exist_by_number(quote_number):
    return get_quote_by_number(quote_number) is not None


"""     SORT A QUERY BY FIELD    """


def sort_query_field_order(query, sort_field, sort_order):
    if sort_order == "asc":
        query = query.order_by(sort_field.asc())
    if sort_order == "desc":
        query = query.order_by(sort_field.desc())

    return query
