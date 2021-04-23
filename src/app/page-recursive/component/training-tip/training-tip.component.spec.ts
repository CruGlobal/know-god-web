import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingTipComponent } from './training-tip.component';

describe('TrainingTipComponent', () => {
  let component: TrainingTipComponent;
  let fixture: ComponentFixture<TrainingTipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingTipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
