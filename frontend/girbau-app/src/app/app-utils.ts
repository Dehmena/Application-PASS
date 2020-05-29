import {NgxFileDropEntry} from 'ngx-file-drop';
import {MatDatepickerInputEvent, MatSnackBar} from '@angular/material';

export class AppUtils{

    public static errorServerConnection = "Erreur de connexion avec le serveur";
    public static errorServer = "Erreur serveur";

    public static isPdfFile(file: NgxFileDropEntry) {
        // Check if the entry is a file
        if (!file.fileEntry.isFile) {
            return false;
        }

        const allowedFiles = '.pdf';

        const regexExtension = /(?:\.([^.]+))?$/;
        const extension = regexExtension.exec(file.fileEntry.name);

        return extension[0] === allowedFiles;
    }

    public static isCsvFile(file: File) {
        const allowedFiles = '.csv';

        const regexExtension = /(?:\.([^.]+))?$/;
        const extension = regexExtension.exec(file.name);

        return extension[0] === allowedFiles;
    }

    public static getFirstPdf(files: NgxFileDropEntry[]){
        for (const droppedFile of files) {
            if(AppUtils.isPdfFile(droppedFile)){
                return droppedFile;
            }
        }
        return null;
    }

    public static getFirstPdfFile(files: FileList){
        const allowedFiles = '.pdf';
        const regexExtension = /(?:\.([^.]+))?$/;

        for(let i = 0; i < files.length; ++i){
            let extension = regexExtension.exec(files.item(i).name);

            if(extension[0] === allowedFiles) return files.item(i);
        }

        return null;
    }

    public static translateDataType(dataType: string){
        switch (dataType) {
            case 'quote':
                return 'Devis';
            case 'order':
                return 'Commande';
            case 'invoice':
                return 'Facture';
            case 'client':
                return 'Client';
            default:
                return '' ;
        }
    }

    public static dashIfEmpty(data: any){
        if(data == null || data === '') return '-';

        return data;
    }

    public static updateDate(event: MatDatepickerInputEvent<unknown>) {
        let date = new Date(event.value.toString());
        return date.toDateString();
    }

    public static toDate(date) {
        if (date == null) return date;

        return new Date(date);
    }

    public static displaySnackBar(snackBar: MatSnackBar, message: string, action: string) {
        snackBar.open(message, action, {
            horizontalPosition: 'center',
            duration: 5000,
        });
    }

    public static displaySnackBarError(snackBar: MatSnackBar, message: string, action: string) {
        snackBar.open(message, action, {
            horizontalPosition: 'center',
            panelClass: ['snackbar-error']
        });
    }

    public static displaySnackBarErrorConnection(snackBar: MatSnackBar){
        snackBar.open(AppUtils.errorServerConnection, "OK", {
            horizontalPosition: 'center',
            panelClass: ['snackbar-error']
        })
    }

    public static displaySnackBarErrorServeur(snackBar: MatSnackBar){
        snackBar.open(AppUtils.errorServer, "OK", {
            horizontalPosition: 'center',
            panelClass: ['snackbar-error']
        })
    }

    public static limitInput(event: Event, maxLength){
        if( event.target['value'].length >= maxLength){
            event.target['value'] = event.target['value'].slice(0, maxLength);
        }
    }

    public static onlyNumber(event: any) {
        const pattern = /[0-9]/;
        const inputChar = String.fromCharCode((event as KeyboardEvent).charCode);
        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    public static pasteOnlyNumber(event: any){
        const pattern = /[0-9]/;
        let clipboardData = event.clipboardData;
        let pastedText = clipboardData.getData('text');
        if(pastedText.includes('e') || pastedText.includes('E') || pastedText.includes('.') || pastedText.includes(',') || pastedText.includes('+') || pastedText.includes('-')){
            event.preventDefault();
        }
        else if(!pattern.test(pastedText)) {
            event.preventDefault();
        }
    }

    public static onlyFloat(event: any) {
        const pattern = /[0-9.,]/;
        const inputChar = String.fromCharCode((event as KeyboardEvent).charCode);
        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    public static pasteOnlyFloat(event: any){
        const pattern = /[0-9.,]/;
        let clipboardData = event.clipboardData;
        let pastedText = clipboardData.getData('text');
        if(pastedText.includes('e') || pastedText.includes('E') || pastedText.includes('+') || pastedText.includes('-')){
            event.preventDefault();
        }
        else if(!pattern.test(pastedText)) {
            event.preventDefault();
        }
    }

    public static preventWriting(event: any){
        event.preventDefault();
    }
}
