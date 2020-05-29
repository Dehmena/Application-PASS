import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSnackBar, MatTableDataSource, MatDialog, MatIconRegistry} from '@angular/material';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../app-settings';
import {isNumber} from '@progress/kendo-angular-inputs/dist/es2015/numerictextbox/utils';
import {DialogDeleteItemComponent} from '../dialog-delete-item/dialog-delete-item.component';
import {DialogCreateNewClientComponent} from './dialog-create-new-client/dialog-create-new-client.component';
import {DownloadCsvFileService} from '../download-csv-file/download-csv-file.service';
import {formatDate} from '@angular/common';
import * as FileSaver from 'file-saver';
import {DomSanitizer} from '@angular/platform-browser';
import {AppUtils} from '../../app-utils';
import {ImportClientCsvDialogComponent} from './import-client-csv-dialog/import-client-csv-dialog.component';


export interface ClientInterface {
    idClient: number;
    clientNumber: number;
    clientName: string;
    clientMail: string;
}

export interface RefInterface {
    href: string;
    rel: string;
    type: string;
}

export interface LinkInterface {
    first: RefInterface;
    prev: RefInterface;
    next: RefInterface;
    last: RefInterface;
}

@Component({
    selector: 'app-display-client-data',
    templateUrl: './display-client-data.component.html',
    styleUrls: ['../database.component.css', './display-client-data.component.css']
})

export class DisplayClientDataComponent implements OnInit {
    public totalDataCount: number;
    public acsRequest: boolean = true;
    public stateOfDoc: string = null;
    public searchInput: string = '';

    public clientToEdit: boolean[] = [];
    public clientData: ClientInterface[] = null;
    public clientUpdatedData: ClientInterface[] = null;

    public link: LinkInterface = null;
    public table: MatTableDataSource<ClientInterface>;
    public displayedColumns: string[] = ['clientNumber', 'clientName', 'clientMail', 'separation', 'button1', 'button2'];

    public isLoadingFirstData: boolean;
    public isLoadingDataSuccessful: boolean;

    public isLoadingData: boolean;

    public limitInput = AppUtils.limitInput;
    public onlyNumber = AppUtils.onlyNumber;
    public pasteOnlyNumber = AppUtils.pasteOnlyNumber;

    @ViewChild(MatPaginator, {static: true}) clientPaginator: MatPaginator;

    constructor(public http: HttpClient,
                public snackBar: MatSnackBar,
                public dialog: MatDialog,
                public downloadCsvFileService: DownloadCsvFileService,
                public matIconRegistry: MatIconRegistry,
                public domSanitizer: DomSanitizer) {
        this.matIconRegistry.addSvgIcon(
            `clear_filter`,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/clear_filter.svg')
        );
    }


    ngOnInit() {
        this.isLoadingFirstData = true;
        this.isLoadingDataSuccessful = false;

        this.isLoadingData = false;

        this.clientPaginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (this.totalDataCount == 0 || pageSize == 0) {
                return `0 de ${this.totalDataCount}`;
            }

            this.totalDataCount = Math.max(this.totalDataCount, 0);

            const startIndex = page * pageSize;

            // If the start index exceeds the list length, do not try and fix the end index to the end.
            const endIndex = startIndex < this.totalDataCount ?
                Math.min(startIndex + pageSize, this.totalDataCount) :
                startIndex + pageSize;

            return `${startIndex + 1} - ${endIndex} de ${this.totalDataCount}`;
        };

