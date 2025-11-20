import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { ContentParagraphComponent } from './content-paragraph.component';
import { PageService } from '../../service/page-service.service';
import { mockParagraph } from '../../../_tests/mocks';
import { Paragraph } from 'src/app/services/xml-parser-service/xml-parser.service';

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
    const mockPara = mockParagraph() as Paragraph;
    const watchIsGoneSpy = spyOn(mockPara, 'watchIsGone').and.returnValue({
      close: () => {}
    });

    component.item = mockPara;
    component.ngOnChanges({
      item: new SimpleChange(null, mockPara, true)
    });

    expect(watchIsGoneSpy).toHaveBeenCalled();
    expect(component.isHiddenWatcher).toBeDefined();
  });

  it('should close previous watcher when reinitializing', () => {
    const closeSpy1 = jasmine.createSpy('close1');
    const closeSpy2 = jasmine.createSpy('close2');
    
    const mockPara1 = mockParagraph() as Paragraph;
    const mockPara2 = mockParagraph() as Paragraph;
    
    mockPara1.watchIsGone = () => ({ close: closeSpy1 });
    mockPara2.watchIsGone = () => ({ close: closeSpy2 });

    // First initialization
    component.item = mockPara1;
    component.ngOnChanges({
      item: new SimpleChange(null, mockPara1, true)
    });

    // Second initialization should close first watcher
    component.item = mockPara2;
    component.ngOnChanges({
      item: new SimpleChange(mockPara1, mockPara2, false)
    });

    expect(closeSpy1).toHaveBeenCalled();
    expect(component.isHiddenWatcher.close).toBe(closeSpy2);
  });

  it('should close watcher on component destroy', () => {
    const closeSpy = jasmine.createSpy('close');
    const mockPara = mockParagraph() as Paragraph;
    
    mockPara.watchIsGone = () => ({ close: closeSpy });

    component.item = mockPara;
    component.ngOnChanges({
      item: new SimpleChange(null, mockPara, true)
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
    const mockPara = mockParagraph() as Paragraph;
    
    mockPara.watchIsGone = (state: any, callback: (value: boolean) => void) => {
      visibilityCallback = callback;
      callback(false); // Initially visible
      return { close: () => {} };
    };

    component.item = mockPara;
    component.ngOnChanges({
      item: new SimpleChange(null, mockPara, true)
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
    
    const mockPara = mockParagraph() as Paragraph;
    const watchIsGoneSpy = spyOn(mockPara, 'watchIsGone').and.returnValue({
      close: () => {}
    });

    component.item = mockPara;
    component.ngOnChanges({
      item: new SimpleChange(null, mockPara, true)
    });

    expect(watchIsGoneSpy).toHaveBeenCalledWith(
      jasmine.any(Object),
      jasmine.any(Function)
    );
  });
});
