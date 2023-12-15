import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockMultiselectOption } from '../../../_tests/mocks';
import { ContentMultiselectOptionComponent } from './content-multiselect-option.component';

describe('ContentMultiselectOptionComponent', () => {
  let component: ContentMultiselectOptionComponent;
  let fixture: ComponentFixture<ContentMultiselectOptionComponent>;
  const multiselectOption = mockMultiselectOption(false);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentMultiselectOptionComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentMultiselectOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.item = multiselectOption;
    component.ngOnChanges({
      item: new SimpleChange(null, multiselectOption, true)
    });

    expect(component.contents).toEqual(multiselectOption.content);
    expect(component.ready).toBeTrue();
  });

  it('should toggle the selected class when the user clicks on the option', async () => {
    component.item = multiselectOption;
    component.option = multiselectOption;
    component.onClick();
    expect(component.option.isSelected(null)).toEqual(true);
    component.onClick();
    expect(component.option.isSelected(null)).toEqual(false);
  });
});
