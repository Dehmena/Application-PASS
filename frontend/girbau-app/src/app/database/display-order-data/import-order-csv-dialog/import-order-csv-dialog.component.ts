import { Component, OnInit } from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppUtils} from '../../../app-utils';
import {AppSettings} from '../../../app-settings';


export interface OrderDataImportInterface {
    number: number;
    date: string;
    totalAmount: number;
    clientNumber: number;
    quoteNumber: number;
}

export interface ErrorImportCsvInterface {
    line: number;
    errors: string[];
}


@Component({
  selector: 'app-import-order-csv-dialog',
  templateUrl: './import-order-csv-dialog.component.html',
  styleUrls: ['./import-order-csv-dialog.component.css']
})
export class ImportOrderCsvDialogComponent implements OnInit {

    public csvFile: File;
    public dataToInsert: OrderDataImportInterface[] = [];
    public dataToUpdate: OrderDataImportInterface[] = [];

    public totalNumberOfData: number = 0;
    public numberOfExactDouble: number = 0;
    public numberOfNewData: number = 0;
    public numberOfUpdatedData: number = 0;

    public hasConflicts: boolean;
    public conflictedData: OrderDataImportInterface[] = [];
    public conflictedReplaceDataChoice: boolean[];

    public hasErrorImportingCsv: boolean;
    public errorImportCsv: ErrorImportCsvInterface[] = [];

    public keepExistingDatabase: boolean;

    public isLoadingProcessCsv: boolean;
    public displayResultCsv: boolean;

    public isLoadingImportData: boolean;

  constructor(public dialogRef: MatDialogRef<ImportOrderCsvDialogComponent>,
              public http: HttpClient,
              public snackBar: MatSnackBar) { }

  ngOnInit() {
      this.hasErrorImportingCsv = false;
      this.isLoadingProcessCsv = false;
      this.displayResultCsv = false;
  }

    public closeDialog() {
        this.dialogRef.close();
    }

    public handleFileInput(files: FileList, keepDatabase: boolean) {
        this.keepExistingDatabase = keepDatabase;

        this.csvFile = files.item(0);
        this.processCsv();
    }

    processCsv() {
        this.isLoadingProcessCsv = true;
        this.displayResultCsv = false;
        this.isLoadingImportData = false;

        this.dataToInsert = [];
        this.dataToUpdate = [];

        this.conflictedData = [];
        this.errorImportCsv = [];
        this.hasErrorImportingCsv = false;


        if (!AppUtils.isCsvFile(this.csvFile)) {
            AppUtils.displaySnackBarError(this.snackBar, 'Le fichier sélectionné n\'est pas un fichier CSV.', 'OK');
        }

        let formData = new FormData();
        formData.append('csv', this.csvFile);
        formData.append('data', JSON.stringify({'keepDatabase': this.keepExistingDatabase}));

        const headers = new HttpHeaders({'enctype': 'multipart/form-data'});

        this.http.post(AppSettings.URL_BACKEND + '/csv/order', formData, {
            headers,
            observe: 'response'
        }).subscribe(response => {
            this.hasConflicts = response.body['hasConflicts'];
            if(this.hasConflicts) {
                this.conflictedData = response.body['data']['conflicts'];
                this.conflictedReplaceDataChoice = new Array(this.conflictedData.length).fill(null);

                this.dataToInsert = response.body['data']['dataToInsert'];
            }
            else{
                this.dataToInsert = response.body['data'];
            }

            this.totalNumberOfData = response.body['totalNumberOfData'];
            this.numberOfNewData = this.dataToInsert.length;
            this.numberOfExactDouble = this.totalNumberOfData - (this.conflictedData.length + this.numberOfNewData);

            this.displayResultCsv = true;
            this.isLoadingProcessCsv = false;
        }, error => {
            if (error['status'] == 400){
                if (error['error']['code'] == 0){
                    AppUtils.displaySnackBarError(this.snackBar, 'Le nombre d\'en-têtes de ce CSV ne correspond pas pour ce type de données.', 'OK');
                }
                else if (error['error']['code'] == 1){
                    this.errorImportCsv = error['error']['data'] as ErrorImportCsvInterface[];

                    this.displayResultCsv = true;
                    this.hasErrorImportingCsv = true;
                }
                else{
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }
            }
            else if (error['status'] == 0) {
                AppUtils.displaySnackBarErrorConnection(this.snackBar);
            } else {
                AppUtils.displaySnackBarErrorServeur(this.snackBar);
            }

            this.isLoadingProcessCsv = false;

        });
    }

    public openFileSelector(keepDatabase: boolean) {
        if (keepDatabase) {
            document.getElementById('fileSelectorKeepDatabase').click();
        } else {
            document.getElementById('fileSelectorDeleteDatabase').click();
        }
    }

    public getNumberOfErrors() {
        return this.errorImportCsv.filter(error => error['messages'].length > 0).length;
    }

    public isDatabaseToUpdate(){
        return this.hasConflicts || this.dataToUpdate.length > 0 || this.dataToInsert.length > 0;
    }

    public tryImportingAgain() {
        this.displayResultCsv = false;
        this.hasErrorImportingCsv = false;
    }

    public checkConflictResolve() {
        if (this.conflictedReplaceDataChoice.includes(null)) {
            AppUtils.displaySnackBarError(this.snackBar, 'Il reste des conflicts non résolus.', 'OK');
        } else {
            this.numberOfUpdatedData = this.conflictedReplaceDataChoice.filter(replaceChoice => replaceChoice == true).length;

            for (let i = 0; i < this.conflictedData.length; ++i) {
                if (this.conflictedReplaceDataChoice[i]) {
                    this.dataToUpdate.push(this.conflictedData[i]['csv'] as OrderDataImportInterface);
                }
            }

            this.hasConflicts = false;
        }
    }

    public insertData() {
        this.isLoadingImportData = true;

        let formData = new FormData();
        formData.append('data', JSON.stringify({
            dataToInsert: this.dataToInsert,
            dataToUpdate: this.dataToUpdate,
            keepDatabase: this.keepExistingDatabase
        }));

        const headers = new HttpHeaders({'enctype': 'multipart/form-data'});

        this.http.put(AppSettings.URL_BACKEND + '/csv/order', formData, {
            headers,
            observe: 'response'
        }).subscribe(response => {
            this.dialogRef.close('success');

        }, error => {

            if (error['status'] == 0) {
                AppUtils.displaySnackBarErrorConnection(this.snackBar);
            } else {
                AppUtils.displaySnackBarErrorServeur(this.snackBar);
            }

            this.isLoadingImportData = false;

        });
    }

    public selectAllConflictReplaceChoice(replace: boolean){
        this.conflictedReplaceDataChoice = new Array(this.conflictedData.length).fill(replace);
    }
}
