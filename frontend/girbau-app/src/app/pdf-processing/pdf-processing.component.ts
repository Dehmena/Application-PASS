import {Component, OnInit} from '@angular/core';
import {NgxFileDropEntry, FileSystemFileEntry} from 'ngx-file-drop';
import {HttpHeaders} from '@angular/common/http';
import {HttpClient} from '@angular/common/http';
import {AppSettings} from '../app-settings';
import {AppUtils} from '../app-utils';
import {MatSnackBar} from '@angular/material';


@Component({
    selector: 'app-drop-file-component',
    templateUrl: './pdf-processing.component.html',
    styleUrls: ['./pdf-processing.component.css']
})
export class PdfProcessingComponent implements OnInit {

    constructor(public http: HttpClient,
                public snackBar: MatSnackBar) {
    }

    public documentType: string = null;
    public data: JSON;
    public dataUpdated: JSON;

    public pdfDisplaySource: Uint8Array;

    public files: NgxFileDropEntry[] = [];

    public fileIsPdf: boolean;

    public isEditingData: boolean;


    public isLoadingDisplayPdf: boolean;
    public isLoadingDataExtraction: boolean;
    public isDoneLoading: boolean;


    public isProcessPdfDisabled: boolean;
    public isLoadingProcessPdf: boolean;
    public isLoadingInsertDatabase: boolean;
    public isLoadingSendMail: boolean;
    public isLoadingSavePdfFile: boolean;

    public isInsertDatabaseSuccessful: boolean;
    public isSendMailSuccessful: boolean;
    public isSavePdfFileSuccessful: boolean;

    public errorMessage: string;

    public updateDate = AppUtils.updateDate;
    public toDate = AppUtils.toDate;

    public limitInput = AppUtils.limitInput;
    public onlyNumber = AppUtils.onlyNumber;
    public onlyFloat = AppUtils.onlyFloat;
    public pasteOnlyNumber = AppUtils.pasteOnlyNumber;
    public pasteOnlyFloat = AppUtils.pasteOnlyFloat;
    public preventWriting = AppUtils.preventWriting;

    ngOnInit() {
        this.isEditingData = false;

        this.isLoadingDisplayPdf = false;
        this.isLoadingDataExtraction = false;
        this.isDoneLoading = false;

        this.isProcessPdfDisabled = false;
        this.isLoadingProcessPdf = false;
        this.isLoadingInsertDatabase = false;
        this.isLoadingSendMail = false;
        this.isLoadingSavePdfFile = false;

        this.isInsertDatabaseSuccessful = false;
        this.isSendMailSuccessful = false;
        this.isSavePdfFileSuccessful = false;
    }


    dropped(files: NgxFileDropEntry[]) {
        this.isProcessPdfDisabled = false;
        this.isLoadingDisplayPdf = true;
        this.isLoadingDataExtraction = true;
        this.isDoneLoading = false;
        this.isLoadingProcessPdf = false;
        this.isEditingData = false;
        this.errorMessage = '';

        this.files = files;

        let droppedFile = AppUtils.getFirstPdf(files);

        if (droppedFile == null) {
            this.fileIsPdf = false;
            AppUtils.displaySnackBarError(this.snackBar, 'Le fichier sélectionné n\'est pas un fichier PDF.', 'OK');
        }
        else{
            this.fileIsPdf = true;

            const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
            fileEntry.file((file: File) => {
                this.displayPdfFile(file);
                this.extractPdfData(file);
            });
            this.isDoneLoading = true;
        }
    }

    public displayPdfFile(file: File) {
        let blob = file.slice(0, file.size, file.type);
        let arrayBuffer: ArrayBuffer;
        new Response(blob).arrayBuffer()
            .then(buffer => {
                arrayBuffer = buffer;
                this.pdfDisplaySource = new Uint8Array(arrayBuffer);

                this.isLoadingDisplayPdf = false;
            });
    }

