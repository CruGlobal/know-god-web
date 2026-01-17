import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockText } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentTextComponent } from './content-text.component';
import {
  ParserState,
  Text
} from 'src/app/services/xml-parser-service/xml-parser.service';

describe('ContentTextComponent - Content Filtering', () => {
  let component: ContentTextComponent;
  let fixture: ComponentFixture<ContentTextComponent>;
  let pageService: PageService;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentTextComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should hide content when gone-if expression evaluates to true', async () => {
    const testText = mockText('Test content') as Text;
    // Override the watchIsGone method to simulate hiding
    testText.watchIsGone = (_state: ParserState, callback: (value: boolean) => void) => {
      callback(true); // Should hide
      return { close: () => {} };
    };

    component.item = testText;
    component.ngOnChanges({
      item: new SimpleChange(null, testText, true)
    });

    expect(component.isHidden).toBe(true);
    expect(component.ready).toBe(true);
  });

  it('should show content when gone-if expression evaluates to false', async () => {
    const testText = mockText('Test content') as Text;
    // Override the watchIsGone method to simulate showing
    testText.watchIsGone = (_state: ParserState, callback: (value: boolean) => void) => {
      callback(false); // Should show
      return { close: () => {} };
    };

    component.item = testText;
    component.ngOnChanges({
      item: new SimpleChange(null, testText, true)
    });

    expect(component.isHidden).toBe(false);
    expect(component.ready).toBe(true);
  });

  it('should properly close watcher on component destroy', async () => {
    const closeSpy = jasmine.createSpy('close');
    const testText = mockText('Test content') as Text;
    // Override watchIsGone to return a spy for the close method
    testText.watchIsGone = (_state: ParserState, callback: (value: boolean) => void) => {
      callback(false);
      return { close: closeSpy };
    };

    component.item = testText;
    component.ngOnChanges({
      item: new SimpleChange(null, testText, true)
    });

    component.ngOnDestroy();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should handle state changes and update visibility', async () => {
    let mockCallback: (value: boolean) => void;
    const testText = mockText('Test content') as Text;
    // Override watchIsGone to capture the callback for later use
    testText.watchIsGone = (_state: ParserState, callback: (value: boolean) => void) => {
      mockCallback = callback;
      callback(false); // Initially visible
      return { close: () => {} };
    };

    component.item = testText;
    component.ngOnChanges({
      item: new SimpleChange(null, testText, true)
    });

    expect(component.isHidden).toBe(false);

    // Simulate state change that should hide the content
    mockCallback(true);

    expect(component.isHidden).toBe(true);
  });

  it('should handle invisible-if expressions correctly', async () => {
    const testText = mockText('Test content') as Text;
    // Override watchIsInvisible to simulate invisible state
    testText.watchIsInvisible = (_state: ParserState, callback: (value: boolean) => void) => {
      callback(true); // Should be invisible
      return { close: () => {} };
    };

    component.item = testText;
    component.ngOnChanges({
      item: new SimpleChange(null, testText, true)
    });

    expect(component.isInvisible).toBe(true);
    expect(component.isHidden).toBe(false); // Still in DOM, just invisible
    expect(component.ready).toBe(true);
  });

  it('should properly close both watchers on component destroy', async () => {
    const closeSpy1 = jasmine.createSpy('closeGone');
    const closeSpy2 = jasmine.createSpy('closeInvisible');
    const testText = mockText('Test content') as Text;

    testText.watchIsGone = () => ({ close: closeSpy1 });
    testText.watchIsInvisible = () => ({ close: closeSpy2 });

    component.item = testText;
    component.ngOnChanges({
      item: new SimpleChange(null, testText, true)
    });

    component.ngOnDestroy();

    expect(closeSpy1).toHaveBeenCalled();
    expect(closeSpy2).toHaveBeenCalled();
  });
});
