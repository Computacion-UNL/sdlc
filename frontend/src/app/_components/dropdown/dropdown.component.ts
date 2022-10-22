import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  @Input() options = [];
  @Input() data;
  @Output() itemEvent = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    if (this.data['email']) {
      this.filterUserOptions();
    }
  }

  filterUserOptions() {
    this.options.forEach(option => {
      if (this.data['active'] == true) {
        this.options = ['Dar de baja'];
      } else {
        this.options = ['Restaurar'];
      }
    });
  }

  action(option, info) {
    let data = { option: option, info: info }
    this.itemEvent.emit(data);
  }
}
