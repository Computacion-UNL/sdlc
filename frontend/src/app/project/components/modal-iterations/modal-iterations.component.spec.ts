import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalIterationsComponent } from './modal-iterations.component';

describe('ModalIterationsComponent', () => {
  let component: ModalIterationsComponent;
  let fixture: ComponentFixture<ModalIterationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalIterationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalIterationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
