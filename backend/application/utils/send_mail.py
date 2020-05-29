import smtplib
import ssl

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

from .tools import get_config_dict

MAIL_SIGNATURE = "application/resources/email/signature.txt"


def send_email_to_client(client_email_address, email_subject, email_body, pdf_file, pdf_filename):
    smtp_server = connect_to_smtp_server()
    send_mail(smtp_server, client_email_address, email_subject, email_body, pdf_file, pdf_filename)

    smtp_server.quit()


def connect_to_smtp_server():
    """ Connect to a SMTP server in StartTLS using information found in config.json

    Information needed from config.json:
        - SMTP Server name
        - SMTP Port
        - Sender's email address
        - Sender's password

    :return: The SMTP server with the connection established
    """
    config = get_config_dict()

    smtp_server = config['mail_sending_parameters']['smtp_server']
    smtp_port = config['mail_sending_parameters']['smtp_port']
    server = smtplib.SMTP(smtp_server, smtp_port)

    context = ssl.create_default_context()
    server.starttls(context=context)

    sender_email = config['mail_sending_parameters']['sender_address']
    sender_password = config['mail_sending_parameters']['sender_password']
    server.login(sender_email, sender_password)

    return server


def send_mail(smtp_server, receiver_email, email_subject, email_body, pdf_file, pdf_filename):
    """ Send an email with a PDF file in attachment via a SMTP server.

    :param smtp_server: The SMTP server with a connection established
    :param receiver_email: The receiver's email address
    :param email_subject: The email's subject
    :param email_body: The email's main content
    :param pdf_file: The PDF file to send in attachment
    :param pdf_filename: The name of the PDF file sent in attachment
    """
    config = get_config_dict()

    sender_email = config['mail_sending_parameters']['sender_address']
    email_signature = __get_mail_signature()

    message = __build_message_to_send(sender_email, receiver_email, email_subject, email_body, email_signature,
                                      pdf_file, pdf_filename)

    smtp_server.sendmail(sender_email, receiver_email, message.as_string())


def __build_message_to_send(sender_email, receiver_email, subject, body, signature, pdf_file, pdf_filename):
    message = MIMEMultipart()

    message['Subject'] = subject
    message['From'] = sender_email
    message['To'] = receiver_email

    msg_alternative = MIMEMultipart('alternative')
    message.attach(msg_alternative)

    message_body = MIMEText(body + "<br /> " + signature, 'html')

    pdf_attachment = MIMEApplication(pdf_file.read(), _subtype='pdf')
    pdf_attachment.add_header('content-disposition', 'attachment', filename=pdf_filename)

    msg_alternative.attach(message_body)
    message.attach(pdf_attachment)

    return message


def __get_mail_signature():
    with open(MAIL_SIGNATURE, "r", encoding="utf-8") as mail_signature:
        signature = mail_signature.read()
        return signature


def test_send_mail(receiver_email_address):
    smtp_server = connect_to_smtp_server()

    config = get_config_dict()
    sender_email = config['mail_sending_parameters']['sender_address']

    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = receiver_email_address
    message['Subject'] = "Test des paramètres d'envoi d'email automatique"

    message.attach(MIMEText("Si vous avez reçu cet e-mail, les paramètres d'envoi d'e-mail automatique sont valides !",
                            "plain"))

    smtp_server.sendmail(sender_email, receiver_email_address, message.as_string())
    smtp_server.quit()
