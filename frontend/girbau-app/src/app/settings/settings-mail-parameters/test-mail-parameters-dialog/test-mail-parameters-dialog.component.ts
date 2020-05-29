import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../../app-settings';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {AppUtils} from '../../../app-utils';

@Component({
    selector: 'app-test-mail-parameters-dialog',
    templateUrl: './test-mail-parameters-dialog.component.html',
    styleUrls: ['./test-mail-parameters-dialog.component.css']
})
export class TestMailParametersDialogComponent implements OnInit {

    public receiverAddressTestSendingMail: string = '';
    public isTestingMail: boolean;
    public isTestMailDone: boolean;

    constructor(public dialogRef: MatDialogRef<TestMailParametersDialogComponent>,
                public http: HttpClient,
                public snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.isTestingMail = false;
        this.isTestMailDone = false;
    }

    public closeDialog() {
        this.dialogRef.close();
    }

    public testSendingMail() {
        this.isTestMailDone = false;

        if (this.receiverAddressTestSendingMail === '' || this.receiverAddressTestSendingMail == null) {
            AppUtils.displaySnackBarError(this.snackBar, 'Veuillez remplir l\'adresse e-mail de test.', 'OK');
        } else {
            this.isTestingMail = true;

            let formData = new FormData();
            formData.append('data', JSON.stringify({'receiver_mail': this.receiverAddressTestSendingMail}));

            let headers = new HttpHeaders({
                'enctype': 'multipart/form-data'
            });
            let request = this.http.post(AppSettings.URL_BACKEND + '/config/test-mail-sending-parameters', formData, {headers, observe: 'response'})
                .subscribe(response => {
                    AppUtils.displaySnackBar(this.snackBar, 'Envoi d\'un e-mail automatique réussi', 'OK');

                    this.isTestingMail = false;
                    this.isTestMailDone = true;
                }, error => {

                    if (error['status'] == 400) {
                        if (error['error']['code'] == 1) {
                            AppUtils.displaySnackBarError(this.snackBar, 'Erreur d\'authentification. Veuillez vérifier l\'adresse e-mail d\'envoi et le mot de passe.', 'OK');
                        } else if (error['error']['code'] == 2) {
                            AppUtils.displaySnackBarError(this.snackBar, 'Erreur Serveur SMTP. Veuillez vérifier le nom du serveur SMTP et le numéro de port.', 'OK');
                        } else if (error['error']['code'] == 3) {
                            AppUtils.displaySnackBarError(this.snackBar, 'Erreur adresse d\'envoi. Veuillez vérifier l\'adresse pour le test de l\'envoi automatique d\'e-mail.', 'OK');
                        } else {
                            AppUtils.displaySnackBarError(this.snackBar, 'Erreur. Veuillez vérifier les paramètres d\'envoi d\'e-mail et si l\'adresse e-mail de réception est valide.', 'OK');
                        }
                    } else {
                        if (error['status'] == 0) {
                            AppUtils.displaySnackBarErrorConnection(this.snackBar);
                        } else {
                            AppUtils.displaySnackBarErrorServeur(this.snackBar);
                        }
                    }
                    this.isTestMailDone = true;
                    this.isTestingMail = false;
                });

            setTimeout(() => {
                if(!this.isTestMailDone) {
                    request.unsubscribe();
                    this.isTestingMail = false;
                    AppUtils.displaySnackBarError(this.snackBar, 'Erreur. Veuillez vérifier les paramètres d\'envoi d\'e-mail et si l\'adresse e-mail de réception est valide.', 'OK');
                }
            }, 15000);
        }
    }
}
