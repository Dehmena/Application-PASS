import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportClientCsvDialogComponent } from './import-client-csv-dialog.component';

describe('ImportClientCsvDialogComponent', () => {
  let component: ImportClientCsvDialogComponent;
  let fixture: ComponentFixture<ImportClientCsvDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportClientCsvDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportClientCsvDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
