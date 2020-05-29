import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPdfProcessingParametersDialogComponent } from './test-pdf-processing-parameters-dialog.component';

describe('TestPdfProcessingParametersDialogComponent', () => {
  let component: TestPdfProcessingParametersDialogComponent;
  let fixture: ComponentFixture<TestPdfProcessingParametersDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestPdfProcessingParametersDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPdfProcessingParametersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
