import { Component, Input, OnInit } from '@angular/core';
import { Activity } from '@app/_models/activity';
import { Commentary } from '@app/_models/commentary';
import { CommentaryService } from '@app/_services/commentary.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-activity-comments',
  templateUrl: './activity-comments.component.html',
  styleUrls: ['./activity-comments.component.scss']
})
export class ActivityCommentsComponent implements OnInit {
  @Input() activity_id: string;
  @Input() disabled: boolean;

  comments: Commentary[] = [];
  loading: boolean = false;

  constructor(
    private commentService: CommentaryService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.fetchComments();
  }

  fetchComments() {
    if (this.activity_id) {
      this.loading = true;
      this.commentService.getAll(this.activity_id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.comments = res;
            this.loading = false;
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading = false;
          }
        });
    }
  }

  addComment(comment: Commentary) {
    this.comments.push(comment);
  }

  removeComment(comment: Commentary) {
    this.comments = this.comments.filter(x => x._id !== comment._id);
  }

}
