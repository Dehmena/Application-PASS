import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAddLogoPdfDialogComponent } from './test-add-logo-pdf-dialog.component';

describe('TestAddLogoPdfDialogComponent', () => {
  let component: TestAddLogoPdfDialogComponent;
  let fixture: ComponentFixture<TestAddLogoPdfDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestAddLogoPdfDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAddLogoPdfDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
