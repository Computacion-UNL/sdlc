import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAttachmentComponent } from './create-attachment.component';

describe('CreateAttachmentComponent', () => {
  let component: CreateAttachmentComponent;
  let fixture: ComponentFixture<CreateAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAttachmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
