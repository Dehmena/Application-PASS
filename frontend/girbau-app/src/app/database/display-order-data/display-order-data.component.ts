import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatIconRegistry, MatPaginator, MatSnackBar, MatTableDataSource} from '@angular/material';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../app-settings';
import {formatDate} from '@angular/common';
import {DialogDeleteItemComponent} from '../dialog-delete-item/dialog-delete-item.component';
import {DialogCreateNewOrderComponent} from './dialog-create-new-order/dialog-create-new-order.component';
import {DownloadCsvFileService} from '../download-csv-file/download-csv-file.service';
import * as FileSaver from 'file-saver';
import {DomSanitizer} from '@angular/platform-browser';
import {AppUtils} from '../../app-utils';
import {ImportOrderCsvDialogComponent} from './import-order-csv-dialog/import-order-csv-dialog.component';


export interface OrderInterface {
    idOrder: number;
    orderNumber: number;
    orderDate: string;
    orderTotalAmount: number;
    clientNumber: number;
    quoteNumber: number;
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
    selector: 'app-display-order-data',
    templateUrl: './display-order-data.component.html',
    styleUrls: ['../database.component.css', './display-order-data.component.css']
})

export class DisplayOrderDataComponent implements OnInit {
    public totalDataCount: number;
    public acsRequest: boolean = true;
    public searchInput: string = '';

    public orderToEdit: boolean[] = null;
    public orderData: OrderInterface[] = null;
    public orderUpdatedData: OrderInterface[] = null;

    public link: LinkInterface = null;
    public table: MatTableDataSource<OrderInterface>;
    public displayedColumns: string[] = ['orderNumber' , 'orderDate' , 'orderTotalAmount' , 'clientNumber' , 'quoteNumber', 'separation', 'button1', 'button2'];

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
    @ViewChild(MatPaginator, {static: true}) orderPaginator: MatPaginator;

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

        this.orderPaginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
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

