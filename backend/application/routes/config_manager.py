""" All the routes for the application parameters.

cf. Section VII in Documentation backend routes
"""

from flask import Blueprint, jsonify, request, Response

from application.utils.tools import get_config_dict, get_mail_signature, \
    update_config_pdf_processing_parameters, update_config_mail_sending_parameters, \
    update_config_other_parameters, update_signature

from application.utils.data.quote import Quote
from application.utils.data.order import Order
from application.utils.data.invoice import Invoice

from application.utils.send_mail import test_send_mail
import application.utils.pdf as pdf
import application.database.queries.log as query

import json
import smtplib
import os

config_manager = Blueprint('config_manager', __name__)


@config_manager.route('/config', methods=['GET'])
def get_config():
    config = get_config_dict()

    resp = jsonify(config)
    resp.status_code = 200

    return resp


@config_manager.route('/config/template-mail', methods=['GET'])
def get_template_mail():
    quote_subject = Quote.get_email_subject()
    quote_body = Quote.get_email_body()

    first_reminder_subject = Quote.get_first_reminder_email_subject()
    first_reminder_body = Quote.get_first_reminder_email_body()

    second_reminder_subject = Quote.get_second_reminder_email_subject()
    second_reminder_body = Quote.get_second_reminder_email_body()

    order_subject = Order.get_email_subject()
    order_body = Order.get_email_body()

    invoice_subject = Invoice.get_email_subject()
    invoice_body = Invoice.get_email_body()

    mail_signature = get_mail_signature()

    response = {
        'quote': {
            'subject': quote_subject,
            'body': quote_body
        },
        'order': {
            'subject': order_subject,
            'body': order_body
        },
        'invoice': {
            'subject': invoice_subject,
            'body': invoice_body
        },
        'first_reminder': {
            'subject': first_reminder_subject,
            'body': first_reminder_body,
        },
        'second_reminder': {
            'subject': second_reminder_subject,
            'body': second_reminder_body,
        },
        'signature': mail_signature
    }

    resp = jsonify(response)
    resp.status_code = 200

    return resp


@config_manager.route('/config/mail-sending-parameters', methods=['PUT'])
def update_mail_sending_parameters():
    data = json.loads(request.form['data'])

    update_config_mail_sending_parameters(data)

    query.insert_log("Les paramètres d'envoi d'e-mail ont été mis à jour", "settings")

    resp = jsonify({'success': True})
    resp.status_code = 200

    return resp


@config_manager.route('/config/pdf-processing-parameters', methods=['PUT'])
def update_pdf_processing_parameters():
    data = json.loads(request.form['data'])

    update_config_pdf_processing_parameters(data)

    query.insert_log("Les paramètres de traitement de fichiers PDF ont été mis à jour", "settings")

    resp = jsonify({'success': True})
    resp.status_code = 200

    return resp


@config_manager.route('/config/other-parameters', methods=['PUT'])
def update_other_parameters():
    data = json.loads(request.form['data'])
    if 'logo_quote' in request.files:
        pdf_logo_quote = request.files['logo_quote']
    else:
        pdf_logo_quote = None

    if 'logo_order' in request.files:
        pdf_logo_order = request.files['logo_order']
    else:
        pdf_logo_order = None

    if 'logo_invoice' in request.files:
        pdf_logo_invoice = request.files['logo_invoice']
    else:
        pdf_logo_invoice = None

    update_config_other_parameters(data)
    query.insert_log("Les paramètres divers ont été mis à jour", "settings")

    __update_logo_if_necessary(pdf_logo_quote, pdf_logo_order, pdf_logo_invoice)

    resp = jsonify({'success': True})
    resp.status_code = 200

    return resp


def __update_logo_if_necessary(pdf_logo_quote, pdf_logo_order, pdf_logo_invoice):
    if pdf_logo_quote is not None:
        Quote.update_overlay_logo_girbau_pdf(pdf_logo_quote)
        query.insert_log("Le logo pour les devis a été mis à jour", "settings")

    if pdf_logo_order is not None:
        Order.update_overlay_logo_girbau_pdf(pdf_logo_order)
        query.insert_log("Le logo pour les commandes a été mis à jour", "settings")

    if pdf_logo_invoice is not None:
        Invoice.update_overlay_logo_girbau_pdf(pdf_logo_invoice)
        query.insert_log("Le logo pour les factures a été mis à jour", "settings")


