import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewPaperComponent } from './review-paper.component';

describe('ReviewPaperComponent', () => {
  let component: ReviewPaperComponent;
  let fixture: ComponentFixture<ReviewPaperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReviewPaperComponent]
    });
    fixture = TestBed.createComponent(ReviewPaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
