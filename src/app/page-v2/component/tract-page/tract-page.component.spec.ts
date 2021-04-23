import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TractPageComponent } from './tract-page.component';

describe('TractPageComponent', () => {
  let component: TractPageComponent;
  let fixture: ComponentFixture<TractPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TractPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TractPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
