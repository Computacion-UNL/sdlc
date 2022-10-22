import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectIndividualReportComponent } from './project-individual-report.component';

describe('ProjectIndividualReportComponent', () => {
  let component: ProjectIndividualReportComponent;
  let fixture: ComponentFixture<ProjectIndividualReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectIndividualReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectIndividualReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
