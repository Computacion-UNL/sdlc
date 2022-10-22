import { Component, Input, OnInit } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss']
})
export class EmptyComponent implements OnInit {
  @Input() title: string;
  @Input() description: string;

  prod: boolean = environment.production;
  
  constructor() { }

  ngOnInit(): void {
  }

}
