import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockLink } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentLinkComponent } from './content-link.component';

describe('ContentLinkComponent', () => {
  let component: ContentLinkComponent;
  let fixture: ComponentFixture<ContentLinkComponent>;
  let pageService: PageService;
  const link = mockLink('https://cru.org', 'link text');

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
    component.item = link;
    component.ngOnChanges({
      item: new SimpleChange(null, link, true)
    });

    expect(component.text).toEqual(link.text);
    expect(component.linkText).toBe('link text');
  });

  it('Form Action function sends the correct info to pageService', async () => {
    component.item = link;
    component.ngOnChanges({
      item: new SimpleChange(null, link, true)
    });

    component.onClick();
    expect(pageService.formAction).toHaveBeenCalledWith(
      'followup-testing-event followup:send'
    );
  });

  it('fires events and opens url when both are configured', () => {
    component.item = link;
    component.ngOnChanges({ item: new SimpleChange(null, link, true) });

    const pageService = TestBed.get(PageService);
    spyOn(window, 'open');

    component.onClick();

    expect(pageService.formAction).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('https://cru.org', '_blank');
  });
});
