import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ParserState } from 'src/app/services/xml-parser-service/xml-parser.service';
import { mockMultiselectOption } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentMultiselectOptionComponent } from './content-multiselect-option.component';

describe('ContentMultiselectOptionComponent - State Management', () => {
  let component: ContentMultiselectOptionComponent;
  let fixture: ComponentFixture<ContentMultiselectOptionComponent>;
  let pageService: PageService;
  let mockState: Partial<ParserState>;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    mockState = {
      testKey: 'testValue',
      familylessonqz: null
    } as Partial<ParserState>;

    spyOn(pageService, 'parserState').and.returnValue(mockState);

    TestBed.configureTestingModule({
      declarations: [ContentMultiselectOptionComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentMultiselectOptionComponent);
    component = fixture.componentInstance;
  }));

  interface TestSetup {
    mockOption: any; // Should be MultiselectOption
    toggleSelectedSpy: jasmine.Spy;
  }

  const setupComponentWithMockOption = (initialSelectedValue: boolean): TestSetup => {
    const mockOption = mockMultiselectOption(initialSelectedValue);
    const toggleSelectedSpy = spyOn(mockOption, 'toggleSelected');

    component.item = mockOption;
    component.ngOnChanges({
      item: new SimpleChange(null, mockOption, true)
    });

    return { mockOption, toggleSelectedSpy };
  };

  it('should call toggleSelected with the correct, current parser state', () => {
    const { toggleSelectedSpy } = setupComponentWithMockOption(false);

    // Check with initial state
    component.onClick();
    expect(toggleSelectedSpy).toHaveBeenCalledWith(mockState);

    // Update mock state and check again
    mockState.familylessonqz = 'quiz_talkingtofamily_differences';
    component.onClick();
    expect(toggleSelectedSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        familylessonqz: 'quiz_talkingtofamily_differences'
      })
    );
  });

  it('should maintain state reference across multiple selections', () => {
    const mockOption1 = mockMultiselectOption(false);
    const mockOption2 = mockMultiselectOption(false);

    const toggleSpy1 = spyOn(mockOption1, 'toggleSelected');
    const toggleSpy2 = spyOn(mockOption2, 'toggleSelected');

    // First option selection
    component.item = mockOption1;
    component.ngOnChanges({
      item: new SimpleChange(null, mockOption1, true)
    });
    component.onClick();

    // Second option selection
    component.item = mockOption2;
    component.ngOnChanges({
      item: new SimpleChange(mockOption1, mockOption2, false)
    });
    component.onClick();

    // Both should use the same state object
    expect(toggleSpy1).toHaveBeenCalledWith(mockState);
    expect(toggleSpy2).toHaveBeenCalledWith(mockState);
  });

  it('should handle multiple clicks on same option', () => {
    const { toggleSelectedSpy } = setupComponentWithMockOption(false);

    // Click multiple times
    component.onClick();
    component.onClick();
    component.onClick();

    expect(toggleSelectedSpy).toHaveBeenCalledTimes(3);
  });

  it('should initialize with parser state from service', () => {
    setupComponentWithMockOption(false);

    expect(pageService.parserState).toHaveBeenCalled();
    expect(component.state).toBe(mockState);
  });
});
