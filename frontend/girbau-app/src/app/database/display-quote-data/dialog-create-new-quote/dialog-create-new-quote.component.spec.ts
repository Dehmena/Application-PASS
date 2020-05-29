import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateNewQuoteComponent } from './dialog-create-new-quote.component';

describe('DialogCreateNewQuoteComponent', () => {
  let component: DialogCreateNewQuoteComponent;
  let fixture: ComponentFixture<DialogCreateNewQuoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogCreateNewQuoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCreateNewQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
