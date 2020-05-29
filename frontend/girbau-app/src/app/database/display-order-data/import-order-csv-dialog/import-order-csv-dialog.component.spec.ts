import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportOrderCsvDialogComponent } from './import-order-csv-dialog.component';

describe('ImportOrderCsvDialogComponent', () => {
  let component: ImportOrderCsvDialogComponent;
  let fixture: ComponentFixture<ImportOrderCsvDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportOrderCsvDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportOrderCsvDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
