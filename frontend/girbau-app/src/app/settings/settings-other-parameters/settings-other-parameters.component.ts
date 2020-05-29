import {Component, OnInit, ViewChild} from '@angular/core';
import {OtherParametersInterface} from '../settings.component';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MatDialog, MatSnackBar, MatTooltip} from '@angular/material';
import {AppSettings} from '../../app-settings';
import {AppUtils} from '../../app-utils';
import {TestAddLogoPdfDialogComponent} from './test-add-logo-pdf-dialog/test-add-logo-pdf-dialog.component';

@Component({
    selector: 'app-settings-other-parameters',
    templateUrl: './settings-other-parameters.component.html',
    styleUrls: ['../settings.component.css', './settings-other-parameters.component.css']
})
export class SettingsOtherParametersComponent implements OnInit {

    public NB_MIN_LOG = 1;
    public NB_MAX_LOG = 100000;

    public NB_MIN_BACKUP = 1;
    public NB_MAX_BACKUP = 1000;

    public otherParameters: OtherParametersInterface;
    public otherParametersUpdated: OtherParametersInterface;

    public isGetParametersLoading: boolean;
    public isGetParametersSuccessful: boolean;

    public isEditingOtherParameters: boolean;
    public isUpdateOtherParametersLoading: boolean;

    public isLoadingTestSavePathBackups: boolean;

    public fileLogoQuote: File;
    public fileLogoOrder: File;
    public fileLogoInvoice: File;

    public limitInput = AppUtils.limitInput;
    public onlyNumber = AppUtils.onlyNumber;
    public pasteOnlyNumber = AppUtils.pasteOnlyNumber;
    public dashIfEmpty = AppUtils.dashIfEmpty;

    public tooltipNumberBackups: string = 'Nombre de sauvegardes à conserver (la plus récente sauvegarde remplace la plus ancienne).';

    public tooltipLogoDocument: string = 'Logo à ajouter dans les différents documents (devis, commande ou facture).\n\n' +
        'L\'image doit être dans un fichier au format PDF et doit être positionnée exactement à l\'endroit désiré. ' +
        'L\'image sera alors fusionnée avec le document.';

    @ViewChild('tooltipBackup', {static: true}) tooltipBackup: MatTooltip;
    @ViewChild('tooltipLogo', {static: true}) tooltipLogo: MatTooltip;

    constructor(public http: HttpClient,
                public snackBar: MatSnackBar,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        this.otherParameters = {
            add_girbau_logo_pdf: null,
            is_quote_reminder_working: null,
            is_quote_cancellation_working: null,
            days_before_first_reminder: null,
            days_before_second_reminder: null,
            days_before_quote_cancellation: null,
            max_number_of_logs: null,
            number_of_backups: null,
            save_file_path_backups: null
        };

        this.otherParametersUpdated = {
            add_girbau_logo_pdf: null,
            is_quote_reminder_working: null,
            is_quote_cancellation_working: null,
            days_before_first_reminder: null,
            days_before_second_reminder: null,
            days_before_quote_cancellation: null,
            max_number_of_logs: null,
            number_of_backups: null,
            save_file_path_backups: null
        };

        this.fileLogoQuote = null;
        this.fileLogoOrder = null;
        this.fileLogoInvoice = null;

        this.isEditingOtherParameters = false;
        this.isUpdateOtherParametersLoading = false;

        this.isGetParametersLoading = true;
        this.isGetParametersSuccessful = false;

        this.isLoadingTestSavePathBackups = false;

        this.http.get(AppSettings.URL_BACKEND + '/config', {observe: 'response'})
            .subscribe(response => {
                this.otherParameters = response.body['other_parameters'] as OtherParametersInterface;

                this.isGetParametersLoading = false;
                this.isGetParametersSuccessful = true;

                this.otherParametersUpdated = Object.assign({}, this.otherParameters);
            }, error => {

                if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isGetParametersLoading = false;
                this.isGetParametersSuccessful = false;
            });
    }

    public updateOtherParameters() {
        if (this.checkUpdatedData()) {
            this.isUpdateOtherParametersLoading = true;

            let formData = new FormData();
            formData.append('data', JSON.stringify(this.otherParametersUpdated));
            if (this.fileLogoQuote != null) {
                formData.append('logo_quote', this.fileLogoQuote);
            }
            if (this.fileLogoOrder != null) {
                formData.append('logo_order', this.fileLogoOrder);
            }
            if (this.fileLogoInvoice != null) {
                formData.append('logo_invoice', this.fileLogoInvoice);
            }

            let headers = new HttpHeaders({
                'enctype': 'multipart/form-data'
            });
            this.http.put(AppSettings.URL_BACKEND + '/config/other-parameters', formData, {headers, observe: 'response'})
                .subscribe(response => {
                    this.otherParameters = Object.assign({}, this.otherParametersUpdated);

                    this.isUpdateOtherParametersLoading = false;
                    this.isEditingOtherParameters = false;

                    AppUtils.displaySnackBar(this.snackBar, 'Les paramètres divers ont bien été mis à jour.', 'OK');
                }, error => {

                    if (error['status'] == 0) {
                        AppUtils.displaySnackBarErrorConnection(this.snackBar);
                    } else {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }

                    this.isUpdateOtherParametersLoading = false;
                });
        }
    }

