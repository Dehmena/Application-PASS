import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    animations: [
        // Each unique animation requires its own trigger. The first argument of the trigger function is the name
        trigger('rotatedState', [
            state('default', style({ transform: 'rotate(0)' })),
            state('rotated', style({ transform: 'rotate(180deg)' })),
            transition('rotated => default', animate('200ms')),
            transition('default => rotated', animate('200ms'))
        ])
    ],
    encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit{

    title = 'girbau-app';

    public isDatabaseTabOpen: boolean = false;
    public stateDatabaseTab = 'default';

    public isSettingsTabOpen: boolean = false;
    public stateSettingsTab = 'default';

    public isMailTemplateTabOpen: boolean = false;
    public stateMailTemplateTab = 'default';

    constructor(public matIconRegistry: MatIconRegistry,
                public domSanitizer: DomSanitizer) {

    }

    ngOnInit() {
        this.matIconRegistry.addSvgIcon(
            'logo_PASS',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/logo_PASS.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'database_client',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/database_client.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'database_quote',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/database_quote.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'database_order',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/database_order.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'database_invoice',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/database_invoice.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'settings_mail',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/settings_mail.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'settings_pdf_processing',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/settings_pdf_processing.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'settings_other',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/settings_other.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'settings_mail_template',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/settings_mail_template.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'mail_quote',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/mail_quote.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'mail_order',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/mail_order.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'mail_invoice',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/mail_invoice.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'mail_first_reminder',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/mail_first_reminder.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'mail_second_reminder',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/mail_second_reminder.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'mail_signature',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/mail_signature.svg')
        );
    }

    toggleDatabaseTab(){
        this.isDatabaseTabOpen = !this.isDatabaseTabOpen;

        this.stateDatabaseTab = this.isDatabaseTabOpen ? 'rotated' : 'default';
    }

    toggleSettingsTab(){
        this.isSettingsTabOpen = !this.isSettingsTabOpen;
        this.isMailTemplateTabOpen = false;

        this.stateMailTemplateTab = this.isMailTemplateTabOpen ? 'rotated' : 'default';
        this.stateSettingsTab = this.isSettingsTabOpen ? 'rotated' : 'default';
    }

    toggleMailTemplateTab(){
        this.isMailTemplateTabOpen = !this.isMailTemplateTabOpen;

        this.stateMailTemplateTab = this.isMailTemplateTabOpen ? 'rotated' : 'default';
    }
}

