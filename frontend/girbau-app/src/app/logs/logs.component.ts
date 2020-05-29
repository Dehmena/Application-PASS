import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSort, MatTableDataSource, MatPaginator, MatSnackBar} from '@angular/material/';
import {HttpClient} from '@angular/common/http';
import {AppSettings} from '../app-settings';
import {AppUtils} from '../app-utils';

export interface LogsInterface {
    idLog: string;
    dateLog: Date;
    typeLog: string;
    message: string;
    error: boolean;
}

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.css']
})

export class LogsComponent implements OnInit {

    public logsData: LogsInterface[] = null;
    public table: MatTableDataSource<LogsInterface>;

    public isGetLogsLoading: boolean;
    public isGetLogsSuccess: boolean;

    constructor(public http: HttpClient,
                public snackBar: MatSnackBar) {
    }

    displayedColumns: string[] = ['typeLog', 'message', 'dateLog'];

    /*Sorting and pagination*/
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

    ngOnInit() {
        this.isGetLogsLoading = true;
        this.isGetLogsSuccess = false;

        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length == 0 || pageSize == 0) {
                return `0 de ${length}`;
            }

            length = Math.max(length, 0);

            const startIndex = page * pageSize;

            // If the start index exceeds the list length, do not try and fix the end index to the end.
            const endIndex = startIndex < length ?
                Math.min(startIndex + pageSize, length) :
                startIndex + pageSize;

            return `${startIndex + 1} - ${endIndex} de ${length}`;
        };

        this.http.get(AppSettings.URL_BACKEND + '/logs', {observe: 'response'})
            .subscribe(response => {

                this.logsData = response.body as LogsInterface[];
                this.table = new MatTableDataSource(this.logsData);

                this.table.paginator = this.paginator;

                this.reformatDates();
                this.sort.active = 'dateLog';
                this.sort.direction = 'desc';
                this.sort.disableClear = true;
                this.table.sort = this.sort;

                this.isGetLogsLoading = false;
                this.isGetLogsSuccess = true;

            }, error => {

                if (error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                } else {
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isGetLogsLoading = false;
                this.isGetLogsSuccess = false;
            });
    }

    public reformatDates() {
        for (let i = 0; i < this.logsData.length; i++) {
            this.logsData[i]['dateLog'] = new Date(this.logsData[i]['dateLog']);
        }
    }


    public toIcon(iconString: string) {
        switch (iconString) {
            case 'pdf-processing':
                return 'picture_as_pdf';

            case 'database':
                return 'storage';

            case 'settings':
                return 'settings';

            case 'unarchive':
                return 'unarchive';

            case 'scheduler':
                return 'send';

            case 'quote_cancellation_scheduler':
                return 'cancel';

            default:
                return 'history';
        }
    }
}
