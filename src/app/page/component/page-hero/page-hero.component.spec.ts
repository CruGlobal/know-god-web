import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockHero } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { PageHeroComponent } from './page-hero.component';

describe('pageHeaderComponent', () => {
  let component: PageHeroComponent;
  let fixture: ComponentFixture<PageHeroComponent>;
  let pageService: PageService;
  const hero = mockHero('How jesus can \nchange your life.');

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [PageHeroComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(PageHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.hero = hero;
    component.ngOnChanges({
      hero: new SimpleChange(null, hero, true)
    });

    expect(component.heading).toBe(hero.heading);
    expect(component.headingText).toBe('How jesus can <br/>change your life.');
    expect(component.content).toBe(hero.content);
    expect(component.ready).toBeTrue();
  });

  it('Header should chnage if pageService.changeHeader is run', async () => {
    component.hero = hero;
    component.ngOnChanges({
      hero: new SimpleChange(null, hero, true)
    });

    pageService.changeHeader('New header about jesus saving lifes.');
    expect(component.headingText).toBe('New header about jesus saving lifes.');
  });
});
