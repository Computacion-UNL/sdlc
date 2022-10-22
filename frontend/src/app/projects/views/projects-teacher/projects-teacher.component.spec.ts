import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsTeacherComponent } from './projects-teacher.component';

describe('ProjectsTeacherComponent', () => {
  let component: ProjectsTeacherComponent;
  let fixture: ComponentFixture<ProjectsTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectsTeacherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
