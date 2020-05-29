import datetime
import json
import re
from application.extensions import quote_reminder_scheduler, quote_cancellation_scheduler

CONFIG_JSON_FILE = "application/resources/config.json"
MAIL_SIGNATURE = "application/resources/email/signature.txt"


def get_config_dict():
    with open(CONFIG_JSON_FILE, mode='r', encoding="utf-8") as config_json:
        config = json.load(config_json)
        return config


def update_config_mail_sending_parameters(data):
    config = get_config_dict()
    config['mail_sending_parameters'] = data

    with open(CONFIG_JSON_FILE, 'w', encoding='utf-8') as config_json:
        config_json.write(json.dumps(config, ensure_ascii=False, indent=4))


def update_config_pdf_processing_parameters(data):
    config = get_config_dict()
    config['pdf_processing_parameters'] = data

    with open(CONFIG_JSON_FILE, 'w', encoding='utf-8') as config_json:
        config_json.write(json.dumps(config, ensure_ascii=False, indent=4))


def update_config_other_parameters(data):
    config = get_config_dict()

    if config['other_parameters']['is_quote_reminder_working'] != data['is_quote_reminder_working']:
        __pause_resume_quote_reminder_scheduler(data['is_quote_reminder_working'])

    if config['other_parameters']['is_quote_cancellation_working'] != data['is_quote_cancellation_working']:
        __pause_resume_quote_cancellation_scheduler(data['is_quote_cancellation_working'])

    config['other_parameters'] = data

    with open(CONFIG_JSON_FILE, 'w', encoding='utf-8') as config_json:
        config_json.write(json.dumps(config, ensure_ascii=False, indent=4))


def update_config_backup_number(new_backup_number):
    config = get_config_dict()

    config['current_backup_number'] = new_backup_number

    with open(CONFIG_JSON_FILE, 'w', encoding='utf-8') as config_json:
        config_json.write(json.dumps(config, ensure_ascii=False, indent=4))


def __pause_resume_quote_reminder_scheduler(is_quote_reminder_working):
    if is_quote_reminder_working:
        quote_reminder_scheduler.resume()
    else:
        quote_reminder_scheduler.pause()


def __pause_resume_quote_cancellation_scheduler(is_quote_cancellation_working):
    if is_quote_cancellation_working:
        quote_cancellation_scheduler.resume()
    else:
        quote_cancellation_scheduler.pause()


def get_mail_signature():
    with open(MAIL_SIGNATURE, mode='r', encoding='utf-8') as mail_signature:
        signature = mail_signature.read()
        return signature


def update_signature(data):
    with open(MAIL_SIGNATURE, "w", encoding="utf-8") as mail_signature:
        mail_signature.write(data)


def convert_date_string_to_datetime(date_string):
    """Try to convert a date in string format into datetime with
     one the pattern below.

        %a: Abbreviated weekday name.
        %b: Abbreviated month name.
        %d: Day of the month as a zero-padded decimal.
        %Y: Year with century as a decimal number.

        %H: Hour (24-hour clock) as a zero-padded decimal number.
        %M: Minute as a zero-padded decimal number.
        %S: Second as a zero-padded decimal number.
        %Z: Time zone name.

    :param date_string: (String) A date written with one of the pattern below.
    :return: The date written in input in datetime
    """

    # e.g. 'Mon May 04 2020'
    try:
        date_format = "%a %b %d %Y"
        date = datetime.datetime.strptime(date_string, date_format)
        return date
    except ValueError:
        pass

    # e.g. 'Mon, 04 May 2020 00:00:00 GMT'
    try:
        date_format = "%a, %d %b %Y %H:%M:%S %Z"
        date = datetime.datetime.strptime(date_string, date_format)
        return date
    except ValueError:
        pass

    # e.g. '04/05/2020'
    try:
        date_format = "%d/%m/%Y"
        date = datetime.datetime.strptime(date_string, date_format)
        return date
    except ValueError:
        pass

    # e.g. '04-05-2020'
    try:
        date_format = "%d-%m-%Y"
        date = datetime.datetime.strptime(date_string, date_format)
        return date
    except ValueError:
        pass

    return None


def convert_string_day_month_year_to_datetime(date_string):
    """ Convert a date in string format in the "DD.MM.YYYY" pattern
    into datetime

    :param date_string: (String) The date written with the "DD.MM.YYYY" pattern
    :return: The date written in input in datetime
    """
    date_array = date_string.split('.')

    day = int(date_array[0])
    month = int(date_array[1])
    year = int(date_array[2])

    date = datetime.date(year, month, day)

    return date


def format_date_csv(date):
    day = date[8:]
    month = date[5:-3]
    year = date[:4]

    return day + '/' + month + '/' + year


def list_table_to_dict(list_table):
    return list(map(lambda x: x.to_dict(), list_table))


def is_float(data):
    return data.replace('.', '', 1).isdigit()


def is_date(data):
    date_slash_format = re.search("[0-9]{2}/[0-9]{2}/[0-9]{4}", data)
    date_dash_format = re.search("[0-9]{2}-[0-9]{2}-[0-9]{4}", data)

    return date_dash_format is not None or date_slash_format is not None
