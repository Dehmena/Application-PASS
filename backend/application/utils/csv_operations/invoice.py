from application.utils.tools import is_date, convert_date_string_to_datetime
import application.database.queries.invoice as query_invoice
import application.database.queries.log as query_log
from application.utils.tools import format_date_csv

import io
import csv

NUMBER_OF_CSV_HEADERS = 4


def export_data_csv():
    """ Build a CSV file with the Invoice data from the database

    :return: The CSV file in StringIO
    """

    result = query_invoice.get_all_invoices()

    output = io.StringIO()
    writer = csv.writer(output)

    line = ['Numéro de facture', 'Date', 'Numéro client', 'Référence commande']
    writer.writerow(line)

    for row in result:
        date = format_date_csv(str(row.invoiceDate)[:10])
        line = [str(row.invoiceNumber), date, str(row.clientNumber), str(row.orderNumber)]
        writer.writerow(line)

    output.seek(0)

    return output


def import_data_csv(data_to_insert, data_to_update, keep_database):
    """ Import Invoice data into the database from a CSV file that has been
    processed by the function 'process_csv' below.

    Insert new data or update existing one.

    If the boolean 'keep_database' is False, the data imported completely
    overwrite current data in the database.


    :param data_to_insert: Array of Invoice data to insert into the database
                            (cf. Section VIII - C in Documentation backend routes)

    :param data_to_update: Array of Invoice data to update in the database
                            (cf. Section VIII - C in Documentation backend routes)

    :param keep_database: Boolean used to delete the database or not before importing the data
    """

    if not keep_database:
        query_invoice.delete_all_invoices()

    invoice_formatted = []
    for invoice in data_to_insert:
        new_invoice = dict(invoiceNumber=invoice['number'],
                           invoiceDate=convert_date_string_to_datetime(invoice['date']),
                           clientNumber=invoice['clientNumber'],
                           orderNumber=invoice['orderNumber'])
        invoice_formatted.append(new_invoice.copy())

    query_invoice.bulk_insert_invoices(invoice_formatted)

    for invoice in data_to_update:
        invoice_to_update = query_invoice.get_invoice_by_number(invoice['number'])
        if invoice_to_update is not None:
            query_invoice.update_invoice(invoice_to_update, invoice['number'],
                                         convert_date_string_to_datetime(invoice['date']),
                                         invoice['orderNumber'], invoice['clientNumber'])

    if keep_database:
        query_log.insert_log('Des données ont été ajoutées et/ou remplacées dans la base de données de factures',
                             'database')
    else:
        query_log.insert_log('La base de données de factures à été supprimée et remplacée par une autre', 'database')


def process_csv(csv_data, keep_database):
    """ Loop through every rows of the csv_data extracted from a CSV file
    to check the data's validity.

    The rules to check the data's validity can be found in the functions below.

    (cf. Section VIII - B in Documentation backend routes)

    If the boolean 'keep_database' is True, the function will also check for
    conflicts between the current database and the data in the CSV.
    If 'keep_database' is False, the current database will be overwritten so
    it doesn't need to check for conflicts.

    :param csv_data: The CSV data in string format extracted from a CSV file
    :param keep_database: A boolean used to know if the function needs to check for conflicts
    :return: (cf. Section VIII - B in Documentation backend routes)
    """

    csv_has_error = False

    rows = csv_data.split('\r\n')

    headers = rows[0].split(',')
    if len(headers) != NUMBER_OF_CSV_HEADERS:
        return {
                   'code': 0,
                   'message': 'The number of headers does not match the number of data required for this dataset'
               }, True

    else:
        data_csv = []
        errors = []
        data_numbers = set()

        total_number_of_data = len(rows) - 1
        for i in range(1, len(rows)):
            data = rows[i].split(',')

            error_line = {
                'line': i + 1,
                'messages': []
            }
            check_data_result = __check_data(data, data_numbers, error_line)

            error_line = check_data_result[0]
            csv_has_error = csv_has_error or check_data_result[1]

            errors.append(error_line)

            if not (data[0] == '' and len(data) == 1):
                data_numbers.add(data[0])

                if not csv_has_error:
                    data_csv.append({
                        'number': int(data[0]),
                        'date': convert_date_string_to_datetime(data[1]),
                        'clientNumber': int(data[2]),
                        'orderNumber': int(data[3])
                    })
            else:
                total_number_of_data -= 1

        if csv_has_error:
            return {
                       'code': 1,
                       'message': 'The CSV contains errors.',
                       'data': errors
                   }, True

        else:
            if keep_database:
                result = __check_for_conflicts(data_csv)
                data_csv = result[0]
                conflicts = result[1]

                has_conflicts = len(conflicts) > 0
                if has_conflicts:
                    return {
                               'hasConflicts': True,
                               'totalNumberOfData': total_number_of_data,
                               'data': {
                                   'conflicts': conflicts,
                                   'dataToInsert': data_csv
                               }
                           }, False

            return {
                       'hasConflicts': False,
                       'totalNumberOfData': total_number_of_data,
                       'data': data_csv
                   }, False


