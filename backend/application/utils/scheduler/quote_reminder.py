from application.database.queries.quote import get_quote_by_state_only, \
    update_quote_has_first_reminder, update_quote_has_second_reminder
from application.database.queries.client import get_client_by_number
from application.extensions import db
from application.utils.tools import get_config_dict
from application.utils.send_mail import connect_to_smtp_server, send_mail
from application.utils.data.quote import Quote

import application.database.queries.log as query_log

import datetime
import smtplib
import time


def quote_reminder():
    """ Function used in a scheduler to run everyday.
    Take information from config.json for :
        - The path for the 'reminder' folder where the quote pdf files are
        - The number of days before the first reminder is sent
        - The number of days before the second reminder is sent

    Loop through every quotes in waiting state and check how long it has been in this state.
    Send an email with the quote in PDF format in attachment to the client of the quote if
    it exceeds the time before the first reminder or second reminder is sent.

    Uses the pdf file in the folder 'reminder' given by the path in the config.json
    """
    with db.app.app_context():
        number_of_mail_sent = 0

        config = get_config_dict()
        path_folder_reminder = config['pdf_processing_parameters']['save_file_path_reminder']
        days_before_first_reminder = config['other_parameters']['days_before_first_reminder']
        days_before_second_reminder = config['other_parameters']['days_before_second_reminder']

        first_reminder_email_subject = Quote.get_first_reminder_email_subject()
        first_reminder_email_body = Quote.get_first_reminder_email_body()
        second_reminder_email_subject = Quote.get_second_reminder_email_subject()
        second_reminder_email_body = Quote.get_second_reminder_email_body()

        quotes_in_waiting_state = get_quote_by_state_only("waiting")
        today_date = datetime.datetime.today()

        try:
            smtp_server = connect_to_smtp_server()

            for quote in quotes_in_waiting_state:
                if __has_got_all_reminders(quote):
                    continue

                days_elapsed_since_quote_sent = (today_date - quote.quoteDate).days

                if __can_send_first_reminder(quote, days_elapsed_since_quote_sent, days_before_first_reminder):
                    if __try_sending_reminder(smtp_server, quote, first_reminder_email_subject,
                                              first_reminder_email_body,
                                              path_folder_reminder, quote.quotePdfName, is_first_reminder=True):
                        number_of_mail_sent += 1

                elif __can_send_second_reminder(quote, days_elapsed_since_quote_sent, days_before_second_reminder):
                    if __try_sending_reminder(smtp_server, quote, second_reminder_email_subject,
                                              second_reminder_email_body, path_folder_reminder, quote.quotePdfName,
                                              is_first_reminder=False):
                        number_of_mail_sent += 1

            smtp_server.quit()

            # We wait 1 second to be sure that the last log of the scheduler is the summary
            time.sleep(1)
            query_log.insert_log("Le programme de relance automatique de devis s'est exécuté - Nombre d'e-mails "
                                 + "envoyés : " + str(number_of_mail_sent), 'scheduler')

        except Exception as e:
            print(e)
            query_log.insert_log("Une erreur est survenue lors du programme de relance automatique des devis " +
                                 "- Impossible de se connecter au serveur SMTP, veuillez vérifier les paramètres " +
                                 "d'envoi d'e-mail dans l'onglet \"Paramètres\"", 'scheduler', error=True)


def __has_got_all_reminders(quote):
    return quote.hasFirstReminder and quote.hasSecondReminder


def __can_send_first_reminder(quote, days_elapsed_since_quote_sent, days_before_first_reminder):
    return not quote.hasFirstReminder and days_elapsed_since_quote_sent >= days_before_first_reminder


def __can_send_second_reminder(quote, days_elapsed_since_quote_sent, days_before_second_reminder):
    return not quote.hasSecondReminder and days_elapsed_since_quote_sent >= days_before_second_reminder


def __try_sending_reminder(smtp_server, quote, email_subject, email_body, path_folder_reminder, pdf_file_name,
                           is_first_reminder):
    client = get_client_by_number(quote.clientNumber)
    if client is None:
        query_log.insert_log("Une erreur est survenue lors de l'envoi d'un e-mail de relance du devis " +
                             str(quote.quoteNumber) + " pour le client " + str(quote.clientNumber) +
                             " - Ce numéro de client n'existe pas dans la base de données", 'scheduler', error=True)
        return False
    else:
        path_quote_pdf_file = path_folder_reminder + "\\" + quote.quotePdfName

        try:
            quote_pdf_file = open(path_quote_pdf_file, "rb")

            try:
                send_mail(smtp_server, client.mailAddress, email_subject, email_body, quote_pdf_file, pdf_file_name)

                if is_first_reminder:
                    update_quote_has_first_reminder(quote, has_first_reminder=True)
                    query_log.insert_log("Un premier e-mail de relance pour le devis " + str(quote.quoteNumber) +
                                         " a été envoyé au client " + client.clientName, 'scheduler')
                else:
                    update_quote_has_second_reminder(quote, has_second_reminder=True)
                    query_log.insert_log("Un deuxième e-mail de relance pour le devis " + str(quote.quoteNumber) +
                                         " a été envoyé au client " + client.clientName, 'scheduler')

            except smtplib.SMTPRecipientsRefused:
                query_log.insert_log("Une erreur est survenue lors de l'envoi d'un e-mail de relance du devis " +
                                     str(quote.quoteNumber) + " pour le client " + str(quote.clientNumber) +
                                     " - L'adresse e-mail du client est invalide", 'scheduler', error=True)
                return False

            quote_pdf_file.close()
            return True

        except IOError:
            query_log.insert_log("Une erreur est survenue lors de l'envoi d'un e-mail de relance du devis " +
                                 str(quote.quoteNumber) + " pour le client " + str(quote.clientNumber) +
                                 " - Le document " + quote.quotePdfName + " n'a pas été trouvé dans le dossier " +
                                 path_folder_reminder, 'scheduler', error=True)
            return False
