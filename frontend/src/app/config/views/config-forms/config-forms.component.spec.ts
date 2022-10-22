import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigFormsComponent } from './config-forms.component';

describe('ConfigFormsComponent', () => {
  let component: ConfigFormsComponent;
  let fixture: ComponentFixture<ConfigFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigFormsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
