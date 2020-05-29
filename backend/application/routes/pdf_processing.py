""" All the routes for the processing of PDF file.

cf. Section I in Documentation backend routes
"""

from flask import Blueprint, jsonify, request

import application.utils.pdf as pdf
from application.utils.send_mail import send_email_to_client
from application.utils.tools import get_config_dict, convert_date_string_to_datetime
import application.utils.data.client as client
import application.database.queries.log as query

import smtplib
import json

pdf_processing = Blueprint('pdf_processing', __name__)


@pdf_processing.route("/extract-data-pdf", methods=['POST'])
def extraction_information_pdf():
    pdf_file = request.files['pdf']
    pdf_content = pdf.convert_pdf_file_content_to_string(pdf_file)
    pdf_file.close()

    # Get the right instance object depending on the type of document: Quote, Order, Invoice
    document = pdf.get_document_object_from_pdf_content(pdf_content)

    # If the document type hasn't been recognized between Quote, Order and Invoice, returns a 400 BAD REQUEST
    if document is None:
        return "This document type hasn't been recognized between Quote, Order and Invoice", 400

    document.extract_data_from_pdf()
    document.set_document_name(pdf_file.filename)
    document_data = document.to_dict()

    document_client = client.Client(document.client_number)
    document_client.get_client_data_from_database()
    client_data = document_client.to_dict()

    response = {
        "documentData": document_data,
        "clientData": client_data
    }

    resp = jsonify(response)
    resp.status_code = 200

    return resp


@pdf_processing.route("/document", methods=['POST'])
def insert_document():
    data = json.loads(request.form['data'])

    data['documentData']['creationDate'] = convert_date_string_to_datetime(data['documentData']['creationDate'])
    document = pdf.get_object_from_document_type(data['documentData']['documentType'], data)

    # If the document already exists in the database, return 400 BAD REQUEST
    if document.exist_in_database():
        return "This document is already in the database", 400

    document_client = client.Client(data['clientData']['clientNumber'],
                                    data['clientData']['clientName'],
                                    data['clientData']['clientMail'])

    document_client.insert_or_update_if_exists_database()
    document.insert_database()

    query.insert_log("Les données du document " + data["documentData"]["documentName"] +
                     " ont été insérées dans la base de données", 'pdf-processing')

    response = {
        "documentNumber": data["documentData"]["documentNumber"],
        "type": data["documentData"]["documentType"]
    }

    return jsonify(response), 201


@pdf_processing.route("/send-mail", methods=['POST'])
def send_mail():
    pdf_file = request.files['pdf']
    data = json.loads(request.form['data'])
    config = get_config_dict()

    document = pdf.get_object_from_document_type(data['documentData']['documentType'], data)

    client_mail = data['clientData']['clientMail']
    email_subject = document.get_email_subject()
    email_body = document.get_email_body()

    try:
        if config["other_parameters"]["add_girbau_logo_pdf"]:
            pdf_file_with_girbau_logo = pdf.merge_two_pdf(pdf_file, document.get_overlay_logo_girbau_pdf())
            send_email_to_client(client_mail, email_subject, email_body, pdf_file_with_girbau_logo, pdf_file.filename)
            pdf_file_with_girbau_logo.close()

        else:
            send_email_to_client(client_mail, email_subject, email_body, pdf_file, pdf_file.filename)

        query.insert_log("Un e-mail a été envoyé au client " + data['clientData']['clientName'] +
                         " avec le document " + data["documentData"]["documentName"], 'pdf-processing')

        pdf_file.close()

        response = {"success": True}
        return jsonify(response), 200

    except smtplib.SMTPException:
        query.insert_log("Une erreur est survenue lors de l'envoi de l'e-mail au client " +
                         data["clientData"]["clientName"] + " avec le document " + data["documentData"]["documentName"],
                         'pdf-processing', error=True)

        return "An error has occurred when sending the email", 400


@pdf_processing.route("/save-pdf", methods=['POST'])
def save_pdf():
    pdf_file = request.files['pdf']
    data = json.loads(request.form['data'])
    config = get_config_dict()

    document = pdf.get_object_from_document_type(data['documentData']['documentType'], data)

    save_file_path_archive = config["pdf_processing_parameters"]["save_file_path_archive"] + "\\" \
                             + data["documentData"]["documentName"]
    save_file_path_reminder = config["pdf_processing_parameters"]["save_file_path_reminder"] + "\\" \
                              + data["documentData"]["documentName"]
    try:
        if config["other_parameters"]["add_girbau_logo_pdf"]:
            pdf_file_with_girbau_logo = pdf.merge_two_pdf(pdf_file, document.get_overlay_logo_girbau_pdf())
            with open(save_file_path_archive, 'wb') as new_pdf_archive:
                new_pdf_archive.write(pdf_file_with_girbau_logo.getbuffer())

            if data['documentData']['documentType'] == "quote":
                pdf_file_with_girbau_logo.seek(0)
                with open(save_file_path_reminder, 'wb') as new_pdf_reminder:
                    new_pdf_reminder.write(pdf_file_with_girbau_logo.getbuffer())

            pdf_file_with_girbau_logo.close()

        else:
            pdf_file.save(save_file_path_archive)
            if data['documentData']['documentType'] == "quote":
                pdf_file.seek(0)
                pdf_file.save(save_file_path_reminder)

        pdf_file.close()
        query.insert_log("Le document " + data["documentData"]["documentName"] + " a été sauvegardé sur le serveur",
                         'pdf-processing')

        response = {"success": True}
        return jsonify(response), 200

    except FileNotFoundError:
        query.insert_log("Une erreur est survenue lors de la sauvegarde du document " +
                         data["documentData"]["documentName"] + " sur le serveur",
                         'pdf-processing', error=True)

        return "An error has occurred while saving the file. Problem with the save path", 400
