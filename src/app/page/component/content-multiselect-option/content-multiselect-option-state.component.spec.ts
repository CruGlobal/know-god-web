import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { ContentMultiselectOptionComponent } from './content-multiselect-option.component';
import { PageService } from '../../service/page-service.service';
import { mockMultiselectOption } from '../../../_tests/mocks';

describe('ContentMultiselectOptionComponent - State Management', () => {
  let component: ContentMultiselectOptionComponent;
  let fixture: ComponentFixture<ContentMultiselectOptionComponent>;
  let pageService: PageService;
  let mockState: any;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    mockState = {
      testKey: 'testValue',
      familylessonqz: null
    };
    
    spyOn(pageService, 'parserState').and.returnValue(mockState);

    TestBed.configureTestingModule({
      declarations: [ContentMultiselectOptionComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ContentMultiselectOptionComponent);
    component = fixture.componentInstance;
  }));

  it('should update state when option is selected', () => {
    const mockOption = mockMultiselectOption(false);
    const toggleSelectedSpy = spyOn(mockOption, 'toggleSelected');

    component.item = mockOption;
    component.ngOnChanges({
      item: new SimpleChange(null, mockOption, true)
    });

    component.onClick();

    expect(toggleSelectedSpy).toHaveBeenCalledWith(mockState);
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

  it('should call toggleSelected with current parser state', () => {
    const mockOption = mockMultiselectOption(false);
    const toggleSelectedSpy = spyOn(mockOption, 'toggleSelected');

    // Update mock state
    mockState.familylessonqz = 'quiz_talkingtofamily_differences';

    component.item = mockOption;
    component.ngOnChanges({
      item: new SimpleChange(null, mockOption, true)
    });

    component.onClick();

    expect(toggleSelectedSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      familylessonqz: 'quiz_talkingtofamily_differences'
    }));
  });

  it('should handle multiple clicks on same option', () => {
    const mockOption = mockMultiselectOption(false);
    const toggleSelectedSpy = spyOn(mockOption, 'toggleSelected');

    component.item = mockOption;
    component.ngOnChanges({
      item: new SimpleChange(null, mockOption, true)
    });

    // Click multiple times
    component.onClick();
    component.onClick();
    component.onClick();

    expect(toggleSelectedSpy).toHaveBeenCalledTimes(3);
    expect(toggleSelectedSpy).toHaveBeenCalledWith(mockState);
  });

  it('should initialize with parser state from service', () => {
    const mockOption = mockMultiselectOption(false);

    component.item = mockOption;
    component.ngOnChanges({
      item: new SimpleChange(null, mockOption, true)
    });

    expect(pageService.parserState).toHaveBeenCalled();
    expect(component.state).toBe(mockState);
  });
});
