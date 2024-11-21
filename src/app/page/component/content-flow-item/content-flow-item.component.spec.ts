import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockFlowItem } from '../../../_tests/mocks';
import { ContentFlowItemComponent } from './content-flow-item.component';

describe('ContentFlowItemsComponent', () => {
  let component: ContentFlowItemComponent;
  let fixture: ComponentFixture<ContentFlowItemComponent>;
  const flowItem = mockFlowItem(true);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentFlowItemComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentFlowItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.item = flowItem;
    component.ngOnChanges({
      item: new SimpleChange(null, flowItem, true)
    });

    expect(component.contents).toEqual(flowItem.content);
    expect(component.ready).toBeTrue();
  });
});
