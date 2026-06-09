import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockCard } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentCardComponent } from './content-card.component';

describe('ContentCardComponent', () => {
  let component: ContentCardComponent;
  let fixture: ComponentFixture<ContentCardComponent>;
  const card = mockCard(false, false);
  const cardWithUrl = mockCard(false, true);
  const cardWithEvents = mockCard(true, false);
  const cardWithUrlAndEvents = mockCard(true, true);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentCardComponent],
      providers: [PageService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.item = card;
    component.ngOnChanges({
      item: new SimpleChange(null, card, true)
    });

    expect(component.contents).toEqual(card.content);
    expect(component.background).toEqual(card.backgroundColor);
    expect(component.ready).toBeTrue();

    const pageService = TestBed.inject(PageService);
    spyOn(pageService, 'formAction');

    component.onClick();

    expect(pageService.formAction).not.toHaveBeenCalled();
  });

  it('fires events only when clicked on with events', async () => {
    component.item = cardWithEvents;
    component.ngOnChanges({
      item: new SimpleChange(null, cardWithEvents, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.inject(PageService);
    spyOn(pageService, 'formAction');

    component.onClick();
    expect(pageService.formAction).toHaveBeenCalled();

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBeNull();
  });

  it('opens urls only when clicked on with url', async () => {
    component.item = cardWithUrl;
    component.ngOnChanges({
      item: new SimpleChange(null, cardWithUrl, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe(cardWithUrl.url);
    expect(anchor.getAttribute('target')).toBe('_blank');

    component.onClick();
    expect(pageService.formAction).not.toHaveBeenCalled();
  });

  it('fires events and opens url when both are present', () => {
    component.item = cardWithUrlAndEvents;
    component.ngOnChanges({
      item: new SimpleChange(null, cardWithUrlAndEvents, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe(cardWithUrlAndEvents.url);
    expect(anchor.getAttribute('target')).toBe('_blank');

    component.onClick();
    expect(pageService.formAction).toHaveBeenCalled();
  });
});
