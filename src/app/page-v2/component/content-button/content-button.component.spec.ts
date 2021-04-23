import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentButtonComponent } from './content-button.component';

describe('ContentButtonComponent', () => {
  let component: ContentButtonComponent;
  let fixture: ComponentFixture<ContentButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
