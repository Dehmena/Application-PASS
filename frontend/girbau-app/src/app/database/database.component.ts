import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-database',
    templateUrl: './database.component.html',
    styleUrls: ['./database.component.css']
})
export class DatabaseComponent implements OnInit {

    navLinksDB = [
        {path: '/database/client', label: 'Client'},
        {path: '/database/quote', label: 'Devis'},
        {path: '/database/order', label: 'Commande'},
        {path: '/database/invoice', label: 'Facture'}
    ];

    public nameDataset: string;

    constructor(route: ActivatedRoute) {
        route.url.subscribe(() => {
            this.nameDataset = route.snapshot.firstChild.data['name'];
        });
    }

    ngOnInit() {
    }

}
