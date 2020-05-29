from application.extensions import db
from datetime import datetime as dt

"""     TABLES      """


class ClientTable(db.Model):
    __tablename__ = 'clientTable'
    idClient = db.Column(db.Integer,
                         primary_key=True)
    clientNumber = db.Column(db.Integer,
                             unique=False,
                             nullable=False)
    clientName = db.Column(db.String(100),
                           unique=False,
                           nullable=False)
    mailAddress = db.Column(db.String(100),
                            unique=False,
                            nullable=False)

    def to_dict(self):
        return {
            "idClient": self.idClient,
            "clientNumber": self.clientNumber,
            "clientName": self.clientName,
            "clientMail": self.mailAddress
        }

    @staticmethod
    def get_field_from_name(name):
        if name == "clientNumber":
            return ClientTable.clientNumber
        if name == "clientName":
            return ClientTable.clientName


class InvoiceTable(db.Model):
    __tablename__ = 'invoiceTable'
    idInvoice = db.Column(db.Integer,
                          primary_key=True)
    invoiceNumber = db.Column(db.Integer,
                              unique=False,
                              nullable=False)
    invoiceDate = db.Column(db.DateTime,
                            nullable=False)
    clientNumber = db.Column(db.Integer,
                             unique=False,
                             nullable=False)
    orderNumber = db.Column(db.Integer,
                            unique=False,
                            nullable=False)

    def to_dict(self):
        return {
            "idInvoice": self.idInvoice,
            "invoiceNumber": self.invoiceNumber,
            "invoiceDate": self.invoiceDate,
            "clientNumber": self.clientNumber,
            "orderNumber": self.orderNumber
        }

    @staticmethod
    def get_field_from_name(name):
        if name == "invoiceNumber":
            return InvoiceTable.invoiceNumber


class OrderTable(db.Model):
    __tablename__ = 'orderTable'
    idOrder = db.Column(db.Integer,
                        primary_key=True)
    orderNumber = db.Column(db.Integer,
                            unique=False,
                            nullable=False)
    orderDate = db.Column(db.DateTime,
                          nullable=False)
    orderTotalAmount = db.Column(db.Float,
                                 unique=False)
    clientNumber = db.Column(db.Integer,
                             unique=False,
                             nullable=False)
    quoteNumber = db.Column(db.Integer,
                            unique=False,
                            nullable=True)

    def to_dict(self):
        return {
            "idOrder": self.idOrder,
            "orderNumber": self.orderNumber,
            "orderDate": self.orderDate,
            "orderTotalAmount": self.orderTotalAmount,
            "clientNumber": self.clientNumber,
            "quoteNumber": self.quoteNumber
        }

    @staticmethod
    def get_field_from_name(name):
        if name == "orderNumber":
            return OrderTable.orderNumber


class QuoteTable(db.Model):
    __tablename__ = 'quoteTable'
    idQuote = db.Column(db.Integer,
                        primary_key=True)
    quoteNumber = db.Column(db.Integer,
                            unique=False,
                            nullable=False)
    quoteDate = db.Column(db.DateTime,
                          nullable=False)
    quoteTotalAmount = db.Column(db.Float,
                                 unique=False)
    quoteState = db.Column(db.Enum('waiting', 'validated', 'cancelled'),
                           unique=False,
                           nullable=False)
    clientNumber = db.Column(db.Integer,
                             unique=False,
                             nullable=False)
    quotePdfName = db.Column(db.String(200),
                             unique=False,
                             nullable=True,
                             default=None)
    hasFirstReminder = db.Column(db.Boolean,
                                 unique=False,
                                 nullable=False,
                                 default=False)
    hasSecondReminder = db.Column(db.Boolean,
                                  unique=False,
                                  nullable=False,
                                  default=False)

    def to_dict(self):
        return {
            "idQuote": self.idQuote,
            "quoteNumber": self.quoteNumber,
            "quoteDate": self.quoteDate,
            "quoteTotalAmount": self.quoteTotalAmount,
            "quoteState": self.quoteState,
            "clientNumber": self.clientNumber,
            "quotePdfName": self.quotePdfName,
            "hasFirstReminder": self.hasFirstReminder,
            "hasSecondReminder": self.hasSecondReminder
        }

    @staticmethod
    def get_field_from_name(name):
        if name == "quoteNumber":
            return QuoteTable.quoteNumber
        if name == "quoteState":
            return QuoteTable.quoteState


class LogTable(db.Model):
    __tablename__ = 'logTable'
    idLog = db.Column(db.Integer,
                      primary_key=True)
    dateLog = db.Column(db.DateTime,
                        default=dt.now,
                        nullable=False)
    typeLog = db.Column(
        db.Enum('pdf-processing', 'database', 'settings', 'unarchive', 'scheduler', 'quote_cancellation_scheduler'),
        unique=False,
        nullable=False)
    message = db.Column(db.String(200),
                        unique=False,
                        nullable=False)
    error = db.Column(db.Boolean,
                      unique=False,
                      nullable=False)

    def to_dict(self):
        return {
            "idLog": self.idLog,
            "dateLog": self.dateLog,
            "typeLog": self.typeLog,
            "message": self.message,
            "error": self.error
        }
