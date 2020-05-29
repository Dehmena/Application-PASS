import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayInvoiceDataComponent } from './display-invoice-data.component';

describe('DisplayInvoiceDataComponent', () => {
  let component: DisplayInvoiceDataComponent;
  let fixture: ComponentFixture<DisplayInvoiceDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayInvoiceDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayInvoiceDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
