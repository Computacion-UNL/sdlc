import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectXpComponent } from './project-xp.component';

describe('ProjectXpComponent', () => {
  let component: ProjectXpComponent;
  let fixture: ComponentFixture<ProjectXpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectXpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectXpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
