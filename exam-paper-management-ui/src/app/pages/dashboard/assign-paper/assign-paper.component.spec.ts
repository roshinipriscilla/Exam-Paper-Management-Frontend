import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPaperComponent } from './assign-paper.component';

describe('AssignPaperComponent', () => {
  let component: AssignPaperComponent;
  let fixture: ComponentFixture<AssignPaperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignPaperComponent]
    });
    fixture = TestBed.createComponent(AssignPaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