@config_manager.route('/config/template-mail/<email_type>', methods=['PUT'])
def update_template_mail(email_type):
    data = json.loads(request.form['data'])

    subject = data['subject']
    body = data['body']

    if email_type == 'quote':
        Quote.update_email_subject(subject)
        Quote.update_email_body(body)

        query.insert_log("Le modèle d'e-mail pour les devis a été mis à jour", "settings")

    elif email_type == 'order':
        Order.update_email_subject(subject)
        Order.update_email_body(body)

        query.insert_log("Le modèle d'e-mail pour les commandes a été mis à jour", "settings")

    elif email_type == 'invoice':
        Invoice.update_email_subject(subject)
        Invoice.update_email_body(body)

        query.insert_log("Le modèle d'e-mail pour les factures a été mis à jour", "settings")

    elif email_type == 'first_reminder':
        Quote.update_first_reminder_email_subject(subject)
        Quote.update_first_reminder_email_body(body)

        query.insert_log("Le modèle d'e-mail pour la première relance de devis a été mis à jour", "settings")

    elif email_type == 'second_reminder':
        Quote.update_second_reminder_email_subject(subject)
        Quote.update_second_reminder_email_body(body)

        query.insert_log("Le modèle d'e-mail pour la deuxième relance de devis a été mis à jour", "settings")

    else:
        return "Email type not recognized. The email type must be 'quote', 'order', 'invoice', 'first_reminder' or " \
               "'second_reminder'", 400

    resp = jsonify({'success': True})
    resp.status_code = 200

    return resp


@config_manager.route('/config/mail-signature', methods=['PUT'])
def update_mail_signature():
    data = json.loads(request.form['data'])

    signature = data['signature']
    update_signature(signature)

    query.insert_log("La signature des e-mails a été mis à jour", "settings")

    resp = jsonify({'success': True})
    resp.status_code = 200

    return resp


@config_manager.route('/config/test-mail-sending-parameters', methods=['POST'])
def test_mail_sending_parameter():
    data = json.loads(request.form['data'])

    receiver_mail = data['receiver_mail']

    try:
        test_send_mail(receiver_mail)

        resp = jsonify({'success': True})
        resp.status_code = 200

    except smtplib.SMTPAuthenticationError:
        response = {
            "code": 1,
            "message": "Authentication error"
        }
        resp = jsonify(response)
        resp.status_code = 400

    except smtplib.SMTPConnectError:
        response = {
            "code": 2,
            "message": "SMTP Server Error"
        }
        resp = jsonify(response)
        resp.status_code = 400

    except smtplib.SMTPRecipientsRefused:
        response = {
            "code": 3,
            "message": "Invalid recipient address"
        }
        resp = jsonify(response)
        resp.status_code = 400

    except smtplib.SMTPException:
        response = {
            "code": 4,
            "message": "SMTP Error"
        }
        resp = jsonify(response)
        resp.status_code = 400

    return resp


@config_manager.route('/config/test-regex-document', methods=['POST'])
def test_regex_document():
    pdf_file = request.files['pdf']
    pdf_content = pdf.convert_pdf_file_content_to_string(pdf_file)
    pdf_file.close()

    document = pdf.get_document_object_from_pdf_content(pdf_content)

    if document is None:
        return "The document hasn't been recognized as a quote, order or invoice", 400

    response = {"documentType": document.pdf_type}

    resp = jsonify(response)
    resp.status_code = 200

    return resp


@config_manager.route('/config/test-save-path', methods=['POST'])
def test_save_path():
    data = json.loads(request.form['data'])

    config = get_config_dict()

    if data["savePathType"] == "archive":
        save_path = config['pdf_processing_parameters']['save_file_path_archive']
    elif data["savePathType"] == "reminder":
        save_path = config['pdf_processing_parameters']['save_file_path_reminder']
    elif data["savePathType"] == "backups":
        save_path = config['other_parameters']['save_file_path_backups']
    else:
        return {
                   'code': 0,
                   'message': "Save path type not recognized. The save path type must be archive, reminder or backups."
               }, 400

    if os.path.isdir(save_path):
        response = {'success': True}

        resp = jsonify(response)
        resp.status_code = 200

        return resp

    else:
        return {
                   'code': 1,
                   'message': "The save path is incorrect"
               }, 400


@config_manager.route('/config/test-add-logo-pdf', methods=['POST'])
def test_add_logo_pdf():
    pdf_file = request.files['pdf']
    pdf_content = pdf.convert_pdf_file_content_to_string(pdf_file)

    document = pdf.get_document_object_from_pdf_content(pdf_content)

    if document is None:
        return "The document hasn't been recognized as a quote, order or invoice", 400

    pdf_file_with_girbau_logo = pdf.merge_two_pdf(pdf_file, document.get_overlay_logo_girbau_pdf())

    return Response(pdf_file_with_girbau_logo,
                    mimetype="application/pdf",
                    headers={"Content-Disposition": "attachment;filename=pdf_with_logo.pdf"})
