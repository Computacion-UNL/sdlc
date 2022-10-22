import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToIterationComponent } from './add-to-iteration.component';

describe('AddToIterationComponent', () => {
  let component: AddToIterationComponent;
  let fixture: ComponentFixture<AddToIterationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddToIterationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToIterationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
