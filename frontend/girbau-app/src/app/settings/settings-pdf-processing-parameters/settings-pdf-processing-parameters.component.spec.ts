import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPdfProcessingParametersComponent } from './settings-pdf-processing-parameters.component';

describe('SettingsPdfProcessingParametersComponent', () => {
  let component: SettingsPdfProcessingParametersComponent;
  let fixture: ComponentFixture<SettingsPdfProcessingParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsPdfProcessingParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPdfProcessingParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
