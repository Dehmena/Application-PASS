import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQuoteDataComponent } from './display-quote-data.component';

describe('DisplayQuoteDataComponent', () => {
  let component: DisplayQuoteDataComponent;
  let fixture: ComponentFixture<DisplayQuoteDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayQuoteDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQuoteDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
