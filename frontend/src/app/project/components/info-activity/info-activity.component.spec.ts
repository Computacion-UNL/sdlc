import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoActivityComponent } from './info-activity.component';

describe('InfoActivityComponent', () => {
  let component: InfoActivityComponent;
  let fixture: ComponentFixture<InfoActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoActivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