    public extractPdfData(file: File) {
        const formData = new FormData();
        formData.append('pdf', file, file.name);

        const headers = new HttpHeaders({
            'enctype': 'multipart/form-data'
        });

        this.http.post(AppSettings.URL_BACKEND + '/extract-data-pdf', formData, {headers, observe: 'response'})
            .subscribe(response => {
                this.data = response.body as JSON;

                this.documentType = AppUtils.translateDataType(this.data['documentData']['documentType']);

                this.isLoadingDataExtraction = false;

                this.dataUpdated = JSON.parse(JSON.stringify(this.data));

                this.isEditingData = PdfProcessingComponent.isRequiredInformationMissing(this.dataUpdated);
            }, error => {
                this.isDoneLoading = false;
                this.isLoadingDataExtraction = false;

                if (error['status'] == 400) {
                    AppUtils.displaySnackBarError(this.snackBar, 'Le fichier PDF n\'a pas été reconnu en tant que Devis, Commande ou Facture.', 'OK');
                } else if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }
            });
    }

    startPdfProcessing() {
        this.isProcessPdfDisabled = true;
        this.isLoadingProcessPdf = true;
        this.isLoadingSendMail = true;
        this.isLoadingSavePdfFile = true;
        this.isLoadingInsertDatabase = true;
        this.errorMessage = '';


        for (const droppedFile of this.files) {

            const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
            fileEntry.file((file: File) => {
                this.processPdf(file);
            });
        }
    }

    public processPdf(file: File) {
        const formData = new FormData();
        formData.append('pdf', file, file.name);
        formData.append('data', JSON.stringify(this.data));

        const headers = new HttpHeaders({
            'enctype': 'multipart/form-data'
        });

        this.http.post(AppSettings.URL_BACKEND + '/document', formData, {headers, observe: 'response'})
            .subscribe(
                response => {
                    this.isLoadingInsertDatabase = false;
                    this.isInsertDatabaseSuccessful = true;

                    this.http.post(AppSettings.URL_BACKEND + '/send-mail', formData, {headers, observe: 'response'})
                        .subscribe(response => {
                            this.isLoadingSendMail = false;
                            this.isSendMailSuccessful = true;

                        }, error => {

                            this.isLoadingSendMail = false;
                            this.isSendMailSuccessful = false;

                            this.errorMessage = this.errorMessage + 'Une erreur s\'est produite lors de l\'envoi de l\'e-mail, vérifiez ' +
                                'l\'adresse e-mail du client et les paramètres d\'envoi d\'e-mail ' +
                                'dans l\'onglet "Paramètres".\n';

                            AppUtils.displaySnackBarError(this.snackBar, this.errorMessage, 'OK');

                        });

                    this.http.post(AppSettings.URL_BACKEND + '/save-pdf', formData, {headers, observe: 'response'})
                        .subscribe(response => {
                            this.isLoadingSavePdfFile = false;
                            this.isSavePdfFileSuccessful = true;

                        }, error => {

                            this.isLoadingSavePdfFile = false;
                            this.isSavePdfFileSuccessful = false;

                            this.errorMessage = this.errorMessage + 'Une erreur s\'est produite lors de la sauvegarde du document, vérifiez le chemin de '
                                + 'sauvegarde des documents dans l\'onglet "Paramètres".\n';

                            AppUtils.displaySnackBarError(this.snackBar, this.errorMessage, 'OK');

                        });
                },
                error => {
                    this.isProcessPdfDisabled = false;

                    this.isLoadingInsertDatabase = false;
                    this.isLoadingSendMail = false;
                    this.isLoadingSavePdfFile = false;

                    this.isInsertDatabaseSuccessful = false;
                    this.isSendMailSuccessful = false;
                    this.isSavePdfFileSuccessful = false;

                    if (error['status'] == 400) {
                        this.errorMessage = this.errorMessage + 'Ce document a peut être déjà été traité, le numéro de ce document existe déjà '
                            + 'dans la base de données. Vous pouvez le retrouver dans l\'onglet "Base de données".\n';

                        AppUtils.displaySnackBarError(this.snackBar, this.errorMessage, 'OK');
                    } else if (error['status'] == 0) {
                        AppUtils.displaySnackBarErrorConnection(this.snackBar);
                    } else {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }
                });
    }

    public toggleEditMode() {
        if (this.isEditingData) {
            if (PdfProcessingComponent.isRequiredInformationMissing(this.data)) {
                AppUtils.displaySnackBarError(this.snackBar, 'Veuillez remplir les champs requis.', 'OK');
            } else {
                this.isEditingData = !this.isEditingData;
                this.dataUpdated = JSON.parse(JSON.stringify(this.data));
            }
        } else {
            this.isEditingData = !this.isEditingData;
            this.dataUpdated = JSON.parse(JSON.stringify(this.data));
        }
    }

    public updateData() {
        if (PdfProcessingComponent.isRequiredInformationMissing(this.dataUpdated)) {
            AppUtils.displaySnackBarError(this.snackBar, 'Veuillez remplir les champs requis.', 'OK');
        } else {
            this.data = JSON.parse(JSON.stringify(this.dataUpdated));

            this.isEditingData = false;
        }
    }


    public static isRequiredInformationMissing(data) {
        if (data['documentData']['documentNumber'] == null
            || data['documentData']['creationDate'] == null
            || data['clientData']['clientNumber'] == null
            || data['clientData']['clientName'] == null
            || data['clientData']['clientName'] == ''
            || data['clientData']['clientMail'] == null
            || data['clientData']['clientMail'] == '') {
            return true;
        }

        if (data['documentData']['documentType'] == 'quote' || data['documentData']['documentType'] == 'order') {
            if (data['documentData']['totalAmount'] == null) {
                return true;
            }
        }

        if (data['documentData']['documentType'] == 'invoice') {
            if (data['documentData']['invoiceOrderReference'] == null) {
                return true;
            }
        }

        return false;
    }
}
