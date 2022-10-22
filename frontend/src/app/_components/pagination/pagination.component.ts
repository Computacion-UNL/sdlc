import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  @Input() size: number;
  @Input() config: any;
  @Input() only_buttons: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  setPage(page: number) {
    this.config.currentPage = page;
  }

}
