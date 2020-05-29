import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsMailParametersComponent } from './settings-mail-parameters.component';

describe('SettingsMailParametersComponent', () => {
  let component: SettingsMailParametersComponent;
  let fixture: ComponentFixture<SettingsMailParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsMailParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsMailParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
