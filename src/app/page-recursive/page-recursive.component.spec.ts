import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageRecursiveComponent } from './page-recursive.component';

describe('PageRecursiveComponent', () => {
  let component: PageRecursiveComponent;
  let fixture: ComponentFixture<PageRecursiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageRecursiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageRecursiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
