import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportInvoiceCsvDialogComponent } from './import-invoice-csv-dialog.component';

describe('ImportInvoiceCsvDialogComponent', () => {
  let component: ImportInvoiceCsvDialogComponent;
  let fixture: ComponentFixture<ImportInvoiceCsvDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportInvoiceCsvDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportInvoiceCsvDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
