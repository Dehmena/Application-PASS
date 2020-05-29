import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../../app-settings';
import {AppUtils} from '../../../app-utils';


export interface InvoiceInterface {
    invoiceNumber: number;
    invoiceDate: string;
    clientNumber: number;
    orderNumber: number;
}

@Component({
    selector: 'app-dialog-create-new-invoice',
    templateUrl: './dialog-create-new-invoice.component.html',
    styleUrls: ['../../database.component.css', './dialog-create-new-invoice.component.css']
})
export class DialogCreateNewInvoiceComponent implements OnInit {

    public dataToInsert: InvoiceInterface;
    public isLoadingInsertData: boolean;

    public updateDate = AppUtils.updateDate;
    public toDate = AppUtils.toDate;

    public limitInput = AppUtils.limitInput;
    public onlyNumber = AppUtils.onlyNumber;
    public pasteOnlyNumber = AppUtils.pasteOnlyNumber;
    public preventWriting = AppUtils.preventWriting;

    constructor(public dialogRef: MatDialogRef<DialogCreateNewInvoiceComponent>,
                public http: HttpClient,
                public snackBar: MatSnackBar) {}

    ngOnInit() {
        this.isLoadingInsertData = false;
        this.dataToInsert = {
            invoiceNumber: null,
            invoiceDate: null,
            clientNumber: null,
            orderNumber: null
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
            this.http.post(AppSettings.URL_BACKEND + '/invoices', formData, {headers, observe: 'response'})
                .subscribe(response => {
                    this.isLoadingInsertData = false;
                    this.dialogRef.close('success');

                }, error => {

                    if (error['status'] == 400) {
                        AppUtils.displaySnackBarError(this.snackBar, 'Ajout impossible : ce numéro de facture existe déjà.', 'OK');
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
        return this.dataToInsert['invoiceNumber'] == null
            || this.dataToInsert['invoiceDate'] == null
            || this.dataToInsert['clientNumber'] == null
            || this.dataToInsert['orderNumber'] == null;
    }
}
