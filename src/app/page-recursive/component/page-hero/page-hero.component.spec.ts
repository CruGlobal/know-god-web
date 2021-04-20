import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHeroComponent } from './page-hero.component';

describe('PageHeroComponent', () => {
  let component: PageHeroComponent;
  let fixture: ComponentFixture<PageHeroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageHeroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
