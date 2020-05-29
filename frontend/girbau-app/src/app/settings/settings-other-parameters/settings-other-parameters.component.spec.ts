import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsOtherParametersComponent } from './settings-other-parameters.component';

describe('SettingsOtherParametersComponent', () => {
  let component: SettingsOtherParametersComponent;
  let fixture: ComponentFixture<SettingsOtherParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsOtherParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsOtherParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
