import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockFlow } from '../../../_tests/mocks';
import { ContentFlowNewComponent } from './content-flow.component';

describe('ContentFlowComponent', () => {
  let component: ContentFlowNewComponent;
  let fixture: ComponentFixture<ContentFlowNewComponent>;
  const flow = mockFlow();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentFlowNewComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentFlowNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.item = flow;
    component.ngOnChanges({
      item: new SimpleChange(null, flow, true)
    });
    expect(component.items).toEqual(flow.items);
    expect(component.ready).toBeTrue();
  });
});
