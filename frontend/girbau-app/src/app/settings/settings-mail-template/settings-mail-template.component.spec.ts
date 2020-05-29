import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsMailTemplateComponent } from './settings-mail-template.component';

describe('SettingsQuoteMailTemplateComponent', () => {
  let component: SettingsMailTemplateComponent;
  let fixture: ComponentFixture<SettingsMailTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsMailTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsMailTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
