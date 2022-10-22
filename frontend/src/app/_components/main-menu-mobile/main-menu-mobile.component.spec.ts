import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMenuMobileComponent } from './main-menu-mobile.component';

describe('MainMenuMobileComponent', () => {
  let component: MainMenuMobileComponent;
  let fixture: ComponentFixture<MainMenuMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainMenuMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMenuMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
