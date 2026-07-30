import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { APIURL } from 'src/app/api/url';
import { mockAnimation } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentAnimationComponent } from './content-animation.component';

describe('ContentAnimationComponent', () => {
  let component: ContentAnimationComponent;
  let fixture: ComponentFixture<ContentAnimationComponent>;
  const fileName = 'the_four_animation.json';
  const filePath = `/some-folder/${fileName}`;
  const animation = mockAnimation(fileName, filePath, 'event');
  const animationWithUrl = mockAnimation(fileName, filePath, null);
  const animationWithEvents = mockAnimation(fileName, null, 'event');
  const animationNoPublishedFile = mockAnimation(fileName, null, 'event');
  let pageService: PageService;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentAnimationComponent],
      providers: [{ provide: PageService, useValue: pageService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('resolves the animation from the published content location', () => {
    component.item = animation;
    component.ngOnChanges({
      item: new SimpleChange(null, animation, true)
    });
    expect(component.anmResource).toEqual(
      APIURL.GET_TRANSLATION_FILES + filePath
    );
    expect(component.lottieOptions).toEqual({
      path: APIURL.GET_TRANSLATION_FILES + filePath,
      loop: true,
      autoplay: true
    });
  });

  it('does not build lottie options when the resource has no published file', () => {
    component.item = animationNoPublishedFile;
    component.ngOnChanges({
      item: new SimpleChange(null, animationNoPublishedFile, true)
    });
    expect(component.anmResource).toBeNull();
    expect(component.lottieOptions).toBeUndefined();
  });

  it('fires events only when clicked on with events', () => {
    component.item = animationWithEvents;
    component.ngOnChanges({
      item: new SimpleChange(null, animationWithEvents, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    component.onClick();

    expect(pageService.formAction).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('opens urls only when clicked on with url', () => {
    component.item = animationWithUrl;
    component.ngOnChanges({
      item: new SimpleChange(null, animationWithUrl, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe(animationWithUrl.url);
    expect(anchor.getAttribute('target')).toBe('_blank');

    component.onClick();

    expect(pageService.formAction).not.toHaveBeenCalled();
  });

  it('fires events and opens url when both are present', () => {
    component.item = animation;
    component.ngOnChanges({
      item: new SimpleChange(null, animation, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe(animation.url);
    expect(anchor.getAttribute('target')).toBe('_blank');

    component.onClick();
    expect(pageService.formAction).toHaveBeenCalledWith('event');
  });
});
