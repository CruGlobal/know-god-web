import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { APIURL } from 'src/app/api/url';
import { mockImage } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentImageComponent } from './content-image.component';

describe('ContentImageComponent', () => {
  let component: ContentImageComponent;
  let fixture: ComponentFixture<ContentImageComponent>;
  const fileName = 'name-of-file.png';
  const filePath = `/some-folder/${fileName}`;
  const imageEvent = 'page3';
  const imageOnlyEvents = mockImage(fileName, null, imageEvent);
  const imageOnlyUrl = mockImage(fileName, filePath, null);
  const imageWithEventsAndUrl = mockImage(fileName, filePath, imageEvent);
  const imageNotClickable = mockImage(fileName, null, null);
  let pageService: PageService;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentImageComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('resolves the image from the published content location', () => {
    component.item = imageWithEventsAndUrl;
    component.ngOnChanges({
      item: new SimpleChange(null, imageWithEventsAndUrl, true)
    });
    expect(component.imgResource).toBe(APIURL.GET_TRANSLATION_FILES + filePath);
  });

  it('renders no image when the resource has no published file', () => {
    component.item = imageNotClickable;
    component.ngOnChanges({
      item: new SimpleChange(null, imageNotClickable, true)
    });
    expect(component.imgResource).toBe('');
  });

  it('fires events only when clicked on with events', () => {
    component.item = imageOnlyEvents;
    component.ngOnChanges({
      item: new SimpleChange(null, imageOnlyEvents, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.inject(PageService);
    spyOn(pageService, 'formAction');

    component.onClick();

    expect(pageService.formAction).toHaveBeenCalledWith(imageEvent);
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('opens urls only when clicked on with url', () => {
    component.item = imageOnlyUrl;
    component.ngOnChanges({
      item: new SimpleChange(null, imageOnlyUrl, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe(filePath);
    expect(anchor.getAttribute('target')).toBe('_blank');

    component.onClick();
    expect(pageService.formAction).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('fires events and opens url when both are present', () => {
    component.item = imageWithEventsAndUrl;
    component.ngOnChanges({
      item: new SimpleChange(null, imageWithEventsAndUrl, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe(filePath);
    expect(anchor.getAttribute('target')).toBe('_blank');

    component.onClick();
    expect(pageService.formAction).toHaveBeenCalledWith(imageEvent);
  });

  describe('isClickable', () => {
    it('should be true when only events are provided', () => {
      component.item = imageOnlyEvents;
      component.ngOnChanges({
        item: new SimpleChange(null, imageOnlyEvents, true)
      });

      expect(component.isClickable).toBeTrue();
    });

    it('should be true when only url is provided', () => {
      component.item = imageOnlyUrl;
      component.ngOnChanges({
        item: new SimpleChange(null, imageOnlyUrl, true)
      });

      expect(component.isClickable).toBeTrue();
    });

    it('should be true when both events and url are provided', () => {
      component.item = imageWithEventsAndUrl;
      component.ngOnChanges({
        item: new SimpleChange(null, imageWithEventsAndUrl, true)
      });

      expect(component.isClickable).toBeTrue();
    });

    it('should be false when no events or urls are provided', () => {
      component.item = imageNotClickable;
      component.ngOnChanges({
        item: new SimpleChange(null, imageNotClickable, true)
      });

      expect(component.isClickable).toBeFalse();
    });
  });
});
