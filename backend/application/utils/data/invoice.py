import re

import application.database.queries.invoice as query
from application.utils.tools import convert_string_day_month_year_to_datetime

TEMPLATE_EMAIL_SUBJECT_FILE = "application/resources/email/invoice/subject.txt"
TEMPLATE_EMAIL_BODY_FILE = "application/resources/email/invoice/body.txt"
OVERLAY_GIRBAU_LOGO = "application/resources/overlay/invoice/overlay_logo_girbau.pdf"


class Invoice:
    """ This class is used to do all operations related to invoices.

    An invoice is a PDF document and it's represented by:
        - The document name
        - The invoice's number
        - The invoice's creation date
        - The invoice's client number
        - The order's reference of the invoice
    """

    def __init__(self, document_name=None, invoice_number=None, invoice_date=None, invoice_order_reference=None, client_number=None, pdf_content=None):
        self.pdf_content = pdf_content
        self.pdf_type = "invoice"

        self.document_name = document_name
        self.invoice_number = invoice_number
        self.invoice_date = invoice_date
        self.invoice_order_reference = invoice_order_reference
        self.client_number = client_number

    def to_dict(self):
        data = {
            "documentName": self.document_name,
            "documentType": self.pdf_type,
            "documentNumber": self.invoice_number,
            "creationDate": self.invoice_date,
            "invoiceOrderReference": self.invoice_order_reference
        }
        return data

    def set_document_name(self, document_name):
        self.document_name = document_name

    def extract_data_from_pdf(self):
        """ Extract the useful data from the pdf content of the invoice using regex. """

        self.invoice_number = self.__get_invoice_number()
        self.invoice_date = self.__get_invoice_date()
        self.invoice_order_reference = self.__get_invoice_order_reference()
        self.client_number = self.__get_invoice_client_number()

    def __get_invoice_number(self):
        regex_invoice_number = re.search("N.Document:([0-9]+)", self.pdf_content, re.IGNORECASE)

        number = regex_invoice_number.group(1)

        return int(number)

    def __get_invoice_date(self):
        regex_invoice_date = re.search("Datedocument:([0-9|.]+)", self.pdf_content, re.IGNORECASE)

        date_string = regex_invoice_date.group(1)

        date = convert_string_day_month_year_to_datetime(date_string)

        return date

    def __get_invoice_order_reference(self):
        regex_invoice_quote_reference = re.search("N.Commande:([0-9]+)", self.pdf_content, re.IGNORECASE)

        if regex_invoice_quote_reference is None:
            return None

        invoice_quote_reference = regex_invoice_quote_reference.group(1)

        return int(invoice_quote_reference)

    def __get_invoice_client_number(self):
        regex_client_number = re.search("N.client[e]?:([0-9]+)", self.pdf_content, re.IGNORECASE)

        client_number = regex_client_number.group(1)

        return int(client_number)

    def insert_database(self):
        query.insert_invoice(self.invoice_number, self.invoice_date, self.client_number, self.invoice_order_reference)

    def exist_in_database(self):
        return query.invoice_exist_by_number(self.invoice_number)

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
