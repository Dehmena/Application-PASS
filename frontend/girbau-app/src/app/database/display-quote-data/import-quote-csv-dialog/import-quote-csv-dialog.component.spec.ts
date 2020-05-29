import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportQuoteCsvDialogComponent } from './import-quote-csv-dialog.component';

describe('ImportCsvDialogComponent', () => {
  let component: ImportQuoteCsvDialogComponent;
  let fixture: ComponentFixture<ImportQuoteCsvDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportQuoteCsvDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportQuoteCsvDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
