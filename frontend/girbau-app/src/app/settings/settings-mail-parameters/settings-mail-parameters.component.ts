import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../app-settings';
import {MailParameterInterface} from '../settings.component';
import {MatDialog, MatSnackBar, MatTooltip} from '@angular/material';
import {TestMailParametersDialogComponent} from './test-mail-parameters-dialog/test-mail-parameters-dialog.component';
import {AppUtils} from '../../app-utils';


@Component({
    selector: 'app-settings-mail-parameters',
    templateUrl: './settings-mail-parameters.component.html',
    styleUrls: ['../settings.component.css', './settings-mail-parameters.component.css']
})
export class SettingsMailParametersComponent implements OnInit {

    public mailParameters: MailParameterInterface;
    public mailParametersUpdated: MailParameterInterface;

    public isGetParametersLoading: boolean;
    public isGetParametersSuccessful: boolean;

    public isEditingMailParameters: boolean;
    public isUpdateMailParametersLoading: boolean;

    public tooltipLoginMail: string = 'L\'adresse e-mail à partir de laquelle les e-mails automatiques vont être envoyés.\n\n' +
        'L\'adresse e-mail et le mot de passe permettent de se connecter au service de messagerie défini par ' +
        'le serveur et le port SMTP.\n\n' +
        'Après modification de ces paramètres, pensez à tester l\'envoi d\'e-mail automatique.';

    public tooltipServerSMTP: string = 'Le serveur et le port SMTP dépendent du service de messagerie utilisé (Outlook, Gmail, etc...).\n\n' +
        'Vous pouvez trouver ces informations en tapant sur un moteur de recherche ' +
        '"serveur smtp" suivi du service de messagerie souhaité.\n\n' +
        'Le serveur et le port SMTP choisis doivent utiliser le type de chiffrement StartTLS ou TLS.';

    public dashIfEmpty = AppUtils.dashIfEmpty;

    public limitInput = AppUtils.limitInput;
    public onlyNumber = AppUtils.onlyNumber;
    public pasteOnlyNumber = AppUtils.pasteOnlyNumber;

    @ViewChild('tooltipLogin', {static: true}) tooltipLogin: MatTooltip;
    @ViewChild('tooltipSMTP', {static: true}) tooltipSMTP: MatTooltip;

    constructor(public http: HttpClient,
                public snackBar: MatSnackBar,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        this.mailParameters = {
            smtp_server: null,
            smtp_port: null,
            sender_address: null,
            sender_password: null
        };

        this.isGetParametersLoading = true;
        this.isGetParametersSuccessful = false;

        this.isEditingMailParameters = false;
        this.isUpdateMailParametersLoading = false;


        this.http.get(AppSettings.URL_BACKEND + '/config', {observe: 'response'})
            .subscribe(response => {
                this.mailParameters = response.body['mail_sending_parameters'] as MailParameterInterface;
                this.mailParametersUpdated = Object.assign({}, this.mailParameters);

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

    public updateMailParameters() {
        this.isUpdateMailParametersLoading = true;

        let formData = new FormData();
        formData.append('data', JSON.stringify(this.mailParametersUpdated));

        let headers = new HttpHeaders({
            'enctype': 'multipart/form-data'
        });
        this.http.put(AppSettings.URL_BACKEND + '/config/mail-sending-parameters', formData, {headers, observe: 'response'})
            .subscribe(response => {
                this.mailParameters = Object.assign({}, this.mailParametersUpdated);

                this.isUpdateMailParametersLoading = false;
                this.isEditingMailParameters = false;

                AppUtils.displaySnackBar(this.snackBar, 'Les paramètres d\'envoi de mail ont bien été mis à jour.', 'OK');
            }, error => {
                if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isUpdateMailParametersLoading = false;
            });
    }

    public hidePassword(password: string){
        if(password == null || password === '') return '-';

        return '●●●●●●';
    }

    public toggleEditModeMailParameters() {
        this.isEditingMailParameters = !this.isEditingMailParameters;
        this.mailParametersUpdated = Object.assign({}, this.mailParameters);
    }


    public openDialogTestMailParameters() {
        this.dialog.open(TestMailParametersDialogComponent, {
            panelClass:['no-padding-dialog', 'min-width-dialog-450'],
            width: '450px',
            height: '200px',
            disableClose: true
        });
    }

    public toggleTooltipLogin() {
        this.tooltipLogin.toggle();
    }

    public isTooltipLoginVisible() {
        return this.tooltipLogin._isTooltipVisible();
    }

    public toggleTooltipSMTP() {
        this.tooltipSMTP.toggle();
    }

    public isTooltipSMTPVisible() {
        return this.tooltipSMTP._isTooltipVisible();
    }

}