def __check_data(data, data_numbers, error_line):
    """ Function to check data's validity.

    Rules checked in this function:
        - Check if the number of data in the row is the same as the number of headers
        - Check if the invoice number hasn't already been seen in the CSV file

    :param data: The data to check.
    :param data_numbers: A set with all invoice numbers already seen, used to check for doubles in the CSV file.
    :param error_line: A dictionary with the line number and all error message associated with this line.
    :return: A tuple with the error_line and a boolean signaling if this line has errors.
    """

    data_has_error = False

    if data[0] == '' and len(data) == 1:
        return error_line, False

    if len(data) != NUMBER_OF_CSV_HEADERS:
        error_line['messages'].append('Le nombre de données sur cette ligne ne correspond pas au '
                                      'nombre de colonnes.')
        return error_line, True

    if data[0] in data_numbers:
        error_line['messages'].append('Ce numéro de facture existe déjà dans le CSV.')
        return error_line, True

    result = __check_if_required_data_are_missing(data, error_line)
    error_line = result[0]
    data_has_error = data_has_error or result[1]

    result = __check_if_data_type_are_valid(data, error_line)
    error_line = result[0]
    data_has_error = data_has_error or result[1]

    result = __check_if_data_length_are_valid(data, error_line)
    error_line = result[0]
    data_has_error = data_has_error or result[1]

    return error_line, data_has_error


def __check_if_required_data_are_missing(data, error_line):
    """ Check if required data for this dataset are missing.

    Rules checked in this function:
        - Check if the invoice's number isn't missing.
        - Check if the invoice's date isn't missing.
        - Check if the invoice's client number isn't missing.
        - Check if the invoice's order reference isn't missing.

    :param data: The data to check.
    :param error_line: A dictionary with the line number and all error message associated with this line.
    :return: A tuple with the error_line and a boolean signaling if this line has errors.
    """

    data_has_error = False

    if data[0] is None or data[0] == '':
        error_line['messages'].append('Champ "Numéro de facture" vide. Ce champ est requis.')
        data_has_error = True

    if data[1] is None or data[1] == '':
        error_line['messages'].append('Champ "Date" vide. Ce champ est requis.')
        data_has_error = True

    if data[2] is None or data[2] == '':
        error_line['messages'].append('Champ "Numéro client" vide. Ce champ est requis.')
        data_has_error = True

    if data[3] is None or data[3] == '':
        error_line['messages'].append('Champ "Référence commande" vide. Ce champ est requis.')
        data_has_error = True

    return error_line, data_has_error


def __check_if_data_type_are_valid(data, error_line):
    """ Check if the data type for this dataset are valid.

    Rules checked in this function:
        - Check if the invoice's number is an integer
        - Check if the invoice's date is of either pattern 'DD/MM/YYYY' or 'DD-MM-YYYY'
        - Check if the invoice's client number is an integer
        - Check if the invoice's order reference is an integer

    :param data: The data to check.
    :param error_line: A dictionary with the line number and all error message associated with this line.
    :return: A tuple with the error_line and a boolean signaling if this line has errors.
    """

    data_has_error = False

    if not data[0].isnumeric() and data[0] != '':
        error_line['messages'].append(
            'Type du champ "Numéro de facture" invalide. Ce champ doit être un nombre entier.')
        data_has_error = True

    if not is_date(data[1]) and data[1] != '':
        error_line['messages'].append(
            'Format du champ "Date" invalide. La date doit être au format DD/MM/YYYY ou DD-MM-YYYY.')
        data_has_error = True

    if not data[2].isnumeric() and data[2] != '':
        error_line['messages'].append('Type du champ "Numéro client" invalide. Ce champ doit être un nombre entier.')
        data_has_error = True

    if not data[3].isnumeric() and data[3] != '':
        error_line['messages'].append(
            'Type du champ "Référence commande" invalide. Ce champ doit être un nombre entier.')
        data_has_error = True

    return error_line, data_has_error


def __check_if_data_length_are_valid(data, error_line):
    """ Check if the length of the data are valid.

    Rules checked in this function:
        - Check if the invoice's number is not longer than 15 characters
        - Check if the invoice's client number is not longer than 15 characters
        - Check if the invoice's order reference is not longer than 15 characters

    :param data: The data to check.
    :param error_line: A dictionary with the line number and all error message associated with this line.
    :return: A tuple with the error_line and a boolean signaling if this line has errors.
    """

    data_has_error = False

    if len(data[0]) > 15:
        error_line['messages'].append('Champ "Numéro de facture" trop long. Ce champ est limité à 15 caractères.')
        data_has_error = True

    if len(data[2]) > 15:
        error_line['messages'].append('Champ "Numéro client" trop long. Ce champ est limité à 15 caractères.')
        data_has_error = True

    if len(data[3]) > 15:
        error_line['messages'].append('Champ "Référence commande" trop long. Ce champ est limité à 15 caractères.')
        data_has_error = True

    return error_line, data_has_error


def __check_for_conflicts(data):
    """ Check the data for conflicts.

    If an invoice in the CSV file has the same number than an invoice
    in the current database, it create a conflicts that needs to be
    resolved.

    :param data: The data to check
    :return: (cf. Section VIII - B in Documentation backend routes)
    """

    conflicts = []

    temp_data = data.copy()
    for invoice in temp_data:
        invoice_database = query_invoice.get_invoice_by_number(invoice['number'])

        if invoice_database is not None:
            data.remove(invoice)

            if not __is_the_same_data(invoice, invoice_database):
                conflicts.append({
                    'csv': invoice,
                    'database': {
                        'number': invoice_database.invoiceNumber,
                        'date': invoice_database.invoiceDate,
                        'clientNumber': invoice_database.clientNumber,
                        'orderNumber': invoice_database.orderNumber
                    }
                })

    return data, conflicts


def __is_the_same_data(data, data_in_database):
    return data['number'] == data_in_database.invoiceNumber \
           and data['date'] == data_in_database.invoiceDate \
           and data['clientNumber'] == data_in_database.clientNumber \
           and data['orderNumber'] == data_in_database.orderNumber
