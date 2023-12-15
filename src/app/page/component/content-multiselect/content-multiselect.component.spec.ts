import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockMultiselect } from '../../../_tests/mocks';
import { ContentMultiselectComponent } from './content-multiselect.component';

describe('ContentMultiselectComponent', () => {
  let component: ContentMultiselectComponent;
  let fixture: ComponentFixture<ContentMultiselectComponent>;
  const multiselect = mockMultiselect();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentMultiselectComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentMultiselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.item = multiselect;
    component.ngOnChanges({
      item: new SimpleChange(null, multiselect, true)
    });

    expect(component.options).toEqual(multiselect.options);
    expect(component.columns).toEqual(multiselect.columns);
    expect(component.ready).toBeTrue();
  });
});
