import { Component, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/shared/services/http.service';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-review-paper',
  templateUrl: './review-paper.component.html',
  styleUrls: ['./review-paper.component.scss'],
})
export class ReviewPaperComponent {
  public addCommentForm!: FormGroup;
  public isData: Boolean = false;
  public rowData: { [key: string]: any } = {};
  public questionPaperId: String | undefined;
  public questions = [];
  public feedbacks = [];
  public feedbackRaised: Boolean = false;
  public isApproved: Boolean = false;
  public inReview: Boolean = true;
  public isComment: Boolean = false;
  public isCommentValid: boolean = false;
  public role = localStorage.getItem('role');
  public hoveredIndex: number | null | undefined;
  public clickedIndex: number | null | undefined;
  public fileData: any;
  public fileName: any;

  public questionsByComment = {
    version: null,
    questions: [],
    fileData: null,
    fileName: null,
  };

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private snackBar: MatSnackBar,
    public formBuilder: FormBuilder
  ) {
    this.addComment();
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent) {
    if (this.isCommentValid) {
      event.returnValue =
        'Are you sure you want to leave this page without submitting the form?';
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isCommentValid) {
      return confirm(
        'Are you sure you want to leave this page without submitting the form?'
      );
    }
    return true;
  }
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.rowData = JSON.parse(decodeURIComponent(params['data']));
      if (this.rowData['status'] === 'REVIEW CORRECTIONS') {
        this.feedbackRaised = true;
      }
      if (
        this.rowData['status'] === 'IN PROGRESS' ||
        this.rowData['status'] === 'TODO'
      ) {
        this.inReview = false;
      }
      if (Object.keys(this.rowData).length > 0) {
        this.isData = true;
      }
    });
    this.getQuestions();
  }

  getQuestions() {
    this.httpService
      .get(`/paper/getQuestions/${this.rowData['_id']}`, '')
      .subscribe(
        (res: any) => {
          if (res?.data) {
            this.fileData = res?.data?.questionFile;
            this.fileName = res?.data?.fileName;
            this.questionPaperId = res?.data?._id;
            let decryptedQuestions = res?.data?.questions
              ? JSON.parse(
                  CryptoJS.enc.Utf8.stringify(
                    CryptoJS.AES.decrypt(res?.data?.questions, 'questionPaper')
                  )
                )
              : [];
            this.questions = decryptedQuestions;
            this.getFeedbacks();
          }
        },
        (error: any) => {
          console.log(error);
          this.snackBar.open('SOMETHING WENT WRONG', 'X', {
            duration: 3000,
          });
        }
      );
  }

  getFeedbacks() {
    this.httpService
      .get(`/review/getFeedbackByPaperId/${this.rowData['_id']}`, '')
      .subscribe(
        (res: any) => {
          if (res?.data.length) {
            this.feedbacks = res.data.map((data: any) => {
              if (data?.questionPaperId === this.questionPaperId) {
                this.feedbackRaised = true;
              }
              const date = new Date(data.createdAt);
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              const year = date.getFullYear();
              const formattedDate = `${month}-${day}-${year}`;
              return {
                questionPaperId: data.questionPaperId,
                reviewer: data.reviewerId.userName,
                feedback: data.feedback,
                date: formattedDate,
              };
            });
          }
        },
        (error: any) => {
          console.log(error);
          this.snackBar.open('SOMETHING WENT WRONG', 'X', {
            duration: 3000,
          });
        }
      );
  }

  onApprove() {
    let reqBody = {
      questionPaperId: this.questionPaperId,
      isApproved: true,
      isExaminer: this.role === 'External Examiner' ? true : false,
    };
    this.httpService.post(`/review/approve`, reqBody).subscribe(
      (res: any) => {
        if (res?.data) {
          this.isApproved = true;
        }
      },
      (error: any) => {
        console.log(error);
        this.snackBar.open('SOMETHING WENT WRONG', 'X', {
          duration: 3000,
        });
      }
    );
  }
  onComment() {
    this.isComment = true;
  }
  onCommentInputChange(event: any) {
    let value = event.target.value;
    this.isCommentValid = value.trim().length > 0;
  }
  onAddComment() {
    const CommentValue = this.addCommentForm.controls['comment'].value;
    if (CommentValue) {
      this.addCommentForm.controls['comment'].reset();
      let reqBody = {
        questionPaperId: this.questionPaperId,
        paperAssignedId: this.rowData['_id'],
        comment: CommentValue,
        reviewerId: localStorage.getItem('userId'),
      };
      this.httpService.post(`/review/storeFeedback`, reqBody).subscribe(
        (res: any) => {
          if (res?.data) {
            this.isCommentValid = false;
            this.isComment = false;
            this.getFeedbacks();
          }
        },
        (error: any) => {
          console.log(error);
          this.snackBar.open('SOMETHING WENT WRONG', 'X', {
            duration: 3000,
          });
        }
      );
    }
  }
  addComment() {
    this.addCommentForm = this.formBuilder.group({
      comment: new FormControl('', [Validators.required]),
    });
  }
  getQuestionPaperByComment(questionPaperId: any, i: any) {
    this.httpService
      .post(`/review/getPaperByFeedbackId`, {
        questionPaperId: questionPaperId,
      })
      .subscribe(
        (res: any) => {
          if (res?.data) {
            let decryptedQuestions = res?.data?.questions
              ? JSON.parse(
                  CryptoJS.enc.Utf8.stringify(
                    CryptoJS.AES.decrypt(res?.data?.questions, 'questionPaper')
                  )
                )
              : [];
            this.questionsByComment = {
              version: res.data?.version,
              questions: decryptedQuestions,
              fileData: res?.data?.questionFile,
              fileName: res?.data?.fileName,
            };
            this.clickedIndex = i;
          }
        },
        (error: any) => {
          console.log(error);
          this.snackBar.open('SOMETHING WENT WRONG', 'X', {
            duration: 3000,
          });
        }
      );
  }
  onMouseOver(i: any) {
    this.hoveredIndex = i;
  }
  onMouseOut() {
    this.hoveredIndex = null;
  }
  onClose() {
    this.questionsByComment.questions = [];
    this.questionsByComment.fileData = null;
    this.clickedIndex = null;
  }
  onDownloadFile() {
    if (this.fileData) {
      window.open(this.fileData, '_blank');
    }
  }
}
