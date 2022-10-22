import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitIterationComponent } from './init-iteration.component';

describe('InitIterationComponent', () => {
  let component: InitIterationComponent;
  let fixture: ComponentFixture<InitIterationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitIterationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InitIterationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
