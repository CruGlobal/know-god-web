import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentAnimationComponent } from './content-animation.component';

describe('ContentAnimationComponent', () => {
  let component: ContentAnimationComponent;
  let fixture: ComponentFixture<ContentAnimationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentAnimationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
