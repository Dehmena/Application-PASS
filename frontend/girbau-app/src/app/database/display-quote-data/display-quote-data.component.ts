import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatIconRegistry, MatPaginator, MatSnackBar, MatTableDataSource} from '@angular/material';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../app-settings';
import {formatDate} from '@angular/common';
import {DialogDeleteItemComponent} from '../dialog-delete-item/dialog-delete-item.component';
import {DialogCreateNewQuoteComponent} from './dialog-create-new-quote/dialog-create-new-quote.component';
import {DownloadCsvFileService} from '../download-csv-file/download-csv-file.service';
import * as FileSaver from 'file-saver';
import {AppUtils} from '../../app-utils';
import {DomSanitizer} from '@angular/platform-browser';
import {ImportQuoteCsvDialogComponent} from './import-quote-csv-dialog/import-quote-csv-dialog.component';

export interface QuoteInterface {
    idQuote: number;
    quoteNumber: number;
    quoteDate: string;
    quoteTotalAmount: number;
    quoteState: string;
    clientNumber: number;
}

export interface QuoteStatesInterface {
    waiting: string;
    validated: string;
    cancelled: string;
}

export interface LinkInterface {
    first: RefInterface;
    prev: RefInterface;
    next: RefInterface;
    last: RefInterface;
}

export interface RefInterface {
    href: string;
    rel: string;
    type: string;
}

@Component({
    selector: 'app-display-quote-data',
    templateUrl: './display-quote-data.component.html',
    styleUrls: ['../database.component.css', './display-quote-data.component.css']
})

export class DisplayQuoteDataComponent implements OnInit {
    public totalDataCount: number;
    public acsRequest: boolean = true;
    public stateOfDoc: string = null;
    public searchInput: string = '';

    public quoteStates: QuoteStatesInterface = {waiting: 'En attente', validated: 'Validé', cancelled: 'Annulé'};
    public quoteToEdit: boolean[] = null;
    public quoteData: QuoteInterface[] = null;
    public quoteUpdatedData: QuoteInterface[] = null;

    public link: LinkInterface = null;
    public table: MatTableDataSource<QuoteInterface>;
    public displayedColumns: string[] = ['quoteNumber', 'quoteDate', 'quoteTotalAmount', 'clientNumber', 'quoteState', 'separation', 'button1', 'button2'];

    public isLoadingFirstData: boolean;
    public isLoadingDataSuccessful: boolean;

    public isLoadingData: boolean;

    public updateDate = AppUtils.updateDate;
    public toDate = AppUtils.toDate;

    public limitInput = AppUtils.limitInput;
    public onlyNumber = AppUtils.onlyNumber;
    public onlyFloat = AppUtils.onlyFloat;
    public pasteOnlyNumber = AppUtils.pasteOnlyNumber;
    public pasteOnlyFloat = AppUtils.pasteOnlyFloat;
    public preventWriting = AppUtils.preventWriting;

    /*Pagination*/
    @ViewChild(MatPaginator, {static: true}) quotePaginator: MatPaginator;

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

        this.quotePaginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (this.totalDataCount == 0 || pageSize == 0) { return `0 de ${this.totalDataCount}`; }

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