        this.getData();
    }

    public getData() {
        this.isLoadingData = true;

        this.http.get(AppSettings.URL_BACKEND + '/clients', {observe: 'response'})
            .subscribe(response => {
                this.setData(response, false);

                this.isLoadingDataSuccessful = true;
                this.isLoadingFirstData = false;

                this.isLoadingData = false;
            }, error => {

                if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isLoadingDataSuccessful = false;
                this.isLoadingFirstData = false;

                this.isLoadingData = false;
            });
    }

    public setTable(myData: any) {
        this.table = new MatTableDataSource(myData);
        this.table.paginator = this.clientPaginator;
        this.initClientToEdit();
    }

    /*Set data from request*/
    public setData(response: any, requestNextPage: boolean) {
        let clientDataTemp: ClientInterface[] = null;

        if (!response.body.hasOwnProperty('data')) {
            let requestData = response.body as ClientInterface;
            this.clientData = [requestData];
        } else {

            if (requestNextPage) {
                clientDataTemp = response.body['data'] as ClientInterface[];
                this.clientData = this.clientData.concat(clientDataTemp);
            } else {
                this.clientData = response.body['data'] as ClientInterface[];
            }

            this.link = response.body['link'] as LinkInterface;
            this.totalDataCount = response.body['totalDataCount'];
        }
        this.clientUpdatedData = Object.assign([], this.clientData);


        this.setTable(this.clientData);
    }

    /*Do request, when user check last page of table and if it's not last request*/
    public doRequestIfLastPage(currentPage: any) {

        if (!this.isLastRequest() && this.isLastPage(currentPage.pageIndex)) {
            this.isLoadingData = true;

            this.http.get(this.link['next']['href'], {observe: 'response'})
                .subscribe(response => {
                    this.setData(response, true);

                    this.isLoadingData = false;

                }, error => {
                    if (error['status'] == 0) {
                        AppUtils.displaySnackBarErrorConnection(this.snackBar);
                    } else {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }

                    this.isLoadingData = false;

                });
        }
    }

    /*Return true when all data from db is displayed*/
    public isLastRequest() {
        return (this.clientPaginator.length === this.totalDataCount);
    }

    /*Return true when user check last page of table*/
    public isLastPage(currentPage: number) {
        return (this.clientPaginator.getNumberOfPages() - 1) === currentPage;
    }

    public switchAscDescRequest() {
        if (this.acsRequest) {
            this.acsRequest = !this.acsRequest;
            return 'asc';
        } else {
            this.acsRequest = !this.acsRequest;
            return 'desc';
        }
    }

    /*Return url for the request depends on parameters on input*/
    public getUrlForRequest(sort_field: string) {
        let urlRequestData: string;

        if (this.stateOfDoc === null) {
            let sort_order = this.switchAscDescRequest();
            urlRequestData = '?' + 'sort_field=' + sort_field + '&' + 'sort_order=' + sort_order;
        } else if (this.stateOfDoc != null) {
            let sort_order = this.switchAscDescRequest();
            urlRequestData = '/' + this.stateOfDoc + '?' + 'sort_field=' + sort_field + '&' + 'sort_order=' + sort_order;
        }

        return urlRequestData;
    }

    public findElement(docInfo: string) {
        this.stateOfDoc = null;

        if (docInfo != '') {
            this.isLoadingData = true;

            if (isNumber(docInfo)) {
                this.findByNumber(docInfo);
            } else {
                this.findByName(docInfo);
            }
        } else {
            this.getData();
        }
    }

    public findByNumber(docNumber: string) {
        let url: string = AppSettings.URL_BACKEND + '/client' + '/' + docNumber;
        this.http.get(url, {observe: 'response'})
            .subscribe(response => {
                this.setData(response, false);

                this.isLoadingData = false;
            }, error => {

                if (error['status'] == 404) {
                    AppUtils.displaySnackBar(this.snackBar,'Aucun client correspondant à la recherche n\'a été trouvé.', 'OK');
                } else if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isLoadingData = false;
            });
    }

    public findByName(clientName: string) {
        let url: string = AppSettings.URL_BACKEND + '/clients' + '/' + clientName;
        this.http.get(url, {observe: 'response'})
            .subscribe(response => {
                this.setData(response, false);
                this.isLoadingData = false;

                this.stateOfDoc = clientName;
            }, error => {

                if (error['status'] == 404) {
                    AppUtils.displaySnackBar(this.snackBar, 'Aucun client correspondant à la recherche n\'a été trouvé.', 'OK');
                }
                else if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isLoadingData = false;
            });
    }

    public deleteFilter() {
        this.getData();
        this.stateOfDoc = null;
        this.searchInput = '';
    }

    public openDeleteDialog(client: any) {
        let dialogRef = this.dialog.open(DialogDeleteItemComponent, {
            data: {
                id: client['idClient'],
                number: client['clientNumber'],
                dataType: 'client'
            },
            panelClass: ['no-padding-dialog', 'min-width-dialog-443'],
            width: '443px',
            height: '165px',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'success'){
                AppUtils.displaySnackBar(this.snackBar, 'Client supprimé avec succès', 'OK');
                this.getData();
            }
        });
    }
    public openNewItemDialog() {
        let dialogRef = this.dialog.open(DialogCreateNewClientComponent, {
            panelClass: ['no-padding-dialog', 'min-width-dialog-450'],
            width: '450px',
            height: '318px',
            autoFocus: true,
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'success'){
                AppUtils.displaySnackBar(this.snackBar, 'Client créé avec succès', 'OK');
                this.getData();
            }
        });
    }

    public openImportCsvDialog() {
        let dialogRef = this.dialog.open(ImportClientCsvDialogComponent,{
            panelClass: ['no-padding-dialog', 'min-width-dialog-800'],
            width: '800px',
            minHeight: '200px',
            autoFocus: false,
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'success'){
                AppUtils.displaySnackBar(this.snackBar, 'Données importées avec succès.', 'OK');
                this.getData();
            }
        });
    }

    public doRequest(sort_field: string) {
        let url: string = AppSettings.URL_BACKEND + '/clients';
        let urlRequestData = this.getUrlForRequest(sort_field);
        url += urlRequestData;

        if(isNumber(this.searchInput)) {
            this.searchInput = '';
        }

        this.isLoadingData = true;

        this.http.get(url, {observe: 'response'})
            .subscribe(response => {
                this.setData(response, false);

                this.isLoadingData = false;
            }, error => {
                if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isLoadingData = false;
            });
    }


    public validation(indexClient: number) {
        if(this.isRequiredInformationMissing(indexClient)){
            AppUtils.displaySnackBarError(this.snackBar, 'Veuillez remplir les champs requis.', 'OK');
        }
        else {
            this.isLoadingData = true;

            let formData = new FormData();
            formData.append('data', JSON.stringify(this.clientUpdatedData[indexClient]));


            const headers = new HttpHeaders({'enctype': 'multipart/form-data'});

            this.http.put(AppSettings.URL_BACKEND + '/client/' + this.clientUpdatedData[indexClient]['idClient'], formData, {headers, observe: 'response'})
                .subscribe(
                    response => {

                        this.clientData[indexClient] = Object.assign({}, this.clientUpdatedData[indexClient]);
                        this.clientToEdit[indexClient] = false;

                        AppUtils.displaySnackBar(this.snackBar, 'Client modifié avec succès', 'OK');

                        this.isLoadingData = false;
                    },
                    error => {
                        console.error(error);
                        if (error['status'] == 400) {
                            AppUtils.displaySnackBarError(this.snackBar, 'Modification impossible : ce numéro de client existe déjà.', 'OK');
                        } else if (error['status'] == 0) {
                            AppUtils.displaySnackBarErrorConnection(this.snackBar);
                        } else {
                            AppUtils.displaySnackBarErrorServeur(this.snackBar);
                        }

                        this.isLoadingData = false;                    }
                );
        }
    }

    public isRequiredInformationMissing(indexClient: number){
        return this.clientUpdatedData[indexClient]['clientNumber'] == null
            || this.clientUpdatedData[indexClient]['clientName'] == null
            || this.clientUpdatedData[indexClient]['clientName'] == ''
            || this.clientUpdatedData[indexClient]['clientMail'] == null
            || this.clientUpdatedData[indexClient]['clientMail'] == '';
    }

    public initClientToEdit() {
        this.clientToEdit = new Array(this.clientData.length).fill(false);
    }

    public toggleEditMode(indexClientToEdit: number) {
        this.clientToEdit[indexClientToEdit] = !this.clientToEdit[indexClientToEdit];
        this.clientUpdatedData[indexClientToEdit] = Object.assign({}, this.clientData[indexClientToEdit]);

    }

    public downloadCsvFile() {
        const currentDate = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
        let requestPath = '/csv/client';
        let fileName = 'clients_' + currentDate + '.csv';
        this.downloadCsvFileService.downloadFile(requestPath)
            .subscribe(
                response => {
                    let blob: any = new Blob([response], {type: 'text/csv; charset=utf-8'});
                    FileSaver.saveAs(blob, fileName);
                },
                error => {

                    if (error['status'] == 0) {
                        AppUtils.displaySnackBarErrorConnection(this.snackBar);
                    } else {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }
                }
            );
    }

    public getIndex(pageIndex) {
        return pageIndex + this.clientPaginator.pageSize * this.clientPaginator.pageIndex;
    }

    public editMode(){
        if(this.clientToEdit == null) return false;

        return this.clientToEdit.includes(true);
    }
}
