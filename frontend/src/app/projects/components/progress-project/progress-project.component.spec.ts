import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressProjectComponent } from './progress-project.component';

describe('ProgressProjectComponent', () => {
  let component: ProgressProjectComponent;
  let fixture: ComponentFixture<ProgressProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressProjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
