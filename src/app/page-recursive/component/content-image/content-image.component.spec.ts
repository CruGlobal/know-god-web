import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentImageComponent } from './content-image.component';

describe('ContentImageComponent', () => {
  let component: ContentImageComponent;
  let fixture: ComponentFixture<ContentImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
