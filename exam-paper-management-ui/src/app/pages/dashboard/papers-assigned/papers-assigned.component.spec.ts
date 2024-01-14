import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PapersAssignedComponent } from './papers-assigned.component';

describe('PapersAssignedComponent', () => {
  let component: PapersAssignedComponent;
  let fixture: ComponentFixture<PapersAssignedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PapersAssignedComponent]
    });
    fixture = TestBed.createComponent(PapersAssignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
