from application.database.queries.quote import get_quote_by_state_only
from application.extensions import db
from application.utils.tools import get_config_dict
from application.utils.data.quote import Quote

import application.database.queries.log as query_log
import application.database.queries.quote as query_quote

import datetime
import time


def quote_cancellation():
    """ Function used in a scheduler to run everyday.
    Take information from config.json for the number of days before a quote is expired.

    Loop through every quotes in waiting state and check how long it has been in this state.
    Change the state to cancelled of every quote exceeding the number of days before a quote is expired.

    If a quote has its state changed, it also deletes the quote pdf file in the 'reminder' folder.
    """
    with db.app.app_context():
        number_of_quote_cancelled = 0

        config = get_config_dict()
        days_before_quote_cancellation = config['other_parameters']['days_before_quote_cancellation']

        quotes_in_waiting_state = get_quote_by_state_only("waiting")
        today_date = datetime.datetime.today()

        for quote in quotes_in_waiting_state:
            days_elapsed_since_quote_sent = (today_date - quote.quoteDate).days

            if days_elapsed_since_quote_sent >= days_before_quote_cancellation:
                query_quote.update_quote_state(quote, 'cancelled')
                query_log.insert_log('Le devis ' + str(quote.quoteNumber) + ' est passé à l\'état Annulé suite à son ' +
                                     'expiration', 'quote_cancellation_scheduler')
                Quote.delete_quote_pdf_file_reminder(quote.quotePdfName, 'cancelled')
                number_of_quote_cancelled += 1

        # We wait 1 second to be sure that the last log of the scheduler is the summary
        time.sleep(1)
        query_log.insert_log("Le programme d'annulation automatique de devis expirés s'est exécuté - Nombre de devis "
                             + "expirés : " + str(number_of_quote_cancelled), 'quote_cancellation_scheduler')
