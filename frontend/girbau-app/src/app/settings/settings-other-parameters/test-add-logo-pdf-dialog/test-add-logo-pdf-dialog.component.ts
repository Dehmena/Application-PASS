import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FileSystemFileEntry, NgxFileDropEntry} from 'ngx-file-drop';
import {AppUtils} from '../../../app-utils';
import {AppSettings} from '../../../app-settings';

@Component({
    selector: 'app-test-add-logo-pdf-dialog',
    templateUrl: './test-add-logo-pdf-dialog.component.html',
    styleUrls: ['./test-add-logo-pdf-dialog.component.css']
})
export class TestAddLogoPdfDialogComponent implements OnInit {

    public isTestLoading: boolean;
    public isTestSuccessful: boolean;

    public pdfDisplaySource: Uint8Array;

    constructor(public dialogRef: MatDialogRef<TestAddLogoPdfDialogComponent>,
                public http: HttpClient,
                public snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.isTestLoading = false;
        this.isTestSuccessful = false;
    }

    public closeDialog() {
        this.dialogRef.close();
    }

    public testAddLogo(files: NgxFileDropEntry[]){
        this.isTestLoading = true;
        this.isTestSuccessful = false;

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
                this.http.post(AppSettings.URL_BACKEND + '/config/test-add-logo-pdf', formData, {headers, responseType: 'blob'})
                    .subscribe(response => {
                        let blob = response;
                        let arrayBuffer: ArrayBuffer;
                        new Response(blob).arrayBuffer()
                            .then(buffer => {
                                arrayBuffer = buffer;
                                this.pdfDisplaySource = new Uint8Array(arrayBuffer);

                                this.isTestLoading = false;
                                this.isTestSuccessful = true;
                            });

                    }, error => {
                        this.isTestLoading = false;
                        this.isTestSuccessful = false;
                        AppUtils.displaySnackBarError(this.snackBar, 'Ce document n\'a pas été reconnu en tant que devis, commande ou facture.', 'OK');
                    });

            });
        }
    }

}
