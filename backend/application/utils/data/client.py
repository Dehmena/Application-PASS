import application.database.queries.client as query


class Client:
    """ This class is used to represent a client.

    A client is represented by:
       - A number
       - A name
       - An email address
    """

    def __init__(self, client_number, client_name=None, client_mail=None):
        self.client_number = client_number
        self.client_name = client_name
        self.client_mail = client_mail

    def to_dict(self):
        data = {
            "clientNumber": self.client_number,
            "clientName": self.client_name,
            "clientMail": self.client_mail
        }

        return data

    def get_client_data_from_database(self):
        client_database = query.get_client_by_number(self.client_number)

        if client_database is not None:
            self.client_name = client_database.clientName
            self.client_mail = client_database.mailAddress

    def insert_or_update_if_exists_database(self):
        if query.client_exist_by_number(self.client_number):
            client = query.get_client_by_number(self.client_number)
            query.update_client(client, self.client_number, self.client_name, self.client_mail)
        else:
            query.insert_client(self.client_name, self.client_mail, self.client_number)

