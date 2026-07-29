import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Button } from 'src/app/services/xml-parser-service/xml-parser.service';
import { createResource, mockButton, mockText } from '../../../_tests/mocks';
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

    const pageService = TestBed.inject(PageService);
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

  it('does not render start/end images from the child text node', () => {
    // Per the content schema, start-image/end-image only exist on standalone
    // text elements; buttons render images via icon/icon-gravity only.
    const pageService = TestBed.inject(PageService);
    pageService.addToImagesDict('image.png', 'https://cru.org/img.png');

    const buttonWithTextImages = {
      ...mockButton(buttonText, '', buttonEvent),
      text: mockText(buttonText)
    } as Button;
    component.item = buttonWithTextImages;
    component.ngOnChanges({
      item: new SimpleChange(null, buttonWithTextImages, true)
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('button img').length).toBe(0);
  });

  it('renders the icon inside the anchor variant', () => {
    const pageService = TestBed.inject(PageService);
    pageService.addToImagesDict('icon.png', 'https://cru.org/icon.png');

    const urlButtonWithIcon = {
      ...mockButton(buttonText, buttonUrl, ''),
      icon: createResource('icon.png', 'icon.png'),
      iconGravity: { name: 'START', ordinal: 0 },
      iconSize: 18
    } as Button;
    component.item = urlButtonWithIcon;
    component.ngOnChanges({
      item: new SimpleChange(null, urlButtonWithIcon, true)
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('a img').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('button img').length).toBe(0);
  });

  it('renders the button icon before the text when icon-gravity is start', () => {
    const pageService = TestBed.inject(PageService);
    pageService.addToImagesDict('icon.png', 'https://cru.org/icon.png');

    const iconButton = {
      ...mockButton(buttonText, '', buttonEvent),
      icon: createResource('icon.png', 'icon.png'),
      iconGravity: { name: 'START', ordinal: 0 },
      iconSize: 18
    } as Button;
    component.item = iconButton;
    component.ngOnChanges({
      item: new SimpleChange(null, iconButton, true)
    });
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    const icon: HTMLImageElement = button.querySelector('img');
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('src')).toBe('https://cru.org/icon.png');
    expect(icon.style.width).toBe('18px');
    expect(icon.classList).toContain('buttonImgStart');
    expect(icon.getAttribute('alt')).toBe('');
    expect(button.textContent.trim()).toBe('Button Text');
  });

  it('renders the button icon after the text when icon-gravity is end', () => {
    const pageService = TestBed.inject(PageService);
    pageService.addToImagesDict('icon.png', 'https://cru.org/icon.png');

    const iconButton = {
      ...mockButton(buttonText, '', buttonEvent),
      icon: createResource('icon.png', 'icon.png'),
      iconGravity: { name: 'END', ordinal: 2 },
      iconSize: 18
    } as Button;
    component.item = iconButton;
    component.ngOnChanges({
      item: new SimpleChange(null, iconButton, true)
    });
    fixture.detectChanges();

    const icon: HTMLImageElement =
      fixture.nativeElement.querySelector('button img');
    expect(icon).toBeTruthy();
    expect(icon.classList).toContain('buttonImgEnd');
  });

  it('does not render the icon when gravity is CENTER', () => {
    const pageService = TestBed.inject(PageService);
    pageService.addToImagesDict('icon.png', 'https://cru.org/icon.png');

    const iconButton = {
      ...mockButton(buttonText, '', buttonEvent),
      icon: createResource('icon.png', 'icon.png'),
      iconGravity: { name: 'CENTER', ordinal: 1 },
      iconSize: 18
    } as Button;
    component.item = iconButton;
    component.ngOnChanges({
      item: new SimpleChange(null, iconButton, true)
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('button img').length).toBe(0);
  });

  it('does not render images when the button has none', () => {
    component.item = mockEventButton;
    component.ngOnChanges({
      item: new SimpleChange(null, mockEventButton, true)
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('button img').length).toBe(0);
  });

  it('falls back to attachments when the icon is not in the images dict', () => {
    const pageService = TestBed.inject(PageService);
    pageService.addAttachment('icon.png', 'https://cru.org/attachment.png');

    const iconButton = {
      ...mockButton(buttonText, '', buttonEvent),
      icon: createResource('icon.png', 'icon.png'),
      iconGravity: { name: 'START', ordinal: 0 },
      iconSize: 18
    } as Button;
    component.item = iconButton;
    component.ngOnChanges({
      item: new SimpleChange(null, iconButton, true)
    });
    fixture.detectChanges();

    const icon: HTMLImageElement =
      fixture.nativeElement.querySelector('button img');
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('src')).toBe('https://cru.org/attachment.png');
  });

  it('gives the icon a non-empty alt when the button has no text label', () => {
    const pageService = TestBed.inject(PageService);
    pageService.addToImagesDict('icon.png', 'https://cru.org/icon.png');

    const iconOnlyButton = {
      ...mockButton('', '', buttonEvent),
      text: mockText(''),
      icon: createResource('icon.png', 'icon.png'),
      iconGravity: { name: 'START', ordinal: 0 },
      iconSize: 18
    } as Button;
    component.item = iconOnlyButton;
    component.ngOnChanges({
      item: new SimpleChange(null, iconOnlyButton, true)
    });
    fixture.detectChanges();

    const icon: HTMLImageElement =
      fixture.nativeElement.querySelector('button img');
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('alt')).toBe('icon');
  });

  it("uses 'button' as the ultimate alt fallback", () => {
    const emptyButton = {
      ...mockButton('', '', buttonEvent),
      text: mockText(''),
      icon: createResource('', '')
    } as Button;
    component.item = emptyButton;
    component.ngOnChanges({
      item: new SimpleChange(null, emptyButton, true)
    });
    fixture.detectChanges();

    expect(component.imgAlt).toBe('button');
  });
});
