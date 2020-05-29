from application.extensions import db
from application.utils.tools import get_config_dict, update_config_backup_number

import application.utils.csv_operations.quote as quote_csv_operation
import application.utils.csv_operations.order as order_csv_operation
import application.utils.csv_operations.invoice as invoice_csv_operation
import application.utils.csv_operations.client as client_csv_operation
import application.database.queries.log as query_log

import datetime
import os
import re


def backup_data():
    """ Function used in a scheduler to run every month.
    Take information from config.json for :
        - The current backup number
        - The total number of backups
        - The backups saving path

    Saves all data up to date from the database in the backups saving path.

    When the current backup number exceed the total number of backups, it
    cycles back to 0, overwriting the oldest backup saved.

    Data saved:
        - Clients
        - Quotes
        - Orders
        - Invoices
    """
    with db.app.app_context():
        config = get_config_dict()

        current_backup_number = config['current_backup_number']
        number_of_backups = config['other_parameters']['number_of_backups']
        backup_path = config['other_parameters']['save_file_path_backups']

        current_backup_path = backup_path + "\\" + str(current_backup_number)
        try:
            if not os.path.exists(current_backup_path):
                os.mkdir(current_backup_path)

            __delete_previous_backup(current_backup_path)
            __make_data_backup(current_backup_path)

            update_config_backup_number((current_backup_number + 1) % number_of_backups)

            query_log.insert_log('Une sauvegarde des données a été réalisée', 'database')

        except IOError:
            query_log.insert_log('Une erreur est survenue lors de l\'exécution de la sauvegarde des données - '
                                 'Veuillez vérifier le chemin de sauvegarde des backups', 'database', error=True)


def __delete_previous_backup(path):
    for filename in os.listdir(path):
        file_path = os.path.join(path, filename)
        try:
            os.remove(file_path)
        except OSError:
            pass


def __make_data_backup(path):
    today_date = datetime.datetime.today()
    date_backup = today_date.strftime("%d_%m_%Y")

    quote_csv_data = quote_csv_operation.export_data_csv()
    quote_csv_data = re.sub("\r", "", quote_csv_data.getvalue())
    quote_csv_backup_path = path + "\\devis_" + date_backup + ".csv"
    with open(quote_csv_backup_path, 'w') as backup_quote:
        backup_quote.write(quote_csv_data)

    order_csv_data = order_csv_operation.export_data_csv()
    order_csv_data = re.sub("\r", "", order_csv_data.getvalue())
    order_csv_backup_path = path + "\\commandes_" + date_backup + ".csv"
    with open(order_csv_backup_path, 'w') as backup_order:
        backup_order.write(order_csv_data)

    invoice_csv_data = invoice_csv_operation.export_data_csv()
    invoice_csv_data = re.sub("\r", "", invoice_csv_data.getvalue())
    invoice_csv_backup_path = path + "\\factures_" + date_backup + ".csv"
    with open(invoice_csv_backup_path, 'w') as backup_invoice:
        backup_invoice.write(invoice_csv_data)

    client_csv_data = client_csv_operation.export_data_csv()
    client_csv_data = re.sub("\r", "", client_csv_data.getvalue())
    client_csv_backup_path = path + "\\clients_" + date_backup + ".csv"
    with open(client_csv_backup_path, 'w') as backup_client:
        backup_client.write(client_csv_data)
