import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatIconRegistry, MatPaginator, MatSnackBar, MatTableDataSource} from '@angular/material';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../app-settings';
import {formatDate} from '@angular/common';
import {DialogDeleteItemComponent} from '../dialog-delete-item/dialog-delete-item.component';
import {DialogCreateNewInvoiceComponent} from './dialog-create-new-invoice/dialog-create-new-invoice.component';
import * as FileSaver from 'file-saver';
import {DownloadCsvFileService} from '../download-csv-file/download-csv-file.service';
import {DomSanitizer} from '@angular/platform-browser';
import {AppUtils} from '../../app-utils';
import {ImportInvoiceCsvDialogComponent} from './import-invoice-csv-dialog/import-invoice-csv-dialog.component';

export interface InvoiceInterface {
    idInvoice: number;
    invoiceNumber: number;
    invoiceDate: string;
    clientNumber: number;
    orderNumber: number;
}

export interface LinkInterface{
    first: RefInterface;
    prev: RefInterface;
    next: RefInterface;
    last: RefInterface;
}

export interface RefInterface{
    href: string;
    rel: string;
    type: string;
}

@Component({
    selector: 'app-display-invoice-data',
    templateUrl: './display-invoice-data.component.html',
    styleUrls: ['../database.component.css', './display-invoice-data.component.css']
})

export class DisplayInvoiceDataComponent implements OnInit {
    public totalDataCount: number;
    public acsRequest: boolean = true;
    public searchInput: string = '';

    public invoiceToEdit: boolean[] = null;
    public invoiceData: InvoiceInterface[] = null;
    public invoiceUpdatedData: InvoiceInterface[] = null;

    public link: LinkInterface = null;
    public table: MatTableDataSource<InvoiceInterface>;
    public displayedColumns: string[] = ['invoiceNumber' , 'invoiceDate' , 'clientNumber' , 'orderNumber', 'separation', 'button1', 'button2'];

    public isLoadingFirstData: boolean;
    public isLoadingDataSuccessful: boolean;

    public isLoadingData: boolean;

    public updateDate = AppUtils.updateDate;
    public toDate = AppUtils.toDate;

    public limitInput = AppUtils.limitInput;
    public onlyNumber = AppUtils.onlyNumber;
    public pasteOnlyNumber = AppUtils.pasteOnlyNumber;
    public preventWriting = AppUtils.preventWriting;

    /*Pagination*/
    @ViewChild(MatPaginator, {static: true}) invoicePaginator: MatPaginator;

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

        this.invoicePaginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (this.totalDataCount == 0 || pageSize == 0) { return `0 de ${this.totalDataCount}`; }

            this.totalDataCount = Math.max(this.totalDataCount, 0);

            const startIndex = page * pageSize;

            // If the start index exceeds the list length, do not try and fix the end index to the end.
            const endIndex = startIndex < this.totalDataCount ?
                Math.min(startIndex + pageSize, this.totalDataCount) :
                startIndex + pageSize;

