import { Component, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/shared/services/http.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-set-paper',
  templateUrl: './set-paper.component.html',
  styleUrls: ['./set-paper.component.scss'],
})
export class SetPaperComponent implements CanDeactivate<SetPaperComponent> {
  public addQuestionForm!: FormGroup;
  public isData: Boolean = false;
  public rowData: { [key: string]: any } = {};
  public isQuestionValid: Boolean = false;
  public formFieldValues: string[] = [];
  public isQuestionChanged: Boolean = false;
  public questionPaperId: String | undefined;
  public isReviewRaised: Boolean = false;
  public reviewStatus: String | undefined;
  public latestComment = [{ reviewer: '', feedback: '', date: '' }];
  public isLatestComment: Boolean = false;
  public isReviewCorrection: Boolean = false;
  public questionPaperVersion: Number | undefined;
  public feedbacks = [];
  public hoveredIndex: number | null | undefined;
  public clickedIndex: number | null | undefined;
  public editIndex: number | null | undefined;
  public questionsByComment = {
    version: null,
    questions: [],
    fileData: null,
    fileName: null,
  };
  public selectedFile: File | null = null;
  public fileData: any;
  public fileName: any;

  constructor(
    private route: ActivatedRoute,
    public formBuilder: FormBuilder,
    private httpService: HttpService,
    private snackBar: MatSnackBar
  ) {
    this.addQuestion();
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent) {
    if (this.isQuestionChanged) {
      event.returnValue =
        'Are you sure you want to leave this page without submitting the form?';
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isQuestionChanged) {
      return confirm(
        'Are you sure you want to leave this page without submitting the form?'
      );
    }
    return true;
  }
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.rowData = JSON.parse(decodeURIComponent(params['data']));
      if (Object.keys(this.rowData).length > 0) {
        this.isData = true;
      }
    });
    this.isReviewCorrection =
      this.rowData['status'] === 'REVIEW CORRECTIONS' ? true : false;
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
            let decryptedQuestions = res?.data?.questions
              ? JSON.parse(
                  CryptoJS.enc.Utf8.stringify(
                    CryptoJS.AES.decrypt(res?.data?.questions, 'questionPaper')
                  )
                )
              : [];
            this.questionPaperId =
              res?.data?.reviewStatus === 'FEEDBACK RAISED'
                ? null
                : res?.data?._id;
            this.formFieldValues = decryptedQuestions;
            this.isReviewRaised = res?.data?.reviewRaised;
            this.reviewStatus = res?.data?.reviewStatus;
            this.questionPaperVersion = res?.data?.version;
            this.isReviewRaised
              ? this.addQuestionForm.get('question')?.disable()
              : '';
            this.getLatestFeedback();
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
  addQuestion() {
    this.addQuestionForm = this.formBuilder.group({
      question: new FormControl('', [Validators.required]),
    });
  }
  onQuestionInputChange(event: any) {
    let value = event.target.value;
    this.isQuestionValid = value.trim().length > 0;
  }
  onAddQuestion() {
    const questionValue = this.addQuestionForm.controls['question'].value;
    if (questionValue) {
      if (this.editIndex) {
        this.formFieldValues.splice(this.editIndex, 0, questionValue);
      } else {
        this.formFieldValues.push(questionValue);
      }
      this.addQuestionForm.controls['question'].reset();
      this.isQuestionValid = false;
      this.isQuestionChanged = true;
      this.selectedFile = null;
      this.fileData = null;
      this.editIndex = null;
    }
  }
  onSubmitPaper() {
    let reqBody = {};
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
      reqBody = {
        paperAssignedId: this.rowData['_id'],
        questionPaperId: this.questionPaperId || null,
        isReviewCorrection: this.isReviewCorrection,
        previousVersion: this.isReviewCorrection
          ? this.questionPaperVersion
          : null,
        isFile: true,
      };
    }
    if (this.formFieldValues.length) {
      reqBody = {
        questions: this.formFieldValues,
        paperAssignedId: this.rowData['_id'],
        questionPaperId: this.questionPaperId || null,
        isReviewCorrection: this.isReviewCorrection,
        previousVersion: this.isReviewCorrection
          ? this.questionPaperVersion
          : null,
        isFile: false,
      };
      this.isReviewCorrection = false;
    }
    formData.append('reqBody', JSON.stringify(reqBody));
    this.httpService.post('/paper/setNewPaper', formData).subscribe(
      (res: any) => {
        this.fileData = res?.data?.questionFile;
        this.fileName = res?.data?.fileName;
        let decryptedQuestions = res?.data?.questions
          ? JSON.parse(
              CryptoJS.enc.Utf8.stringify(
                CryptoJS.AES.decrypt(res?.data?.questions, 'questionPaper')
              )
            )
          : [];
        this.formFieldValues = decryptedQuestions;
        this.questionPaperId = res?.data?._id;
        this.isReviewRaised = res?.data?.reviewRaised;
        this.reviewStatus = res?.data?.reviewStatus;
        this.isReviewRaised
          ? this.addQuestionForm.get('question')?.disable()
          : '';
        this.questionPaperVersion = res?.data?.version;

        this.snackBar.open('PAPER SAVED SUCCESSFULLY', 'X', {
          duration: 3000,
        });
        this.isQuestionChanged = false;
      },
      (error: any) => {
        console.log(error);
        this.snackBar.open('SOMETHING WENT WRONG', 'X', {
          duration: 3000,
        });
      }
    );
  }
  onEdit(value: any, i: any) {
    this.addQuestionForm.controls['question'].setValue(value);
    this.isQuestionValid = true;
    this.formFieldValues.splice(i, 1);
    this.editIndex = i;
  }
  onReview() {
    this.httpService
      .post(`/review/reviewRequest/${this.rowData['_id']}`, '')
      .subscribe(
        (res: any) => {
          this.snackBar.open('REVIEW RAISED SUCCESSFULLY', 'X', {
            duration: 3000,
          });
          this.isReviewRaised = true;
          this.addQuestionForm.get('question')?.disable();
        },
        (error: any) => {
          console.log(error);
          this.snackBar.open('SOMETHING WENT WRONG', 'X', {
            duration: 3000,
          });
        }
      );
    this.isReviewRaised = true;
  }
  getLatestFeedback() {
    this.httpService
      .get(`/review/getLatestComment/${this.rowData['_id']}`, '')
      .subscribe(
        (res: any) => {
          if (res?.data) {
            const date = new Date(res.data.createdAt);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();
            const formattedDate = `${month}-${day}-${year}`;
            this.latestComment = [
              {
                reviewer: res.data.reviewerId.userName,
                feedback: res.data.feedback,
                date: formattedDate,
              },
            ];
            this.isLatestComment = true;
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
  viewAllComments() {
    this.httpService
      .get(`/review/getFeedbackByPaperId/${this.rowData['_id']}`, '')
      .subscribe(
        (res: any) => {
          if (res?.data.length) {
            this.feedbacks = res.data.map((data: any) => {
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
  onClose() {
    this.feedbacks = [];
    this.clickedIndex = null;
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
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    this.formFieldValues = [];
  }
  onDownloadFile() {
    if (this.fileData) {
      window.open(this.fileData, '_blank');
    }
  }
}
