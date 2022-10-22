import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMenuMobileComponent } from './project-menu-mobile.component';

describe('ProjectMenuMobileComponent', () => {
  let component: ProjectMenuMobileComponent;
  let fixture: ComponentFixture<ProjectMenuMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectMenuMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMenuMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
