import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  Paragraph,
  ParserState
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { mockParagraph } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentParagraphComponent } from './content-paragraph.component';

describe('ContentParagraphComponent - Visibility Watcher Lifecycle', () => {
  let component: ContentParagraphComponent;
  let fixture: ComponentFixture<ContentParagraphComponent>;
  let pageService: PageService;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentParagraphComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentParagraphComponent);
    component = fixture.componentInstance;
  }));

  it('should create visibility watcher on initialization', () => {
    const mockParagraph = mockParagraph() as Paragraph;
    const watchIsGoneSpy = spyOn(mockParagraph, 'watchIsGone').and.returnValue({
      close: () => {}
    });

    component.item = mockParagraph;
    component.ngOnChanges({
      item: new SimpleChange(null, mockParagraph, true)
    });

    expect(watchIsGoneSpy).toHaveBeenCalled();
    expect(component.isHiddenWatcher).toBeDefined();
  });

  it('should close previous watcher when reinitializing', () => {
    const closeSpy1 = jasmine.createSpy('close1');
    const closeSpy2 = jasmine.createSpy('close2');

    const mockParagraph1 = mockParagraph() as Paragraph;
    const mockParagraph2 = mockParagraph() as Paragraph;

    mockParagraph1.watchIsGone = () => ({ close: closeSpy1 });
    mockParagraph2.watchIsGone = () => ({ close: closeSpy2 });

    // First initialization
    component.item = mockParagraph1;
    component.ngOnChanges({
      item: new SimpleChange(null, mockParagraph1, true)
    });

    // Second initialization should close first watcher
    component.item = mockParagraph2;
    component.ngOnChanges({
      item: new SimpleChange(mockParagraph1, mockParagraph2, false)
    });

    expect(closeSpy1).toHaveBeenCalled();
    expect(component.isHiddenWatcher.close).toBe(closeSpy2);
  });

  it('should close watcher on component destroy', () => {
    const closeSpy = jasmine.createSpy('close');
    const mockParagraph = mockParagraph() as Paragraph;

    mockParagraph.watchIsGone = () => ({ close: closeSpy });

    component.item = mockParagraph;
    component.ngOnChanges({
      item: new SimpleChange(null, mockParagraph, true)
    });

    component.ngOnDestroy();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should handle destroy when no watcher exists', () => {
    // Should not throw error when destroying without watcher
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should update visibility when watcher callback is triggered', () => {
    let visibilityCallback: (value: boolean) => void;
    const mockParagraph = mockParagraph() as Paragraph;

    mockParagraph.watchIsGone = (
      _state: ParserState,
      callback: (value: boolean) => void
    ) => {
      visibilityCallback = callback;
      callback(false); // Initially visible
      return { close: () => {} };
    };

    component.item = mockParagraph;
    component.ngOnChanges({
      item: new SimpleChange(null, mockParagraph, true)
    });

    expect(component.isHidden).toBe(false);

    // Simulate visibility change
    visibilityCallback(true);
    expect(component.isHidden).toBe(true);

    visibilityCallback(false);
    expect(component.isHidden).toBe(false);
  });

  it('should pass parser state to watcher', () => {
    const mockState = { testKey: 'testValue' };
    spyOn(pageService, 'parserState').and.returnValue(mockState);

    const mockParagraph = mockParagraph() as Paragraph;
    const watchIsGoneSpy = spyOn(mockParagraph, 'watchIsGone').and.returnValue({
      close: () => {}
    });

    component.item = mockParagraph;
    component.ngOnChanges({
      item: new SimpleChange(null, mockParagraph, true)
    });

    expect(watchIsGoneSpy).toHaveBeenCalledWith(
      jasmine.any(Object),
      jasmine.any(Function)
    );
  });
});
