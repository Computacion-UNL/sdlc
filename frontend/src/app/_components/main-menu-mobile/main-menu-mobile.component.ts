import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/_models/user';
import { AuthenticationService } from '@app/_services/auth.service';

@Component({
  selector: 'app-main-menu-mobile',
  templateUrl: './main-menu-mobile.component.html',
  styleUrls: ['./main-menu-mobile.component.scss']
})
export class MainMenuMobileComponent implements OnInit {
  @Output() open = new EventEmitter();
  
  currentUser: User;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
  ) {
    this.authService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit(): void {
  }

  openMenu() {
    this.open.emit();
  }

  logout(event: any) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
