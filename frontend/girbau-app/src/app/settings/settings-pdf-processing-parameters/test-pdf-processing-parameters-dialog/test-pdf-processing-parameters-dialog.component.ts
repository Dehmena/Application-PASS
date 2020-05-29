import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FileSystemFileEntry, NgxFileDropEntry} from 'ngx-file-drop';
import {AppSettings} from '../../../app-settings';
import {AppUtils} from '../../../app-utils';
import {MatDialogRef, MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-test-pdf-processing-parameters-dialog',
  templateUrl: './test-pdf-processing-parameters-dialog.component.html',
  styleUrls: ['./test-pdf-processing-parameters-dialog.component.css']
})
export class TestPdfProcessingParametersDialogComponent implements OnInit {

    public isTestLoading: boolean;

    constructor(public dialogRef: MatDialogRef<TestPdfProcessingParametersDialogComponent>,
                public http: HttpClient,
                public snackBar: MatSnackBar) { }

    ngOnInit() {
        this.isTestLoading = false;
    }

    public closeDialog() {
        this.dialogRef.close();
    }

    public testDocumentRecognition(files: NgxFileDropEntry[]){
        this.isTestLoading = true;
        let droppedFile = AppUtils.getFirstPdf(files);

        if (droppedFile == null) {
            this.isTestLoading = false;
            AppUtils.displaySnackBarError(this.snackBar, 'Le fichier sélectionné n\'est pas un fichier PDF.', 'OK');
        }
        else {
            const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

            fileEntry.file((file: File) => {
                let formData = new FormData();
                formData.append('pdf', file, file.name);

                let headers = new HttpHeaders({
                    'enctype': 'multipart/form-data'
                });
                this.http.post(AppSettings.URL_BACKEND + '/config/test-regex-document', formData, {headers, observe: 'response'})
                    .subscribe(response => {
                        this.isTestLoading = false;
                        let successfulMessage = TestPdfProcessingParametersDialogComponent.buildSuccessfulMessage(response.body["documentType"]);

                        AppUtils.displaySnackBar(this.snackBar, successfulMessage, 'OK');

                    }, error => {
                        this.isTestLoading = false;
                        AppUtils.displaySnackBarError(this.snackBar, 'Ce document n\'a pas été reconnu en tant que devis, commande ou facture.', 'OK');
                    });

            });
        }
    }

    public static buildSuccessfulMessage(documentType: string){
        let message: string;

        switch (documentType) {
            case 'quote':
                message = 'Ce document a été reconnu comme étant un devis.';
                break;

            case 'order':
                message = 'Ce document a été reconnu comme étant une commande.';
                break;

            case 'invoice':
                message = 'Ce document a été reconnu comme étant une facture.';
                break;

            default:
                message = '' ;
                break;
        }
        return message;
    }
}
