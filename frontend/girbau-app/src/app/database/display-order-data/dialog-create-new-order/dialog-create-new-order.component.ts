import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../../app-settings';
import {AppUtils} from '../../../app-utils';


export interface OrderInterface {
    orderNumber: number;
    orderDate: string;
    orderTotalAmount: number;
    clientNumber: number;
    quoteNumber: number;
}


@Component({
    selector: 'app-dialog-create-new-order',
    templateUrl: './dialog-create-new-order.component.html',
    styleUrls: ['../../database.component.css', './dialog-create-new-order.component.css']
})
export class DialogCreateNewOrderComponent implements OnInit {

    public dataToInsert: OrderInterface;
    public isLoadingInsertData: boolean;

    public updateDate = AppUtils.updateDate;
    public toDate = AppUtils.toDate;

    public limitInput = AppUtils.limitInput;
    public onlyNumber = AppUtils.onlyNumber;
    public onlyFloat = AppUtils.onlyFloat;
    public pasteOnlyNumber = AppUtils.pasteOnlyNumber;
    public pasteOnlyFloat = AppUtils.pasteOnlyFloat;
    public preventWriting = AppUtils.preventWriting;

    constructor(public dialogRef: MatDialogRef<DialogCreateNewOrderComponent>,
                public http: HttpClient,
                public snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.isLoadingInsertData = false;
        this.dataToInsert = {
            orderNumber: null,
            orderDate: null,
            orderTotalAmount: null,
            clientNumber: null,
            quoteNumber: null
        };
    }

    public closeDialog() {
        this.dialogRef.close();
    }

    public addData() {
        if (this.isRequiredInformationMissing()) {
            AppUtils.displaySnackBarError(this.snackBar,'Veuillez remplir les champs requis.', 'OK');
        } else {
            this.isLoadingInsertData = true;

            let formData = new FormData();
            formData.append('data', JSON.stringify(this.dataToInsert));

            const headers = new HttpHeaders({'enctype': 'multipart/form-data'});
            this.http.post(AppSettings.URL_BACKEND + '/orders', formData, {headers, observe: 'response'})
                .subscribe(response => {
                    this.isLoadingInsertData = false;
                    this.dialogRef.close('success');

                }, error => {

                    if (error['status'] == 400) {
                        AppUtils.displaySnackBarError(this.snackBar, 'Ajout impossible : ce numéro de commande existe déjà.', 'OK');
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
        return this.dataToInsert['orderNumber'] == null
            || this.dataToInsert['orderDate'] == null
            || this.dataToInsert['orderTotalAmount'] == null
            || this.dataToInsert['clientNumber'] == null;
    }
}
