import re
import os

import application.database.queries.quote as query_quote
import application.database.queries.log as query_log

from application.utils.tools import convert_string_day_month_year_to_datetime, get_config_dict

TEMPLATE_EMAIL_SUBJECT_FILE = "application/resources/email/quote/subject.txt"
TEMPLATE_EMAIL_BODY_FILE = "application/resources/email/quote/body.txt"
TEMPLATE_FIRST_REMINDER_EMAIL_SUBJECT_FILE = "application/resources/email/first_reminder/subject.txt"
TEMPLATE_FIRST_REMINDER_EMAIL_BODY_FILE = "application/resources/email/first_reminder/body.txt"
TEMPLATE_SECOND_REMINDER_EMAIL_SUBJECT_FILE = "application/resources/email/second_reminder/subject.txt"
TEMPLATE_SECOND_REMINDER_EMAIL_BODY_FILE = "application/resources/email/second_reminder/body.txt"
OVERLAY_GIRBAU_LOGO = "application/resources/overlay/quote/overlay_logo_girbau.pdf"


class Quote:
    """ This class is used to do all operations related to quotes.

    A quote is a PDF document and it's represented by:
        - The document name
        - The quote's number
        - The quote's creation date
        - The total amount given in the quote
        - The quote's client number
    """

    def __init__(self, document_name=None, quote_number=None, quote_date=None,
                 quote_total_amount=None, client_number=None, pdf_content=None):
        self.pdf_content = pdf_content
        self.pdf_type = "quote"

        self.document_name = document_name
        self.quote_number = quote_number
        self.quote_date = quote_date
        self.quote_total_amount = quote_total_amount
        self.client_number = client_number

    def to_dict(self):
        data = {
            "documentName": self.document_name,
            "documentType": self.pdf_type,
            "documentNumber": self.quote_number,
            "creationDate": self.quote_date,
            "totalAmount": self.quote_total_amount,
        }

        return data

    def set_document_name(self, document_name):
        self.document_name = document_name

    def extract_data_from_pdf(self):
        """ Extract the useful data from the pdf content of the quote using regex. """

        self.quote_number = self.__get_quote_number()
        self.quote_date = self.__get_quote_date()
        self.quote_total_amount = self.__get_quote_total_amount()
        self.client_number = self.__get_quote_client_number()

    def __get_quote_number(self):
        regex_quote_number = re.search("Offren.:([0-9]+)", self.pdf_content, re.IGNORECASE)

        number = regex_quote_number.group(1)

        return int(number)

    def __get_quote_date(self):
        regex_quote_date = re.search("Date:([0-9|.]+)", self.pdf_content, re.IGNORECASE)

        date_string = regex_quote_date.group(1)

        date = convert_string_day_month_year_to_datetime(date_string)

        return date

    def __get_quote_total_amount(self):
        regex_quote_total_amount = re.search("TOTAL[(].*[)]:([0-9|.]+),([0-9]+)", self.pdf_content, re.IGNORECASE)

        integer_part = regex_quote_total_amount.group(1)
        integer_part = re.sub("[.]", "", integer_part)
        decimal_part = regex_quote_total_amount.group(2)

        total_amount = float(integer_part + "." + decimal_part)

        return total_amount

    def __get_quote_client_number(self):
        regex_client_number = re.search("N.client[e]?:([0-9]+)", self.pdf_content, re.IGNORECASE)

        client_number = regex_client_number.group(1)

        return int(client_number)

    def insert_database(self):
        query_quote.insert_quote(self.quote_number, self.quote_date, self.quote_total_amount, self.client_number,
                                 self.document_name)

    def exist_in_database(self):
        return query_quote.quote_exist_by_number(self.quote_number)

    @staticmethod
    def validate_quote_referenced_by_order(order_quote_reference, order_number):
        """ Changes the state of the quote in the database from waiting to validated when an order
        is processed.

        :param order_quote_reference: The number of the quote referenced by an order
        :param order_number: The number of the order
        """
        quote_referenced = query_quote.get_quote_by_number(order_quote_reference)

        if quote_referenced is not None:
            query_quote.update_quote_state(quote_referenced, "validated")
            query_log.insert_log("Le devis " + str(quote_referenced.quoteNumber) + " référencé par la " +
                                 "commande " + str(order_number) + " est passé à l'état Validé", 'pdf-processing')
            Quote.delete_quote_pdf_file_reminder(quote_referenced.quotePdfName, 'validated')

        else:
            query_log.insert_log("Impossible de passer le devis " + str(order_quote_reference) + " référencé par la " +
                                 "commande " + str(order_number) + " à l'état Validé - Le document n'a pas été " +
                                 "trouvé dans la base de données", 'pdf-processing', error=True)

    @staticmethod
    def delete_quote_pdf_file_reminder(quote_pdf_filename, quote_state):
        """ Try to delete the quote_pdf_filename in the 'reminder' folder if it exists.

        :param quote_pdf_filename: The PDF file to delete
        :param quote_state: The state's quote used to know which log to insert
        """
        if quote_pdf_filename is not None:
            config = get_config_dict()
            path_pdf_file = config['pdf_processing_parameters']['save_file_path_reminder'] + "\\" + quote_pdf_filename

            try:
                os.remove(path_pdf_file)
                if quote_state == 'validated':
                    query_log.insert_log("Le devis " + quote_pdf_filename + " a été supprimé du dossier de relance " +
                                         "de devis suite à sa validation", 'unarchive')
                if quote_state == 'cancelled':
                    query_log.insert_log("Le devis " + quote_pdf_filename + " a été supprimé du dossier de relance " +
                                         "de devis suite à son annulation", 'unarchive')

            except FileNotFoundError:
                if quote_state == 'validated':
                    query_log.insert_log("Impossible de supprimer le devis " + quote_pdf_filename + " du dossier de " +
                                         "relance de devis suite à sa validation - Le document n'a pas été trouvé "
                                         "dans le dossier", 'unarchive', error=True)
                if quote_state == 'cancelled':
                    query_log.insert_log("Impossible de supprimer le devis " + quote_pdf_filename + " du dossier de " +
                                         "relance de devis suite à son annulation - Le document n'a pas été trouvé "
                                         "dans le dossier", 'unarchive', error=True)

    @staticmethod
    def get_overlay_logo_girbau_pdf():
        return OVERLAY_GIRBAU_LOGO

    @staticmethod
    def update_overlay_logo_girbau_pdf(overlay_logo_pdf):
        overlay_logo_pdf.save(OVERLAY_GIRBAU_LOGO)

    @staticmethod
    def get_email_subject():
        with open(TEMPLATE_EMAIL_SUBJECT_FILE, "r", encoding="utf-8") as email_subject_file:
            email_subject = email_subject_file.read()
            return email_subject

    @staticmethod
    def get_email_body():
        with open(TEMPLATE_EMAIL_BODY_FILE, "r", encoding="utf-8") as email_body_file:
            email_body = email_body_file.read()
            return email_body

    @staticmethod
    def get_first_reminder_email_subject():
        with open(TEMPLATE_FIRST_REMINDER_EMAIL_SUBJECT_FILE, "r", encoding="utf-8") as email_subject_file:
            email_subject = email_subject_file.read()
            return email_subject

    @staticmethod
    def get_first_reminder_email_body():
        with open(TEMPLATE_FIRST_REMINDER_EMAIL_BODY_FILE, "r", encoding="utf-8") as email_body_file:
            email_body = email_body_file.read()
            return email_body

    @staticmethod
    def get_second_reminder_email_subject():
        with open(TEMPLATE_SECOND_REMINDER_EMAIL_SUBJECT_FILE, "r", encoding="utf-8") as email_subject_file:
            email_subject = email_subject_file.read()
            return email_subject

    @staticmethod
    def get_second_reminder_email_body():
        with open(TEMPLATE_SECOND_REMINDER_EMAIL_BODY_FILE, "r", encoding="utf-8") as email_body_file:
            email_body = email_body_file.read()
            return email_body

    @staticmethod
    def update_email_subject(data):
        with open(TEMPLATE_EMAIL_SUBJECT_FILE, "w", encoding="utf-8") as email_subject_file:
            email_subject_file.write(data)

    @staticmethod
    def update_email_body(data):
        with open(TEMPLATE_EMAIL_BODY_FILE, "w", encoding="utf-8") as email_body_file:
            email_body_file.write(data)

    @staticmethod
    def update_first_reminder_email_subject(data):
        with open(TEMPLATE_FIRST_REMINDER_EMAIL_SUBJECT_FILE, "w", encoding="utf-8") as email_subject_file:
            email_subject_file.write(data)

    @staticmethod
    def update_first_reminder_email_body(data):
        with open(TEMPLATE_FIRST_REMINDER_EMAIL_BODY_FILE, "w", encoding="utf-8") as email_body_file:
            email_body_file.write(data)

    @staticmethod
    def update_second_reminder_email_subject(data):
        with open(TEMPLATE_SECOND_REMINDER_EMAIL_SUBJECT_FILE, "w", encoding="utf-8") as email_subject_file:
            email_subject_file.write(data)

    @staticmethod
    def update_second_reminder_email_body(data):
        with open(TEMPLATE_SECOND_REMINDER_EMAIL_BODY_FILE, "w", encoding="utf-8") as email_body_file:
            email_body_file.write(data)
