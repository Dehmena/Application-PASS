import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../../app-settings';
import {AppUtils} from '../../../app-utils';


export interface QuoteInterface {
    quoteNumber: number;
    quoteDate: string;
    quoteTotalAmount: number;
    clientNumber: number;
}

@Component({
    selector: 'app-dialog-create-new-quote',
    templateUrl: './dialog-create-new-quote.component.html',
    styleUrls: ['../../database.component.css', './dialog-create-new-quote.component.css']
})

export class DialogCreateNewQuoteComponent implements OnInit {

    public dataToInsert: QuoteInterface;
    public isLoadingInsertData: boolean;

    public updateDate = AppUtils.updateDate;
    public toDate = AppUtils.toDate;

    public limitInput = AppUtils.limitInput;
    public onlyNumber = AppUtils.onlyNumber;
    public onlyFloat = AppUtils.onlyFloat;
    public pasteOnlyNumber = AppUtils.pasteOnlyNumber;
    public pasteOnlyFloat = AppUtils.pasteOnlyFloat;
    public preventWriting = AppUtils.preventWriting;

    constructor(public dialogRef: MatDialogRef<DialogCreateNewQuoteComponent>,
                public http: HttpClient,
                public snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.isLoadingInsertData = false;
        this.dataToInsert = {
            quoteNumber: null,
            quoteDate: null,
            quoteTotalAmount: null,
            clientNumber: null,
        };
    }

    public closeDialog() {
        this.dialogRef.close();
    }

    public addData() {
        if(this.isRequiredInformationMissing()){
            AppUtils.displaySnackBarError(this.snackBar, 'Veuillez remplir les champs requis.', 'OK');
        }
        else {
            this.isLoadingInsertData = true;

            let formData = new FormData();
            formData.append('data', JSON.stringify(this.dataToInsert));

            const headers = new HttpHeaders({'enctype': 'multipart/form-data'});
            this.http.post(AppSettings.URL_BACKEND + '/quotes', formData, {headers, observe: 'response'})
                .subscribe(response => {
                    this.isLoadingInsertData = false;
                    this.dialogRef.close("success");

                }, error => {

                    if (error['status'] == 400) {
                        AppUtils.displaySnackBarError(this.snackBar, 'Ajout impossible : ce numéro de devis existe déjà.', 'OK');
                    } else if (error['status'] == 0) {
                        AppUtils.displaySnackBarErrorConnection(this.snackBar);
                    } else {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }
                    this.isLoadingInsertData = false;
                });
        }
    }

    public isRequiredInformationMissing(){
        return this.dataToInsert['quoteNumber'] == null
            || this.dataToInsert['quoteDate'] == null
            || this.dataToInsert['quoteTotalAmount'] == null
            || this.dataToInsert['clientNumber'] == null;
    }
}
