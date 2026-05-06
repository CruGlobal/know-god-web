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
  const button = mockButton('text', 'https://example.com', 'btnEvent');
  const mockEventButton = mockButton(buttonText, '', buttonEvent);
  const mockUrlButton = mockButton(buttonText, buttonUrl, '');

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

  it('Test events', () => {
    component.item = mockEventButton;
    component.ngOnChanges({
      item: new SimpleChange(null, mockEventButton, true)
    });

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    component.onClick();

    expect(pageService.formAction).toHaveBeenCalledWith(buttonEvent);
  });

  it('fires events and opens url when both are configured', () => {
    component.item = button;
    component.ngOnChanges({ item: new SimpleChange(null, button, true) });

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');
    spyOn(window, 'open');

    component.onClick();

    expect(pageService.formAction).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
  });
});
