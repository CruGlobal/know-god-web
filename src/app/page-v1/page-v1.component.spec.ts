import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageV1Component } from './page-v1.component';

describe('PageComponent', () => {
  let component: PageV1Component;
  let fixture: ComponentFixture<PageV1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PageV1Component]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
