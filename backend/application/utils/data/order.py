import re

import application.database.queries.order as query_order
from application.utils.data.quote import Quote

from application.utils.tools import convert_string_day_month_year_to_datetime

TEMPLATE_EMAIL_SUBJECT_FILE = "application/resources/email/order/subject.txt"
TEMPLATE_EMAIL_BODY_FILE = "application/resources/email/order/body.txt"
OVERLAY_GIRBAU_LOGO = "application/resources/overlay/order/overlay_logo_girbau.pdf"


class Order:
    """ This class is used to do all operations related to orders.

    An order is a PDF document and it's represented by:
        - The document name
        - The order's number
        - The order's creation date
        - The total amount given in the order
        - The order's client number
        - The quote's reference of the order
    """

    def __init__(self, document_name=None, order_number=None, order_date=None,
                 order_total_amount=None, order_quote_reference=None, client_number=None, pdf_content=None):
        self.pdf_content = pdf_content
        self.pdf_type = "order"

        self.document_name = document_name
        self.order_number = order_number
        self.order_date = order_date
        self.order_total_amount = order_total_amount
        self.order_quote_reference = order_quote_reference
        self.client_number = client_number

    def to_dict(self):
        data = {
            "documentName": self.document_name,
            "documentType": self.pdf_type,
            "documentNumber": self.order_number,
            "creationDate": self.order_date,
            "totalAmount": self.order_total_amount,
            "orderQuoteReference": self.order_quote_reference
        }

        return data

    def set_document_name(self, document_name):
        self.document_name = document_name

    def extract_data_from_pdf(self):
        """ Extract the useful data from the pdf content of the order using regex. """

        self.order_number = self.__get_order_number()
        self.order_date = self.__get_order_date()
        self.order_total_amount = self.__get_order_total_amount()
        self.order_quote_reference = self.__get_order_quote_reference()
        self.client_number = self.__get_order_client_number()

    def __get_order_number(self):
        regex_order_number = re.search("Offren.:([0-9]+)", self.pdf_content, re.IGNORECASE)

        number = regex_order_number.group(1)

        return int(number)

    def __get_order_date(self):
        regex_order_date = re.search("Date:([0-9|.]+)", self.pdf_content, re.IGNORECASE)

        date_string = regex_order_date.group(1)

        date = convert_string_day_month_year_to_datetime(date_string)

        return date

    def __get_order_total_amount(self):
        regex_order_total_amount = re.search("TOTAL[(].*[)]:([0-9|.]+),([0-9]+)", self.pdf_content, re.IGNORECASE)

        integer_part = regex_order_total_amount.group(1)
        integer_part = re.sub("[.]", "", integer_part)
        decimal_part = regex_order_total_amount.group(2)

        total_amount = float(integer_part + "." + decimal_part)

        return total_amount

    def __get_order_quote_reference(self):
        regex_order_quote_reference = re.search("Votreréférence:([0-9]+)", self.pdf_content, re.IGNORECASE)

        if regex_order_quote_reference is None:
            return None

        order_quote_reference = regex_order_quote_reference.group(1)

        return int(order_quote_reference)

    def __get_order_client_number(self):
        regex_client_number = re.search("N.client[e]?:([0-9]+)", self.pdf_content, re.IGNORECASE)

        client_number = regex_client_number.group(1)

        return int(client_number)

    def insert_database(self):
        query_order.insert_order(self.order_number, self.order_date, self.order_total_amount,
                                 self.client_number, self.order_quote_reference)

        if self.order_quote_reference is not None:
            Quote.validate_quote_referenced_by_order(self.order_quote_reference, self.order_number)

    def exist_in_database(self):
        return query_order.order_exist_by_number(self.order_number)

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
    def update_email_subject(data):
        with open(TEMPLATE_EMAIL_SUBJECT_FILE, "w", encoding="utf-8") as email_subject_file:
            email_subject_file.write(data)

    @staticmethod
    def update_email_body(data):
        with open(TEMPLATE_EMAIL_BODY_FILE, "w", encoding="utf-8") as email_body_file:
            email_body_file.write(data)
