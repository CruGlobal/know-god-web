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
  const linkWithEvents = mockLink(null, 'link text');

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

    const pageService = TestBed.get(PageService);
    spyOn(window, 'open');

    component.onClick();

    expect(pageService.formAction).toHaveBeenCalledWith(
      'followup-testing-event followup:send'
    );
    expect(window.open).not.toHaveBeenCalled();
  });

  it('opens urls only when clicked on with url', () => {
    component.item = linkWithUrl;
    component.ngOnChanges({
      item: new SimpleChange(null, linkWithUrl, true)
    });

    const pageService = TestBed.get(PageService);
    spyOn(window, 'open');

    component.onClick();

    expect(pageService.formAction).not.toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('https://cru.org', '_blank');
  });
});
