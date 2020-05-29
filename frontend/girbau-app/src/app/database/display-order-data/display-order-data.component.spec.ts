import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayOrderDataComponent } from './display-order-data.component';

describe('DisplayOrderDataComponent', () => {
  let component: DisplayOrderDataComponent;
  let fixture: ComponentFixture<DisplayOrderDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayOrderDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayOrderDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
