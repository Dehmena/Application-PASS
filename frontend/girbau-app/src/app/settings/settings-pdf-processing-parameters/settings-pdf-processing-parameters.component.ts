import { Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { PdfProcessingParameterInterface} from '../settings.component';
import {TestPdfProcessingParametersDialogComponent} from './test-pdf-processing-parameters-dialog/test-pdf-processing-parameters-dialog.component';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MatDialog, MatSnackBar, MatTooltip} from '@angular/material';
import {AppSettings} from '../../app-settings';
import {AppUtils} from '../../app-utils';

@Component({
  selector: 'app-settings-pdf-processing-parameters',
  templateUrl: './settings-pdf-processing-parameters.component.html',
  styleUrls: ['../settings.component.css', './settings-pdf-processing-parameters.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SettingsPdfProcessingParametersComponent implements OnInit {

    public pdfProcessingParameters: PdfProcessingParameterInterface;
    public pdfProcessingParametersUpdated: PdfProcessingParameterInterface;

    public isGetParametersLoading : boolean;
    public isGetParametersSuccessful: boolean;

    public isEditingPdfProcessingParameters: boolean;
    public isUpdatePdfProcessingParametersLoading: boolean;

    public isLoadingTestSavePathArchive: boolean;

    public isLoadingTestSavePathReminder: boolean;

    public tooltipRegexDocument: string = 'Ce sont les chaînes de caractères permettant de reconnaître le ' +
                                        'type de document parmi Devis, Commande et Facture.\n' +
                                        'Une chaîne de caractères distincte est nécessaire, pensez à tester ' +
                                        'la reconnaissance de chaque type de document après modification.\n\n' +
                                        'Attention, il faut prendre en compte:\n' +
                                        '- Les majuscules\n' +
                                        '- Les minuscules\n' +
                                        '- Les accents\n' +
                                        '- La ponctuation';

    public dashIfEmpty = AppUtils.dashIfEmpty;

    @ViewChild('tooltipRegex', {static: true}) tooltipRegex:MatTooltip;

    constructor(public http: HttpClient,
                public snackBar: MatSnackBar,
                public dialog: MatDialog) { }

    ngOnInit() {
        this.pdfProcessingParameters = {
            regex_quote: null,
            regex_order: null,
            regex_invoice: null,
            save_file_path_archive: null,
            save_file_path_reminder: null
        };

        this.isEditingPdfProcessingParameters = false;
        this.isUpdatePdfProcessingParametersLoading = false;

        this.isLoadingTestSavePathArchive = false;

        this.isLoadingTestSavePathReminder = false;

        this.isGetParametersLoading = true;
        this.isGetParametersSuccessful = false;

        this.http.get(AppSettings.URL_BACKEND + '/config', {observe: 'response'})
            .subscribe(response => {
                this.pdfProcessingParameters = response.body['pdf_processing_parameters'] as PdfProcessingParameterInterface;

                this.isGetParametersLoading = false;
                this.isGetParametersSuccessful = true;

                this.pdfProcessingParametersUpdated = Object.assign({}, this.pdfProcessingParameters);
            }, error => {

                if(error['status'] == 0){
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                }
                else{
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }
                this.isGetParametersLoading = false;
                this.isGetParametersSuccessful = false;
            });
    }

    public updatePdfProcessingParameters(){
        this.isUpdatePdfProcessingParametersLoading = true;

        let formData = new FormData();
        formData.append('data', JSON.stringify(this.pdfProcessingParametersUpdated));

        let headers = new HttpHeaders({
            'enctype': 'multipart/form-data'
        });
        this.http.put(AppSettings.URL_BACKEND + '/config/pdf-processing-parameters', formData, {headers, observe: 'response'})
            .subscribe(response =>{
                this.pdfProcessingParameters = Object.assign({}, this.pdfProcessingParametersUpdated);

                this.isUpdatePdfProcessingParametersLoading = false;
                this.isEditingPdfProcessingParameters = false;

                AppUtils.displaySnackBar(this.snackBar, "Les paramètres de traitement de fichiers PDF ont bien été mis à jour.", "OK");
            }, error => {

                if(error['status'] == 0){
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                }
                else{
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isUpdatePdfProcessingParametersLoading = false;
            })
    }

    public toggleEditModePdfProcessingParameters(){
        this.isEditingPdfProcessingParameters = !this.isEditingPdfProcessingParameters;

        this.pdfProcessingParametersUpdated =  Object.assign({}, this.pdfProcessingParameters);
    }

    public openDialogTestPdfProcessingParameters(){
        this.dialog.open(TestPdfProcessingParametersDialogComponent, {
            panelClass: ['no-padding-dialog', 'min-width-dialog-700'],
            width: '700px',
            height: '220px',
            disableClose: true,
            autoFocus: false
        });
    }

    public testSaveFilePathArchive(){
        this.isLoadingTestSavePathArchive = true;

        let formData = new FormData();
        formData.append('data', JSON.stringify({'savePathType': 'archive'}));

        let headers = new HttpHeaders({
            'enctype': 'multipart/form-data'
        });

        this.http.post(AppSettings.URL_BACKEND + '/config/test-save-path', formData, {headers, observe: 'response'})
            .subscribe(response =>{
                this.isLoadingTestSavePathArchive = false;
                AppUtils.displaySnackBar(this.snackBar, 'Chemin de sauvegarde pour le dossier "Archive" valide.', 'OK');

            }, error => {
                this.isLoadingTestSavePathArchive = false;
                if(error['status'] == 400){
                    if(error['error']['code'] == 0) {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }
                    else if(error['error']['code'] == 1) {
                        AppUtils.displaySnackBarError(this.snackBar, 'Erreur - Chemin de sauvegarde pour le dossier "Archive" invalide.', 'OK');
                    }
                }
                else if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

            });
    }

    public testSaveFilePathReminder(){
        this.isLoadingTestSavePathReminder = true;

        let formData = new FormData();
        formData.append('data', JSON.stringify({'savePathType': 'reminder'}));

        let headers = new HttpHeaders({
            'enctype': 'multipart/form-data'
        });

        this.http.post(AppSettings.URL_BACKEND + '/config/test-save-path', formData, {headers, observe: 'response'})
            .subscribe(response =>{
                this.isLoadingTestSavePathReminder = false;
                AppUtils.displaySnackBar(this.snackBar, 'Chemin de sauvegarde pour le dossier "Relance des devis" valide.', 'OK');


            }, error => {
                this.isLoadingTestSavePathReminder = false;
                if(error['status'] == 400){
                    if(error['error']['code'] == 0) {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }
                    else if(error['error']['code'] == 1) {
                        AppUtils.displaySnackBarError(this.snackBar, 'Erreur - Chemin de sauvegarde pour le dossier "Relance des devis" invalide.', 'OK');
                    }
                }
                else if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }
            });
    }

    public toggleTooltipRegex(){
        this.tooltipRegex.toggle();
    }

    public isTooltipRegexVisible(){
        return this.tooltipRegex._isTooltipVisible();
    }


}
