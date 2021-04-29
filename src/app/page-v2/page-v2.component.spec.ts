import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageV2Component } from './page-v2.component';

describe('PageV2Component', () => {
  let component: PageV2Component;
  let fixture: ComponentFixture<PageV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PageV2Component]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