        this.http.get(AppSettings.URL_BACKEND + '/quotes', {observe: 'response'})
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
        this.table.paginator = this.quotePaginator;
        this.initQuoteToEdit();
    }

    /*Set data from request*/
    public setData(response: any, requestNextPage: boolean) {
        let quoteDataTemp: QuoteInterface[] = null;

        if (!response.body.hasOwnProperty('data')) {
            let requestData = response.body as QuoteInterface;
            this.quoteData = [requestData];
        } else {

            if (requestNextPage) {
                quoteDataTemp = response.body['data'] as QuoteInterface[];
                this.quoteData = this.quoteData.concat(quoteDataTemp);
            } else {
                this.quoteData = response.body['data'] as QuoteInterface[];
            }

            this.link = response.body['link'] as LinkInterface;
            this.totalDataCount = response.body['totalDataCount'];
        }

        this.quoteUpdatedData = Object.assign([], this.quoteData);

        this.setTable(this.quoteData);
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
        return (this.quotePaginator.length === this.totalDataCount);
    }

    /*Return true when user check last page of table*/
    public isLastPage(currentPage: number) {
        return (this.quotePaginator.getNumberOfPages() - 1) === currentPage;
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

    /*Set variable "acsRequest" = true */
    public initAcsRequest() {
        this.acsRequest = true;
    }

    /*Return url for the request depends on parameters on input*/
    public getUrlForRequest(sort_field: string, sort_orderClick: boolean) {
        let urlRequestData: string;

        /*When click for sorting data with any document state*/
        if (this.stateOfDoc === null && sort_orderClick) {
            let sort_order = this.switchAscDescRequest();
            urlRequestData = '?' + 'sort_order=' + sort_order;
        }

        /*When click for sorting data with the special document state*/
        else if (this.stateOfDoc != null && sort_orderClick) {
            let sort_order = this.switchAscDescRequest();
            urlRequestData = '/' + this.stateOfDoc + '?' + 'sort_order=' + sort_order;
        }

        /*When click for getting data with the special document state*/
        else if (sort_field != '') {
            urlRequestData = '/' + sort_field;
            this.stateOfDoc = sort_field;
            this.initAcsRequest();
        }

        return urlRequestData;
    }

    public findByNumber(docNumber: string) {
        this.stateOfDoc = null;

        if (docNumber != '') {
            this.isLoadingData = true;

            let url: string = AppSettings.URL_BACKEND + '/quote' + '/' + docNumber;
            this.http.get(url, {observe: 'response'})
                .subscribe(response => {
                    this.setData(response, false);

                    this.isLoadingData = false;

                }, error => {

                    if (error['status'] == 404) {
                        AppUtils.displaySnackBar(this.snackBar, 'Aucun devis correspondant à la recherche n\'a été trouvé.', 'OK');
                    } else if (error['status'] == 0) {
                        AppUtils.displaySnackBarErrorConnection(this.snackBar);
                    } else {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }

                    this.isLoadingData = false;
                });
        } else {
            this.getData();
        }
    }


    public deleteFilter() {
        this.getData();
        this.stateOfDoc = null;
        this.searchInput = '';
    }


    public openDeleteDialog(quote: any) {
        let dialogRef = this.dialog.open(DialogDeleteItemComponent, {
            data: {
                id: quote['idQuote'],
                number: quote['quoteNumber'],
                dataType: 'quote'
            },
            panelClass: ['no-padding-dialog', 'min-width-dialog-443'],
            width: '443px',
            height: '165px',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'success'){
                AppUtils.displaySnackBar(this.snackBar, 'Devis supprimé avec succès.', 'OK');
                this.getData();
            }
        });
    }

    public openNewItemDialog() {
        let dialogRef = this.dialog.open(DialogCreateNewQuoteComponent,{
            panelClass: ['no-padding-dialog', 'min-width-dialog-450'],
            width: '450px',
            height: '377px',
            autoFocus: true,
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'success'){
                AppUtils.displaySnackBar(this.snackBar, 'Devis créé avec succès.', 'OK');
                this.getData();
            }
        });
    }

    public openImportCsvDialog() {
        let dialogRef = this.dialog.open(ImportQuoteCsvDialogComponent,{
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

    public doRequest(sort_field: string, sort_orderClick: boolean) {
        let url: string = AppSettings.URL_BACKEND + '/quotes';
        let urlRequestData = this.getUrlForRequest(sort_field, sort_orderClick);
        url += urlRequestData;

        this.searchInput = '';
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

    public validation(indexQuote) {
        if(this.isRequiredInformationMissing(indexQuote)){
            AppUtils.displaySnackBarError(this.snackBar, 'Veuillez remplir les champs requis.', 'OK');
        }
        else {
            this.isLoadingData = true;

            let formData = new FormData();
            formData.append('data', JSON.stringify(this.quoteUpdatedData[indexQuote]));

            const headers = new HttpHeaders({'enctype': 'multipart/form-data'});

            this.http.put(AppSettings.URL_BACKEND + '/quote/' + this.quoteUpdatedData[indexQuote]['idQuote'], formData, {
                headers,
                observe: 'response'
            })
                .subscribe(
                    response => {
                        this.quoteData[indexQuote] = Object.assign({}, this.quoteUpdatedData[indexQuote]);
                        this.quoteToEdit[indexQuote] = false;

                        AppUtils.displaySnackBar(this.snackBar, 'Devis modifié avec succès', 'OK');

                        this.isLoadingData = false;

                    },
                    error => {
                        console.error(error);
                        if (error['status'] == 400) {
                            AppUtils.displaySnackBarError(this.snackBar, 'Modification impossible : ce numéro de devis existe déjà.', 'OK');
                        } else if (error['status'] == 0) {
                            AppUtils.displaySnackBarErrorConnection(this.snackBar);
                        } else {
                            AppUtils.displaySnackBarErrorServeur(this.snackBar);
                        }

                        this.isLoadingData = false;
                    }
                );
        }
    }

    public isRequiredInformationMissing(indexQuote: number){
        return this.quoteUpdatedData[indexQuote]['quoteNumber'] == null
            || this.quoteUpdatedData[indexQuote]['quoteDate'] == null
            || this.quoteUpdatedData[indexQuote]['quoteTotalAmount'] == null
            || this.quoteUpdatedData[indexQuote]['clientNumber'] == null
            || this.quoteUpdatedData[indexQuote]['quoteState'] == null;
    }

    public initQuoteToEdit() {
        this.quoteToEdit = new Array(this.quoteData.length).fill(false);
    }

    public toggleEditMode(indexQuoteToEdit: number) {
        this.quoteToEdit[indexQuoteToEdit] = !this.quoteToEdit[indexQuoteToEdit];
        this.quoteUpdatedData[indexQuoteToEdit] = Object.assign({}, this.quoteData[indexQuoteToEdit]);
    }

    public changeState(quoteState: string, indexQuoteToEdit: number) {
        this.quoteUpdatedData[indexQuoteToEdit]['quoteState'] = quoteState;
    }

    public getIndex(pageIndex) {
        return pageIndex + this.quotePaginator.pageSize * this.quotePaginator.pageIndex;
    }

    public downloadCsvFile() {
        const currentDate = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
        let requestPath = '/csv/quote';
        let fileName = 'devis_' + currentDate + '.csv';
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

    public editMode(){
        if(this.quoteToEdit == null) return false;

        return this.quoteToEdit.includes(true);
    }
}
