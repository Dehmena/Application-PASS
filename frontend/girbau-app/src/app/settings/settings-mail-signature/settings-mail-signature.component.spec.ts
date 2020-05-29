import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsMailSignatureComponent } from './settings-mail-signature.component';

describe('SettingsMailSignatureComponent', () => {
  let component: SettingsMailSignatureComponent;
  let fixture: ComponentFixture<SettingsMailSignatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsMailSignatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsMailSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