        this.http.get(AppSettings.URL_BACKEND + '/orders', {observe: 'response'})
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
        this.table.paginator = this.orderPaginator;
        this.initOrderToEdit();
    }

    /*Set data from request*/
    public setData(response:any, requestNextPage: boolean){
        let orderDataTemp: OrderInterface[] = null;

        if(!response.body.hasOwnProperty('data')){
            let requestData = response.body as OrderInterface;
            this.orderData = [requestData];
        }else{

            if(requestNextPage){
                orderDataTemp = response.body['data'] as OrderInterface[];
                this.orderData = this.orderData.concat(orderDataTemp);
            }else
                this.orderData = response.body['data'] as OrderInterface[];

            this.link = response.body['link'] as LinkInterface;
            this.totalDataCount = response.body['totalDataCount'];
        }
        this.orderUpdatedData = Object.assign([], this.orderData);

        this.setTable(this.orderData);
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
        return (this.orderPaginator.length === this.totalDataCount);
    }

    /*Return true when user check last page of table*/
    public isLastPage(currentPage: number){
        return (this.orderPaginator.getNumberOfPages() - 1) === currentPage;
    }

    public switchAscDescRequest(){
        if (this.acsRequest){
            this.acsRequest = !this.acsRequest;
            return 'asc';
        }else{
            this.acsRequest = !this.acsRequest;
            return 'desc';
        }
    }

    public getUrlForRequest(){
        let sort_order = this.switchAscDescRequest();
        return '?' + 'sort_order=' + sort_order;
    }

    public findByNumber(docNumber: string){
        if(docNumber != ''){
            this.isLoadingData = true;

            let url: string = AppSettings.URL_BACKEND + '/order' + '/' + docNumber;
            this.http.get(url, {observe: 'response'})
                .subscribe( response => {
                    this.setData(response,false);

                    this.isLoadingData = false;
                },error => {

                    if (error['status'] == 404) {
                        AppUtils.displaySnackBar(this.snackBar, 'Aucune commande correspondant à la recherche n\'a été trouvée.', 'OK');
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

    public openDeleteDialog(order: any) {
        let dialogRef = this.dialog.open(DialogDeleteItemComponent, {
            data: {
                id: order['idOrder'],
                number: order['orderNumber'],
                dataType: 'order'
            },
            panelClass: ['no-padding-dialog', 'min-width-dialog-443'],
            width: '443px',
            height: '165px',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'success'){
                AppUtils.displaySnackBar(this.snackBar, 'Commande supprimée avec succès', 'OK');
                this.getData();
            }
        });
    }

    public openNewItemDialog() {
        let dialogRef = this.dialog.open(DialogCreateNewOrderComponent, {
            panelClass: ['no-padding-dialog', 'min-width-dialog-450'],
            width: '450px',
            height: '438px',
            autoFocus: true,
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'success'){
                AppUtils.displaySnackBar(this.snackBar, 'Commande créée avec succès', 'OK');
                this.getData();
            }
        });
    }

    public openImportCsvDialog() {
        let dialogRef = this.dialog.open(ImportOrderCsvDialogComponent,{
            panelClass: ['no-padding-dialog', 'min-width-dialog-800'],
            width: '800px',
            minHeight: '200px',
            autoFocus: false,
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'success'){
                AppUtils.displaySnackBar(this.snackBar, 'Données importées avec succès.', 'OK');
                this.getData();
            }
        });
    }

    public doRequest(){
        let url: string = AppSettings.URL_BACKEND + '/orders';
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

    public validation(indexOrder) {
        if(this.isRequiredInformationMissing(indexOrder)){
            AppUtils.displaySnackBarError(this.snackBar, 'Veuillez remplir les champs requis.', 'OK');
        }
        else {
            this.isLoadingData = true;

            let formData = new FormData();
            formData.append('data', JSON.stringify(this.orderUpdatedData[indexOrder]));

            const headers = new HttpHeaders({'enctype': 'multipart/form-data'});

            this.http.put(AppSettings.URL_BACKEND + '/order/' + this.orderUpdatedData[indexOrder]['idOrder'], formData, {
                headers,
                observe: 'response'
            })
                .subscribe(
                    response => {
                        this.orderData[indexOrder] = Object.assign({}, this.orderUpdatedData[indexOrder]);
                        this.orderToEdit[indexOrder] = false;

                        AppUtils.displaySnackBar(this.snackBar, 'Commande modifiée avec succès', 'OK');

                        this.isLoadingData = false;
                    },
                    error => {
                        if (error['status'] == 400) {
                            AppUtils.displaySnackBarError(this.snackBar, 'Modification impossible : ce numéro de commande existe déjà.', 'OK');
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
        return this.orderUpdatedData[indexOrder]['orderNumber'] == null
            || this.orderUpdatedData[indexOrder]['orderDate'] == null
            || this.orderUpdatedData[indexOrder]['orderTotalAmount'] == null
            || this.orderUpdatedData[indexOrder]['clientNumber'] == null;
    }

    public initOrderToEdit(){
        this.orderToEdit = new Array(this.orderData.length).fill(false);
    }

    public toggleEditMode(indexOrderToEdit: number) {
        this.orderToEdit[indexOrderToEdit] = !this.orderToEdit[indexOrderToEdit];
        this.orderUpdatedData[indexOrderToEdit] = Object.assign({}, this.orderData[indexOrderToEdit]);
    }

    public getIndex(pageIndex) {
        return pageIndex + this.orderPaginator.pageSize * this.orderPaginator.pageIndex;
    }

    public downloadCsvFile() {
        const currentDate = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
        let requestPath = '/csv/order';
        let fileName = 'commandes_' + currentDate + '.csv';
        this.downloadCsvFileService.downloadFile(requestPath)
            .subscribe(
                response => {
                        let blob:any = new Blob([response], { type: 'text/csv; charset=utf-8' });
                        FileSaver.saveAs(blob, fileName);
                    },error => {

                        if (error['status'] == 0) {
                            AppUtils.displaySnackBarErrorConnection(this.snackBar);
                        } else {
                            AppUtils.displaySnackBarErrorServeur(this.snackBar);
                        }
                    });
    }

    public editMode(){
        if(this.orderToEdit == null) return false;

        return this.orderToEdit.includes(true);
    }
}
