import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';

export interface MailParameterInterface{
    smtp_server: number;
    smtp_port: number;
    sender_address: string;
    sender_password: string;
}

export interface PdfProcessingParameterInterface{
    regex_quote: string;
    regex_order: string;
    regex_invoice: string;
    save_file_path_archive: string;
    save_file_path_reminder: string;
}

export interface OtherParametersInterface{
    add_girbau_logo_pdf: boolean;
    is_quote_reminder_working: boolean;
    is_quote_cancellation_working: boolean;
    days_before_first_reminder: number;
    days_before_second_reminder: number;
    days_before_quote_cancellation: number;
    max_number_of_logs: number;
    number_of_backups: number;
    save_file_path_backups: string;
}

export interface MailTemplateInterface{
    subject: string;
    body: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    public nameParameter: string;

    constructor(public http: HttpClient,
                public route: ActivatedRoute) {
        route.url.subscribe(() => {
            this.nameParameter = route.snapshot.firstChild.data['name'];
        });
    }

    ngOnInit() {}
}

