import {Component, OnInit} from '@angular/core';
import {MailTemplateInterface} from '../settings.component';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../app-settings';
import {MatSnackBar} from '@angular/material';
import {AppUtils} from '../../app-utils';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-settings-mail-template',
    templateUrl: './settings-mail-template.component.html',
    styleUrls: ['../settings.component.css', './settings-mail-template.component.css']
})
export class SettingsMailTemplateComponent implements OnInit {

    public mailTemplate: MailTemplateInterface;
    public mailTemplateUpdated: MailTemplateInterface;

    public documentType: string;

    public toolbar = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],

            [{'script': 'sub'}, {'script': 'super'}],

            [{'header': [1, 2, 3, 4, 5, 6, false]}],

            [{'color': []}, {'background': []}],
            ['clean'],

            ['link', 'image']
        ]
    };

    public isGetParametersLoading: boolean;
    public isGetParametersSuccessful: boolean;

    public isEditingMailTemplate: boolean;
    public isUpdateMailTemplateLoading: boolean;

    constructor(public http: HttpClient,
                public snackBar: MatSnackBar,
                public route: ActivatedRoute) {}

    ngOnInit() {
        this.mailTemplate = {
            subject: null,
            body: null
        };

        this.isEditingMailTemplate = false;
        this.isUpdateMailTemplateLoading = false;
        this.documentType = this.route.snapshot.data['documentType'];

        this.isGetParametersLoading = true;
        this.isGetParametersSuccessful = false;

        this.http.get(AppSettings.URL_BACKEND + '/config/template-mail', {observe: 'response'})
            .subscribe(response => {
                this.mailTemplate = response.body[this.documentType] as MailTemplateInterface;
                this.mailTemplateUpdated = Object.assign({}, this.mailTemplate);

                this.isGetParametersLoading = false;
                this.isGetParametersSuccessful = true;

            }, error => {
                if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isGetParametersLoading = false;
                this.isGetParametersSuccessful = false;
            });
    }

    public updateMailTemplate() {
        this.isUpdateMailTemplateLoading = true;

        if (this.mailTemplateUpdated['body'] == null) {
            this.mailTemplateUpdated['body'] = '';
        }
        if (this.mailTemplateUpdated['subject'] == null) {
            this.mailTemplateUpdated['subject'] = '';
        }

        this.mailTemplateUpdated['body'] = this.mailTemplateUpdated['body'].replace(/<p>/g, '<div>');
        this.mailTemplateUpdated['body'] = this.mailTemplateUpdated['body'].replace(/<\/p>/g, '</div>');

        let formData = new FormData();
        formData.append('data', JSON.stringify(this.mailTemplateUpdated));

        let headers = new HttpHeaders({
            'enctype': 'multipart/form-data'
        });

        this.http.put(AppSettings.URL_BACKEND + '/config/template-mail/' + this.documentType, formData, {headers, observe: 'response'})
            .subscribe(response => {
                this.isUpdateMailTemplateLoading = false;
                this.isEditingMailTemplate = false;

                this.mailTemplate = Object.assign({}, this.mailTemplateUpdated);

                AppUtils.displaySnackBar(this.snackBar, 'Le modèle d\'e-mail pour les ' + AppUtils.translateDataType(this.documentType)
                                                                + ' a bien été mis à jour.', 'OK');
            }, error => {
                if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isUpdateMailTemplateLoading = false;
            });
    }

    public toggleEditModeMailTemplate() {
        this.isEditingMailTemplate = !this.isEditingMailTemplate;
        this.mailTemplateUpdated = Object.assign({}, this.mailTemplate);
    }
}
