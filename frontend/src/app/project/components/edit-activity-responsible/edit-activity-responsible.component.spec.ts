import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditActivityResponsibleComponent } from './edit-activity-responsible.component';

describe('EditActivityResponsibleComponent', () => {
  let component: EditActivityResponsibleComponent;
  let fixture: ComponentFixture<EditActivityResponsibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditActivityResponsibleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditActivityResponsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
