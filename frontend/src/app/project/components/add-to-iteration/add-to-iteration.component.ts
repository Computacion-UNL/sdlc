import { Component, Input, OnInit } from '@angular/core';
import { Activity } from '@app/_models/activity';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-to-iteration',
  templateUrl: './add-to-iteration.component.html',
  styleUrls: ['./add-to-iteration.component.scss']
})
export class AddToIterationComponent implements OnInit {
  @Input() activities: Activity[] = [];

  selected: Activity = null;

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
  }

  setActivity(sel: Activity) {
    if(this.selected === sel) {
      this.selected = null;
    }else {
      this.selected = sel;
    }
  }

  addActivity() {
    this.activeModal.close(this.selected);
  }

  newActivity() {
    this.activeModal.close(null);
  }
}