            return `${startIndex + 1} - ${endIndex} de ${this.totalDataCount}`;
        };

        this.getData()
    }

    public getData() {
        this.isLoadingData = true;

        this.http.get(AppSettings.URL_BACKEND + '/invoices', {observe: 'response'})
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

    public setTable(myData: any){
        this.table = new MatTableDataSource(myData);
        this.table.paginator = this.invoicePaginator;
        this.initInvoiceToEdit();
    }

    /*Set data from request*/
    public setData(response:any, requestNextPage: boolean){
        let invoiceDataTemp: InvoiceInterface[] = null;

        if(!response.body.hasOwnProperty('data')){
            let requestData = response.body as InvoiceInterface;
            this.invoiceData = [requestData];
        }else{

            if(requestNextPage){
                invoiceDataTemp = response.body['data'] as InvoiceInterface[];
                this.invoiceData = this.invoiceData.concat(invoiceDataTemp);
            }else
                this.invoiceData = response.body['data'] as InvoiceInterface[];

            this.link = response.body['link'] as LinkInterface;
            this.totalDataCount = response.body['totalDataCount'];
        }
        this.invoiceUpdatedData = Object.assign([], this.invoiceData);

        this.setTable(this.invoiceData);
    }

    /*Do request, when user check last page of table and if it's not last request*/
    public doRequestIfLastPage(currentPage: any){

        if ( !this.isLastRequest() && this.isLastPage(currentPage.pageIndex)){
            this.isLoadingData = true;

            this.http.get(this.link['next']['href'], {observe: 'response'})
                .subscribe( response => {
                    this.setData(response,true);

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
    public isLastRequest(){
        return (this.invoicePaginator.length === this.totalDataCount);
    }

    /*Return true when user check last page of table*/
    public isLastPage(currentPage: number){
        return (this.invoicePaginator.getNumberOfPages() - 1) === currentPage;
    }

    public switchAscDescRequest(){
        if (this.acsRequest){
            this.acsRequest = !this.acsRequest;
            return  "asc";
        }else{
            this.acsRequest = !this.acsRequest;
            return "desc";
        }
    }

    public getUrlForRequest(){
        let sort_order = this.switchAscDescRequest();
        return '?' + 'sort_order=' + sort_order;
    }

    public findByNumber(docNumber: string){
        if(docNumber != ''){
            this.isLoadingData = true;

            let url: string = AppSettings.URL_BACKEND + '/invoice' + '/' + docNumber;
            this.http.get(url, {observe: 'response'})
                .subscribe( response => {
                    this.setData(response,false);

                    this.isLoadingData = false;
                },error => {

                    if (error['status'] == 404) {
                        AppUtils.displaySnackBar(this.snackBar, 'Aucune facture correspondant à la recherche n\'a été trouvée.', 'OK');
                    } else if (error['status'] == 0) {
                        AppUtils.displaySnackBarErrorConnection(this.snackBar);
                    } else {
                        AppUtils.displaySnackBarErrorServeur(this.snackBar);
                    }

                    this.isLoadingData = false;
                });
        }else{
            this.getData();
        }
    }


    public deleteFilter(){
        this.getData();
        this.searchInput = '';
    }

    public openDeleteDialog(invoice: any) {
        let dialogRef = this.dialog.open(DialogDeleteItemComponent, {
            data: {
                id: invoice['idInvoice'],
                number: invoice['invoiceNumber'],
                dataType: 'invoice'
            },
            panelClass: ['no-padding-dialog', 'min-width-dialog-443'],
            width: '443px',
            height: '165px',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'success'){
                AppUtils.displaySnackBar(this.snackBar, 'Facture supprimée avec succès', 'OK');
                this.getData();
            }
        });
    }

    public openNewItemDialog() {
        let dialogRef = this.dialog.open(DialogCreateNewInvoiceComponent, {
            panelClass: ['no-padding-dialog', 'min-width-dialog-450'],
            width: '450px',
            height: '377px',
            autoFocus: true,
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'success'){
                AppUtils.displaySnackBar(this.snackBar, 'Facture créée avec succès', 'OK');
                this.getData();
            }
        });
    }

    public openImportCsvDialog() {
        let dialogRef = this.dialog.open(ImportInvoiceCsvDialogComponent,{
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

    public doRequest(){
        let url: string = AppSettings.URL_BACKEND + '/invoices';
        let urlRequestData = this.getUrlForRequest();
        url += urlRequestData;

        this.searchInput = '';
        this.isLoadingData = true;

        this.http.get(url, {observe: 'response'})
            .subscribe( response => {
                this.setData(response,false);

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

    public validation(indexInvoice: number) {
        if(this.isRequiredInformationMissing(indexInvoice)){
            AppUtils.displaySnackBarError(this.snackBar, 'Veuillez remplir les champs requis.', 'OK');
        }
        else {
            this.isLoadingData = true;

            let formData = new FormData();
            formData.append('data', JSON.stringify(this.invoiceUpdatedData[indexInvoice]));

            const headers = new HttpHeaders({'enctype': 'multipart/form-data'});

            this.http.put(AppSettings.URL_BACKEND + '/invoice/' + this.invoiceUpdatedData[indexInvoice]['idInvoice'], formData, {headers, observe: 'response'})
                .subscribe(
                    response => {
                        this.invoiceData[indexInvoice] = Object.assign({}, this.invoiceUpdatedData[indexInvoice]);
                        this.invoiceToEdit[indexInvoice] = false;

                        AppUtils.displaySnackBar(this.snackBar, 'Facture modifiée avec succès', 'OK');

                        this.isLoadingData = false;
                    },
                    error => {
                        if (error['status'] == 400) {
                            AppUtils.displaySnackBarError(this.snackBar, 'Modification impossible : ce numéro de facture existe déjà.', 'OK');
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

    public isRequiredInformationMissing(indexOrder: number){
        return this.invoiceUpdatedData[indexOrder]['invoiceNumber'] == null
            || this.invoiceUpdatedData[indexOrder]['invoiceDate'] == null
            || this.invoiceUpdatedData[indexOrder]['clientNumber'] == null
            || this.invoiceUpdatedData[indexOrder]['orderNumber'] == null;
    }

    public initInvoiceToEdit(){
        this.invoiceToEdit = new Array(this.invoiceData.length).fill(false);
    }

    public toggleEditMode(indexInvoiceToEdit: number) {
        this.invoiceToEdit[indexInvoiceToEdit] = !this.invoiceToEdit[indexInvoiceToEdit];
        this.invoiceUpdatedData[indexInvoiceToEdit] = Object.assign({}, this.invoiceData[indexInvoiceToEdit]);
    }

    public getIndex(pageIndex) {
        return pageIndex + this.invoicePaginator.pageSize * this.invoicePaginator.pageIndex;
    }

    public downloadCsvFile() {
        const currentDate = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
        let requestPath = '/csv/invoice';
        let fileName = 'factures_' + currentDate + '.csv';
        this.downloadCsvFileService.downloadFile(requestPath)
            .subscribe(
                response => {
                    let blob:any = new Blob([response], { type: 'text/csv; charset=utf-8' });
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
        if(this.invoiceToEdit == null) return false;

        return this.invoiceToEdit.includes(true);
    }
}
