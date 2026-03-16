import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ParserState } from 'src/app/services/xml-parser-service/xml-parser.service';
import { mockParagraph } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentParagraphComponent } from './content-paragraph.component';

type ParserStateWithFields = ParserState & {
  testKey: string;
} & Record<string, unknown>;

describe('ContentParagraphComponent - Visibility Watcher Lifecycle', () => {
  let component: ContentParagraphComponent;
  let fixture: ComponentFixture<ContentParagraphComponent>;
  let pageService: PageService;

  const initializeComponent = (item, previousItem = null) => {
    component.item = item;
    component.ngOnChanges({
      item: new SimpleChange(previousItem, item, previousItem === null)
    });
  };

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
    const paragraphItem = mockParagraph();
    const watchIsGoneSpy = spyOn(paragraphItem, 'watchIsGone').and.returnValue({
      close: () => {}
    });

    initializeComponent(paragraphItem);

    expect(watchIsGoneSpy).toHaveBeenCalled();
    expect(component.isHiddenWatcher).toBeDefined();
  });

  it('should close previous watcher when reinitializing', () => {
    const closeSpy1 = jasmine.createSpy('close1');
    const closeSpy2 = jasmine.createSpy('close2');

    const mockParagraph1 = mockParagraph();
    const mockParagraph2 = mockParagraph();

    mockParagraph1.watchIsGone = () => ({ close: closeSpy1 });
    mockParagraph2.watchIsGone = () => ({ close: closeSpy2 });

    initializeComponent(mockParagraph1);
    initializeComponent(mockParagraph2, mockParagraph1);

    expect(closeSpy1).toHaveBeenCalled();
    expect(component.isHiddenWatcher.close).toBe(closeSpy2);
  });

  it('should close watcher on component destroy', () => {
    const closeSpy = jasmine.createSpy('close');
    const paragraphItem = mockParagraph();
    paragraphItem.watchIsGone = () => ({ close: closeSpy });

    initializeComponent(paragraphItem);
    component.ngOnDestroy();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should handle destroy when no watcher exists', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should update visibility when watcher callback is triggered', () => {
    let visibilityCallback: (value: boolean) => void;
    const paragraphItem = mockParagraph();
    paragraphItem.watchIsGone = (
      _state: ParserState,
      callback: (value: boolean) => void
    ) => {
      visibilityCallback = callback;
      callback(false); // Initially visible
      return { close: () => {} };
    };

    initializeComponent(paragraphItem);

    expect(component.isHidden).toBe(false);

    // Simulate visibility change
    visibilityCallback(true);
    expect(component.isHidden).toBe(true);

    visibilityCallback(false);
    expect(component.isHidden).toBe(false);
  });

  it('should pass parser state to watcher', () => {
    const mockState = pageService.parserState() as ParserStateWithFields;
    mockState.testKey = 'testValue';
    mockState['contentEvents'] ??= [];
    spyOn(pageService, 'parserState').and.returnValue(mockState);

    const paragraphItem = mockParagraph();
    const watchIsGoneSpy = spyOn(paragraphItem, 'watchIsGone').and.returnValue({
      close: () => {}
    });

    initializeComponent(paragraphItem);

    expect(watchIsGoneSpy).toHaveBeenCalledWith(
      jasmine.any(Object),
      jasmine.any(Function)
    );
  });
});
