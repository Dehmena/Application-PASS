import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestMailParametersDialogComponent } from './test-mail-parameters-dialog.component';

describe('TestMailParametersDialogComponent', () => {
  let component: TestMailParametersDialogComponent;
  let fixture: ComponentFixture<TestMailParametersDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestMailParametersDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestMailParametersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
