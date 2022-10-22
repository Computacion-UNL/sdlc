import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditActivityCommentComponent } from './edit-activity-comment.component';

describe('EditActivityCommentComponent', () => {
  let component: EditActivityCommentComponent;
  let fixture: ComponentFixture<EditActivityCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditActivityCommentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditActivityCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
