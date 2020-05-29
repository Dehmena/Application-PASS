import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../../app-settings';
import {AppUtils} from '../../../app-utils';

export interface ClientInterface {
    clientNumber: number;
    clientName: string;
    clientMail: string;
}

@Component({
    selector: 'app-dialog-create-new-client',
    templateUrl: './dialog-create-new-client.component.html',
    styleUrls: ['../../database.component.css', './dialog-create-new-client.component.css']
})
export class DialogCreateNewClientComponent implements OnInit {

    public dataToInsert: ClientInterface;
    public isLoadingInsertData: boolean;

    public limitInput = AppUtils.limitInput;
    public onlyNumber = AppUtils.onlyNumber;
    public pasteOnlyNumber = AppUtils.pasteOnlyNumber;

    constructor(public dialogRef: MatDialogRef<DialogCreateNewClientComponent>,
                public http: HttpClient,
                public snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.isLoadingInsertData = false;
        this.dataToInsert = {
            clientNumber: null,
            clientName: null,
            clientMail: null
        };
    }

    public closeDialog() {
        this.dialogRef.close();
    }

    public addData() {
        if (this.isRequiredInformationMissing()) {
            AppUtils.displaySnackBarError(this.snackBar, 'Veuillez remplir les champs requis.', 'OK');
        } else {
            this.isLoadingInsertData = true;

            let formData = new FormData();
            formData.append('data', JSON.stringify(this.dataToInsert));

            const headers = new HttpHeaders({'enctype': 'multipart/form-data'});
            this.http.post(AppSettings.URL_BACKEND + '/clients', formData, {headers, observe: 'response'})
                .subscribe(response => {
                    this.dialogRef.close('success');

                }, error => {

                    if (error['status'] == 400) {
                        AppUtils.displaySnackBarError(this.snackBar, 'Ajout impossible : ce numéro de client existe déjà.', 'OK');
                    } else if (error['status'] == 0) {
                        AppUtils.displaySnackBarErrorConnection(this.snackBar);
                    } else {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }
                    this.isLoadingInsertData = false;
                });
        }
    }

    public isRequiredInformationMissing() {
        return this.dataToInsert['clientNumber'] == null
            || this.dataToInsert['clientName'] == null
            || this.dataToInsert['clientName'] == ''
            || this.dataToInsert['clientMail'] == null
            || this.dataToInsert['clientMail'] == '';

    }
}
