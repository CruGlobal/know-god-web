import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PageService } from '../../service/page-service.service';
import { mockLink } from '../../../_tests/mocks';
import { ContentLinkNewComponent } from './content-link.component';

describe('ContentInputComponent', () => {
  let component: ContentLinkNewComponent;
  let fixture: ComponentFixture<ContentLinkNewComponent>;
  let pageService: PageService;
  const link = mockLink('https://cru.org', 'link text', true);

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentLinkNewComponent],
      providers: [{ provide: PageService, useValue: pageService }],
    }).compileComponents();
    fixture = TestBed.createComponent(ContentLinkNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(pageService, 'formAction');
  }));

  it('Values are assigned correctly', async () => {
    component.item = link;
    component.ngOnChanges({
      item: new SimpleChange(null, link, true),
    });

    expect(component.text).toEqual(link.text);
    expect(component.linkText).toBe('link text');
    expect(component.events).toEqual(link.events);
  });

  it('Form Action function sends the correct info to pageService', async () => {
    component.item = link;
    component.ngOnChanges({
      item: new SimpleChange(null, link, true),
    });

    component.formAction();
    expect(pageService.formAction).toHaveBeenCalledWith(
      'followup-testing-event followup:send',
    );
  });
});
