import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppSettings} from '../../app-settings';
import {MatSnackBar} from '@angular/material';
import {AppUtils} from '../../app-utils';

@Component({
  selector: 'app-settings-mail-signature',
  templateUrl: './settings-mail-signature.component.html',
  styleUrls: ['../settings.component.css']
})
export class SettingsMailSignatureComponent implements OnInit {

    public mailSignature: string;
    public mailSignatureUpdated: string;

    public toolbar = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],

            [{ 'script': 'sub'}, { 'script': 'super' }],

            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            [{ 'color': [] }, { 'background': [] }],
            ['clean'],

            ['link', 'image']
        ]
    };

    public isGetParametersLoading : boolean;
    public isGetParametersSuccessful: boolean;

    public isEditingMailSignature: boolean;
    public isUpdateMailSignatureLoading: boolean;

    constructor(public http: HttpClient,
                public snackBar: MatSnackBar) { }

    ngOnInit() {
        this.mailSignature = null;

        this.isEditingMailSignature = false;
        this.isUpdateMailSignatureLoading = false;

        this.isGetParametersSuccessful = false;
        this.isGetParametersLoading = true;

        this.http.get(AppSettings.URL_BACKEND + '/config/template-mail', {observe: 'response'})
            .subscribe(response => {
                this.mailSignature = response.body['signature'];
                this.mailSignatureUpdated = this.mailSignature;

                this.isGetParametersLoading = false;
                this.isGetParametersSuccessful = true;

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

    public updateMailSignature(){
        this.isUpdateMailSignatureLoading = true;

        if(this.mailSignatureUpdated == null) this.mailSignatureUpdated = "";

        this.mailSignatureUpdated = this.mailSignatureUpdated.replace(/<p>/g, "<div>");
        this.mailSignatureUpdated = this.mailSignatureUpdated.replace(/<\/p>/g, "</div>");

        let formData = new FormData();
        formData.append('data', JSON.stringify({'signature': this.mailSignatureUpdated}));

        let headers = new HttpHeaders({
            'enctype': 'multipart/form-data'
        });

        this.http.put(AppSettings.URL_BACKEND + '/config/mail-signature', formData, {headers, observe: 'response'})
            .subscribe(response => {
                this.isUpdateMailSignatureLoading = false;
                this.isEditingMailSignature = false;

                this.mailSignature = this.mailSignatureUpdated;

                AppUtils.displaySnackBar(this.snackBar, "Le modèle pour la signature d'e-mail a bien été mis à jour.", "OK");
            }, error => {
                if(error['status'] == 0){
                    AppUtils.displaySnackBarErrorConnection(this.snackBar);
                }
                else{
                    AppUtils.displaySnackBarErrorServeur(this.snackBar);
                }

                this.isUpdateMailSignatureLoading = false;
            });
    }

    public toggleEditModeSignatureTemplate(){
        this.isEditingMailSignature = !this.isEditingMailSignature;
        this.mailSignatureUpdated = this.mailSignature
    }
}