    public testSaveFilePathBackups(){
        this.isLoadingTestSavePathBackups = true;

        let formData = new FormData();
        formData.append('data', JSON.stringify({'savePathType': 'backups'}));

        let headers = new HttpHeaders({
            'enctype': 'multipart/form-data'
        });

        this.http.post(AppSettings.URL_BACKEND + '/config/test-save-path', formData, {headers, observe: 'response'})
            .subscribe(response =>{
                this.isLoadingTestSavePathBackups = false;
                AppUtils.displaySnackBar(this.snackBar, 'Chemin de sauvegarde pour les backups valide.', 'OK');


            }, error => {
                this.isLoadingTestSavePathBackups = false;
                if(error['status'] == 400){
                    if(error['error']['code'] == 0) {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }
                    else if(error['error']['code'] == 1) {
                        AppUtils.displaySnackBarError(this.snackBar, 'Erreur - Chemin de sauvegarde pour les backups invalide.', 'OK');
                    }
                }
                else if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }
            });
    }

    public toggleEditModeOtherParameters() {
        this.isEditingOtherParameters = !this.isEditingOtherParameters;

        this.otherParametersUpdated = Object.assign({}, this.otherParameters);
        this.removeLogoFile();
    }

    public checkUpdatedData() {
        if (this.otherParametersUpdated['days_before_first_reminder'] == null
            || this.otherParametersUpdated['days_before_first_reminder'] < 1) {
            AppUtils.displaySnackBarError(this.snackBar, 'Le nombre de jours avant la première relance de devis doit être au minimum 1.', 'OK');
            return false;
        }

        if (this.otherParametersUpdated['days_before_second_reminder'] == null
            || this.otherParametersUpdated['days_before_second_reminder'] <= this.otherParametersUpdated['days_before_first_reminder']) {
            AppUtils.displaySnackBarError(this.snackBar, 'Le nombre de jours avant la deuxième relance de devis doit être supérieur ' +
                'au nombre de jours avant la première relance de devis.', 'OK');
            return false;
        }

        if (this.otherParametersUpdated['days_before_quote_cancellation'] == null
            || this.otherParametersUpdated['days_before_quote_cancellation'] <= this.otherParametersUpdated['days_before_second_reminder']) {
            AppUtils.displaySnackBarError(this.snackBar, 'Le nombre de jours avant l\'annulation automatique des devis doit être ' +
                'supérieur au nombre de jours avant la première et deuxième relance de devis.', 'OK');
            return false;
        }

        if (this.otherParametersUpdated['max_number_of_logs'] == null
            || this.otherParametersUpdated['max_number_of_logs'] < this.NB_MIN_LOG
            || this.otherParametersUpdated['max_number_of_logs'] > this.NB_MAX_LOG) {
            AppUtils.displaySnackBarError(this.snackBar, 'Le nombre maximum de logs doit être compris entre 1 et 100 000.', 'OK');
            return false;
        }

        if (this.otherParametersUpdated['number_of_backups'] == null
            || this.otherParametersUpdated['number_of_backups'] < this.NB_MIN_BACKUP
            || this.otherParametersUpdated['number_of_backups'] > this.NB_MAX_BACKUP) {
            AppUtils.displaySnackBarError(this.snackBar, 'Le nombre de backups doit être compris entre 1 et 1000.', 'OK');
            return false;
        }

        if (this.otherParametersUpdated['save_file_path_backups'] == null
            || this.otherParametersUpdated['save_file_path_backups'] == '') {
            AppUtils.displaySnackBarError(this.snackBar, 'Le chemin de sauvegarde des backups ne peut pas être vide.', 'OK');
            return false;
        }

        return true;
    }

    public openDialogTestAddLogoPdf() {
        this.dialog.open(TestAddLogoPdfDialogComponent, {
            panelClass: ['no-padding-dialog', 'min-width-dialog-700'],
            width: '700px',
            minHeight: '220px',
            disableClose: true,
            autoFocus: false
        });
    }

    public handleFileInput(files: FileList, documentType: string) {
        let file = AppUtils.getFirstPdfFile(files);
        if (file == null) {
            AppUtils.displaySnackBarError(this.snackBar, 'Le fichier sélectionné n\'est pas un fichier PDF.', 'OK');
        } else {
            if (documentType == 'quote') {
                this.fileLogoQuote = file;
            } else if (documentType == 'order') {
                this.fileLogoOrder = file;
            } else if (documentType == 'invoice') {
                this.fileLogoInvoice = file;
            }
        }
    }

    public removeLogoFile() {
        this.fileLogoQuote = null;
        this.fileLogoOrder = null;
        this.fileLogoInvoice = null;
    }

    public openFileSelector(documentType: string) {
        if (documentType == 'quote') {
            document.getElementById('fileSelectorQuote').click();
        } else if (documentType == 'order') {
            document.getElementById('fileSelectorOrder').click();
        } else if (documentType == 'invoice') {
            document.getElementById('fileSelectorInvoice').click();
        }
    }

    public toggleTooltipBackup() {
        this.tooltipBackup.toggle();
    }

    public isTooltipBackupVisible() {
        return this.tooltipBackup._isTooltipVisible();
    }

    public toggleTooltipLogo() {
        this.tooltipLogo.toggle();
    }

    public isTooltipLogoVisible() {
        return this.tooltipLogo._isTooltipVisible();
    }
}
