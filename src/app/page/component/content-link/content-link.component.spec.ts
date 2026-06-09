import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockLink } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentLinkComponent } from './content-link.component';

describe('ContentLinkComponent', () => {
  let component: ContentLinkComponent;
  let fixture: ComponentFixture<ContentLinkComponent>;
  let pageService: PageService;
  const linkWithUrl = mockLink('https://cru.org', 'link text');
  const linkWithEvents = mockLink(null, 'link text', true);
  const linkWithUrlAndEvents = mockLink('https://cru.org', 'link text', true);

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentLinkComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(pageService, 'formAction');
  }));

  it('Values are assigned correctly', async () => {
    component.item = linkWithUrl;
    component.ngOnChanges({
      item: new SimpleChange(null, linkWithUrl, true)
    });

    expect(component.text).toEqual(linkWithUrl.text);
    expect(component.linkText).toBe('link text');
  });

  it('fires events only when clicked on with events', () => {
    component.item = linkWithEvents;
    component.ngOnChanges({
      item: new SimpleChange(null, linkWithEvents, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    component.onClick();

    expect(pageService.formAction).toHaveBeenCalledWith(
      'followup-testing-event followup:send'
    );
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('opens urls only when clicked on with url', () => {
    component.item = linkWithUrl;
    component.ngOnChanges({
      item: new SimpleChange(null, linkWithUrl, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe(linkWithUrl.url);
    expect(anchor.getAttribute('target')).toBe('_blank');

    component.onClick();
    expect(pageService.formAction).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('fires events and opens url when both are present', () => {
    component.item = linkWithUrlAndEvents;
    component.ngOnChanges({
      item: new SimpleChange(null, linkWithUrlAndEvents, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe(linkWithUrlAndEvents.url);
    expect(anchor.getAttribute('target')).toBe('_blank');

    component.onClick();
    expect(pageService.formAction).toHaveBeenCalledWith(
      'followup-testing-event followup:send'
    );
  });
});
