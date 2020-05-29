import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateNewOrderComponent } from './dialog-create-new-order.component';

describe('DialogCreateNewOrderComponent', () => {
  let component: DialogCreateNewOrderComponent;
  let fixture: ComponentFixture<DialogCreateNewOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogCreateNewOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCreateNewOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
