import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfProcessingComponent } from './pdf-processing.component';

describe('DropFileComponentComponent', () => {
  let component: PdfProcessingComponent;
  let fixture: ComponentFixture<PdfProcessingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdfProcessingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
