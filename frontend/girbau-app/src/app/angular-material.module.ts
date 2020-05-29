import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule, MatButtonToggleModule, MatIconModule , MatToolbarModule } from '@angular/material';
import { MatSnackBarModule } from '@angular/material';
import { MatTableModule, MatSortModule, MatPaginatorModule } from '@angular/material';
import { MatDialogModule } from '@angular/material';
import { MatCardModule, MatDividerModule, MatInputModule, MatProgressSpinnerModule } from '@angular/material';
import { MatMenuModule } from '@angular/material';
import {MatTooltipModule, MatSidenavModule, MatListModule} from '@angular/material'

const material =[
    MatTabsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatToolbarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCardModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule
];

@NgModule({
    imports: [material],
    exports: [material],

})


export class AngularMaterialModule { }
