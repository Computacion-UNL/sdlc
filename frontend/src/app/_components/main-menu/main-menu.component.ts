import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/_models/user';
import { AuthenticationService } from '@app/_services/auth.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  @Output() close = new EventEmitter();

  currentUser: User;
  url_user: string;

  prod: boolean = environment.production;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
  ) {
    this.authService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit(): void {
    this.url_user = this.currentUser.image ? `${environment.apiURL.public}${this.currentUser.image}` : undefined;
  }

  logout(event: any) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  closeMenu() {
    this.close.emit();
  }

}
