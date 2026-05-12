import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockButton } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentButtonComponent } from './content-button.component';

describe('ContentButtonComponent', () => {
  let component: ContentButtonComponent;
  let fixture: ComponentFixture<ContentButtonComponent>;
  const buttonText = 'Button Text';
  const buttonUrl = 'www.some-url-path.com';
  const buttonEvent = 'open-test-modal';
  const mockEventButton = mockButton(buttonText, '', buttonEvent);
  const mockUrlButton = mockButton(buttonText, buttonUrl, '');
  const mockButtonWithEventAndUrl = mockButton(
    buttonText,
    buttonUrl,
    buttonEvent
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentButtonComponent],
      providers: [PageService]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create and load in CTA', () => {
    component.item = mockEventButton;
    component.ngOnChanges({
      item: new SimpleChange(null, mockEventButton, true)
    });
    expect(component).toBeTruthy();
    expect(component.buttonText).toBe(buttonText);
  });

  it('URL Button, Added http set URL', () => {
    component.item = mockUrlButton;
    component.ngOnChanges({
      item: new SimpleChange(null, mockUrlButton, true)
    });
    expect(component).toBeTruthy();
    expect(component.buttonText).toBe(buttonText);
  });

  it('fires events only when clicked on with events', () => {
    component.item = mockEventButton;
    component.ngOnChanges({
      item: new SimpleChange(null, mockEventButton, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    component.onClick();
    expect(pageService.formAction).toHaveBeenCalledWith(buttonEvent);
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('opens urls only when clicked on with url', () => {
    component.item = mockUrlButton;
    component.ngOnChanges({
      item: new SimpleChange(null, mockUrlButton, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe(buttonUrl);
    expect(anchor.getAttribute('target')).toBe('_blank');

    component.onClick();
    expect(pageService.formAction).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('fires events and opens url when both are present', () => {
    component.item = mockButtonWithEventAndUrl;
    component.ngOnChanges({
      item: new SimpleChange(null, mockButtonWithEventAndUrl, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe(buttonUrl);
    expect(anchor.getAttribute('target')).toBe('_blank');

    component.onClick();
    expect(pageService.formAction).toHaveBeenCalledWith(buttonEvent);
  });
});
