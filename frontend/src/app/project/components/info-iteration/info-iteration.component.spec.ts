import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoIterationComponent } from './info-iteration.component';

describe('InfoIterationComponent', () => {
  let component: InfoIterationComponent;
  let fixture: ComponentFixture<InfoIterationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoIterationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoIterationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
