import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AngularMaterialModule } from './angular-material.module';
import { NgxFileDropModule } from 'ngx-file-drop';
import { QuillModule } from 'ngx-quill';
import { HttpClientModule } from '@angular/common/http';
import { PdfViewerModule } from "ng2-pdf-viewer";

import { LogsComponent } from './logs/logs.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';

import { RouterModule, Routes } from '@angular/router';

import {
    MAT_DATE_LOCALE,
    MatDatepickerModule,
    MatExpansionModule,
    MatNativeDateModule,
    MatPaginatorIntl, MatRadioModule,
    MatSlideToggleModule
} from '@angular/material';

import { AppComponent } from './app.component';
import { PdfProcessingComponent } from './pdf-processing/pdf-processing.component';
import { DatabaseComponent } from './database/database.component';
import { DisplayClientDataComponent } from './database/display-client-data/display-client-data.component';
import { DisplayOrderDataComponent } from './database/display-order-data/display-order-data.component';
import { DisplayInvoiceDataComponent } from './database/display-invoice-data/display-invoice-data.component';
import { DisplayQuoteDataComponent } from './database/display-quote-data/display-quote-data.component';
import { SettingsComponent } from './settings/settings.component';
import { TestPdfProcessingParametersDialogComponent } from './settings/settings-pdf-processing-parameters/test-pdf-processing-parameters-dialog/test-pdf-processing-parameters-dialog.component';
import { TestMailParametersDialogComponent } from './settings/settings-mail-parameters/test-mail-parameters-dialog/test-mail-parameters-dialog.component';
import { SettingsMailParametersComponent } from './settings/settings-mail-parameters/settings-mail-parameters.component';
import { SettingsPdfProcessingParametersComponent } from './settings/settings-pdf-processing-parameters/settings-pdf-processing-parameters.component';
import { SettingsMailTemplateComponent } from './settings/settings-mail-template/settings-mail-template.component';
import { SettingsMailSignatureComponent } from './settings/settings-mail-signature/settings-mail-signature.component';
import { DialogDeleteItemComponent } from './database/dialog-delete-item/dialog-delete-item.component';
import { DialogCreateNewClientComponent } from './database/display-client-data/dialog-create-new-client/dialog-create-new-client.component';
import { DialogCreateNewInvoiceComponent } from './database/display-invoice-data/dialog-create-new-invoice/dialog-create-new-invoice.component';
import { DialogCreateNewQuoteComponent } from './database/display-quote-data/dialog-create-new-quote/dialog-create-new-quote.component';
import { DialogCreateNewOrderComponent } from './database/display-order-data/dialog-create-new-order/dialog-create-new-order.component';
import { SettingsOtherParametersComponent } from './settings/settings-other-parameters/settings-other-parameters.component';
import {getFrenchPaginatorIntl} from './french-paginator-intl';
import { TestAddLogoPdfDialogComponent } from './settings/settings-other-parameters/test-add-logo-pdf-dialog/test-add-logo-pdf-dialog.component';
import { ImportQuoteCsvDialogComponent } from './database/display-quote-data/import-quote-csv-dialog/import-quote-csv-dialog.component';
import { ImportOrderCsvDialogComponent } from './database/display-order-data/import-order-csv-dialog/import-order-csv-dialog.component';
import { ImportInvoiceCsvDialogComponent } from './database/display-invoice-data/import-invoice-csv-dialog/import-invoice-csv-dialog.component';
import { ImportClientCsvDialogComponent } from './database/display-client-data/import-client-csv-dialog/import-client-csv-dialog.component';

