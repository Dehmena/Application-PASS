import PyPDF2
import re
from io import BytesIO

import application.utils.data.quote as quote
import application.utils.data.order as order
import application.utils.data.invoice as invoice

from application.utils.tools import get_config_dict


def convert_pdf_file_content_to_string(pdf_file):
    """ Read all pages of a PDF file and return them into a single string.
    """

    pdf_reader = PyPDF2.PdfFileReader(pdf_file)

    return __extract_pdf_content(pdf_reader)


def __extract_pdf_content(pdf_reader):
    number_of_pages = pdf_reader.getNumPages()

    pdf_content = ""

    for i in range(number_of_pages):
        page = pdf_reader.getPage(i)
        pdf_content += page.extractText()

    pdf_content = re.sub("\n", "", pdf_content)

    return pdf_content


def get_document_object_from_pdf_content(pdf_content):
    """ With the content of a pdf in string, it returns
    an instance of an object depending on the type of
    the document:
        - Quote
        - Order
        - Invoice

    Returns None if the document type hasn't been found
    """

    config = get_config_dict()

    regex_quote = config['pdf_processing_parameters']['regex_quote']
    regex_order = config['pdf_processing_parameters']['regex_order']
    regex_invoice = config['pdf_processing_parameters']['regex_invoice']

    regex_quote_without_whitespace = re.sub(" ", "", regex_quote)
    regex_order_without_whitespace = re.sub(" ", "", regex_order)
    regex_invoice_without_whitespace = re.sub(" ", "", regex_invoice)

    if re.search(regex_quote, pdf_content) or \
            re.search(regex_quote_without_whitespace, pdf_content):
        return quote.Quote(pdf_content=pdf_content)

    elif re.search(regex_order, pdf_content) or \
            re.search(regex_order_without_whitespace, pdf_content):
        return order.Order(pdf_content=pdf_content)

    elif re.search(regex_invoice, pdf_content) or \
            re.search(regex_invoice_without_whitespace, pdf_content):
        return invoice.Invoice(pdf_content=pdf_content)

    return None


def get_object_from_document_type(document_type, data):
    if document_type == "quote":
        return quote.Quote(data['documentData']['documentName'],
                           data['documentData']['documentNumber'],
                           data['documentData']['creationDate'],
                           data['documentData']['totalAmount'],
                           data['clientData']['clientNumber'])

    elif document_type == "order":
        if data['documentData']['orderQuoteReference'] == "":
            data['documentData']['orderQuoteReference'] = None

        return order.Order(data['documentData']['documentName'],
                           data['documentData']['documentNumber'],
                           data['documentData']['creationDate'],
                           data['documentData']['totalAmount'],
                           data['documentData']['orderQuoteReference'],
                           data['clientData']['clientNumber'])

    elif document_type == "invoice":
        return invoice.Invoice(data['documentData']['documentName'],
                               data['documentData']['documentNumber'],
                               data['documentData']['creationDate'],
                               data['documentData']['invoiceOrderReference'],
                               data['clientData']['clientNumber'])


def merge_two_pdf(original_pdf, overlay_pdf):
    """ Put the content of the overlay_pdf in front of the original_pdf
    on the first page only

    :return: A PDF file in BytesIO temporary stored in memory
    """
    with open(overlay_pdf, 'rb') as overlay:
        original_pdf_reader = PyPDF2.PdfFileReader(original_pdf)
        overlay_pdf_reader = PyPDF2.PdfFileReader(overlay)

        background = original_pdf_reader.getPage(0)
        foreground = overlay_pdf_reader.getPage(0)

        # Merge the first two pages
        background.mergePage(foreground)

        # Add all pages to a writer
        writer = PyPDF2.PdfFileWriter()
        for i in range(original_pdf_reader.getNumPages()):
            page = original_pdf_reader.getPage(i)
            writer.addPage(page)

        temp = BytesIO()
        writer.write(temp)
        temp.seek(0)

        return temp
