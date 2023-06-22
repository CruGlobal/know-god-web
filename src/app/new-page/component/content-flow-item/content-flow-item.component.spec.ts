import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockFlowItem } from '../../../_tests/mocks';
import { ContentFlowItemNewComponent } from './content-flow-item.component';

describe('ContentFlowItemsComponent', () => {
  let component: ContentFlowItemNewComponent;
  let fixture: ComponentFixture<ContentFlowItemNewComponent>;
  const flowItem = mockFlowItem(true);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentFlowItemNewComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentFlowItemNewComponent);
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
