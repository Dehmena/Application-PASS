## Frontend

"npm install" pour avoir tous les nodes modules.


## Backend

"pip install -r requirements.txt" pour avoir toutes les librairies python.1

## Config.json

```json
{
    "mail_sending_parameters": {
        "sender_address": "",
        "sender_password": "",
        "smtp_port": 587,
        "smtp_server": "SMTP.office365.com"
    },
    "pdf_processing_parameters": {
        "regex_invoice": "FACTURE",
        "regex_order": "CONF.COMMANDEPIÈCESDÉTACHÉES",
        "regex_quote": "OFFREPIÈCESDÉTACHÉES",
        "save_file_path_archive": "",
        "save_file_path_reminder": ""
    },
    "other_parameters": {
        "add_girbau_logo_pdf": true,
        "days_before_first_reminder": 7,
        "days_before_quote_cancellation": 30,
        "days_before_second_reminder": 21,
        "is_quote_cancellation_working": false,
        "is_quote_reminder_working": false,
        "max_number_of_logs": 1000,
        "number_of_backups": 6,
        "save_file_path_backups": ""
    },
    "current_backup_number": 0
}
```