const appRoutes: Routes = [
    { path: 'pdf-processing', component: PdfProcessingComponent },
    {
        path: 'database',
        component: DatabaseComponent,
        children: [
            { path: 'client', component: DisplayClientDataComponent, data: {'name': 'Clients'} },
            { path: 'quote', component: DisplayQuoteDataComponent, data: {'name': 'Devis'} },
            { path: 'order', component: DisplayOrderDataComponent, data: {'name': 'Commandes'} },
            { path: 'invoice', component: DisplayInvoiceDataComponent, data: {'name': 'Factures'} }
        ]
    },
    { path: 'logs', component: LogsComponent },
    {   path: 'settings',
        component: SettingsComponent,
        children: [
            { path: 'mail-sending', component: SettingsMailParametersComponent, data: {'name': 'Envoi d\'e-mail automatique'} },
            { path: 'pdf-processing', component: SettingsPdfProcessingParametersComponent, data: {'name': 'Traitement de PDF'} },
            { path: 'other', component: SettingsOtherParametersComponent, data: {'name': 'Divers'} },
            { path: 'mail-template-quote', component: SettingsMailTemplateComponent, data: {'name': 'Modèle d\'e-mail pour les devis', 'documentType': 'quote'},  },
            { path: 'mail-template-order', component: SettingsMailTemplateComponent, data: {'name': 'Modèle d\'e-mail pour les commandes', 'documentType': 'order'} },
            { path: 'mail-template-invoice', component: SettingsMailTemplateComponent, data: {'name': 'Modèle d\'e-mail pour les factures', 'documentType': 'invoice'} },
            { path: 'mail-template-first-reminder', component: SettingsMailTemplateComponent, data: {'name': 'Modèle d\'e-mail pour la première relance de devis', 'documentType': 'first_reminder'} },
            { path: 'mail-template-second-reminder', component: SettingsMailTemplateComponent, data: {'name': 'Modèle d\'e-mail pour la deuxième relance de devis', 'documentType': 'second_reminder'} },
            { path: 'mail-signature-template', component: SettingsMailSignatureComponent, data: {'name': 'Modèle de signature d\'e-mail'} }
        ]},
    { path: '', redirectTo: 'pdf-processing', pathMatch: 'full' },
];



@NgModule({
    declarations: [
        AppComponent,
        PdfProcessingComponent,
        LogsComponent,
        DatabaseComponent,
        DisplayClientDataComponent,
        DisplayOrderDataComponent,
        DisplayInvoiceDataComponent,
        DisplayQuoteDataComponent,
        SettingsComponent,
        TestPdfProcessingParametersDialogComponent,
        TestMailParametersDialogComponent,
        SettingsMailParametersComponent,
        SettingsPdfProcessingParametersComponent,
        SettingsMailTemplateComponent,
        SettingsMailSignatureComponent,
        DialogDeleteItemComponent,
        DialogCreateNewClientComponent,
        DialogCreateNewInvoiceComponent,
        DialogCreateNewQuoteComponent,
        DialogCreateNewOrderComponent,
        SettingsOtherParametersComponent,
        TestAddLogoPdfDialogComponent,
        ImportQuoteCsvDialogComponent,
        ImportOrderCsvDialogComponent,
        ImportInvoiceCsvDialogComponent,
        ImportClientCsvDialogComponent
    ],
    imports: [
        BrowserModule,
        NgxFileDropModule,
        FormsModule,
        HttpClientModule,
        GridModule,
        BrowserAnimationsModule,
        AngularMaterialModule,
        InputsModule,
        PdfViewerModule,
        RouterModule.forRoot(appRoutes),
        QuillModule.forRoot(),
        MatNativeDateModule,
        MatDatepickerModule,
        MatExpansionModule,
        MatSlideToggleModule,
        MatRadioModule
    ],
    providers: [
        {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
        {provide: MatPaginatorIntl, useValue: getFrenchPaginatorIntl() }
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        TestPdfProcessingParametersDialogComponent,
        TestMailParametersDialogComponent,
        TestAddLogoPdfDialogComponent,
        DialogDeleteItemComponent,
        DialogCreateNewClientComponent,
        DialogCreateNewInvoiceComponent,
        DialogCreateNewQuoteComponent,
        DialogCreateNewOrderComponent,
        ImportQuoteCsvDialogComponent,
        ImportOrderCsvDialogComponent,
        ImportInvoiceCsvDialogComponent,
        ImportClientCsvDialogComponent
    ]
})
export class AppModule {
}
