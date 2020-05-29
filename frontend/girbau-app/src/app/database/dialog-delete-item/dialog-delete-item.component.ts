import {Component, OnInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {AppSettings} from '../../app-settings';
import {AppUtils} from '../../app-utils';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-dialog-delete-item',
    templateUrl: './dialog-delete-item.component.html',
    styleUrls: ['../database.component.css', './dialog-delete-item.component.css']
})
export class DialogDeleteItemComponent implements OnInit {

    public dataName : string;
    public isLoadingDeleteData: boolean;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<DialogDeleteItemComponent>,
                public http: HttpClient,
                public snackBar: MatSnackBar) { }

    ngOnInit() {
        this.dataName = AppUtils.translateDataType(this.data['dataType']);
        this.isLoadingDeleteData = false;
    }

    public closeDialog(){
        this.dialogRef.close();
    }

    public deleteData(){
        this.isLoadingDeleteData = true;

        let url: string = AppSettings.URL_BACKEND + '/' + this.data['dataType'] + "/" + this.data['id'];

        this.http.delete(url, {observe: 'response'})
            .subscribe( response => {
                this.dialogRef.close('success');
            }, error =>{

                if(error['status'] == 0) {
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                }
                else{
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isLoadingDeleteData = false;
            });

    }
}
