import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  Flow,
  FlowItem
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { mockFlow, mockVisibilityWatchers } from '../../../_tests/mocks';
import { ContentFlowComponent } from './content-flow.component';

const wireFlowItems = (flow: Flow) =>
  flow.items.map((item: FlowItem) => mockVisibilityWatchers(item));

describe('ContentFlowComponent', () => {
  let component: ContentFlowComponent;
  let fixture: ComponentFixture<ContentFlowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentFlowComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  const initWith = (flow: Flow) => {
    component.item = flow;
    component.ngOnChanges({ item: new SimpleChange(null, flow, true) });
  };

  it('Values are assigned correctly', () => {
    const flow = mockFlow();
    initWith(flow);

    expect(component.items.map((content) => content.item)).toEqual(flow.items);
    expect(component.ready).toBeTrue();
  });

  it('creates a visibility watcher for every flow item', () => {
    const flow = mockFlow();
    initWith(flow);

    expect(component.items.length).toBe(flow.items.length);
    component.items.forEach((content) =>
      expect(content.visibility).toBeDefined()
    );
  });

  it('reflects each item gone/invisible state from its watcher', () => {
    const flow = mockFlow();
    const wired = wireFlowItems(flow);
    initWith(flow);

    wired[0].triggerGone(true);
    expect(component.items[0].visibility?.isHidden).toBeTrue();

    wired[1].triggerInvisible(true);
    expect(component.items[1].visibility?.isInvisible).toBeTrue();
  });

  it('closes every item watcher on destroy', () => {
    const flow = mockFlow();
    const wired = wireFlowItems(flow);
    initWith(flow);

    component.ngOnDestroy();

    wired.forEach((w) => {
      expect(w.goneClose).toHaveBeenCalledTimes(1);
      expect(w.invisibleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('closes the previous flow watchers before re-initializing', () => {
    const firstFlow = mockFlow();
    const wiredFirst = wireFlowItems(firstFlow);
    initWith(firstFlow);

    const secondFlow = mockFlow();
    component.ngOnChanges({
      item: new SimpleChange(firstFlow, secondFlow, false)
    });

    wiredFirst.forEach((w) => {
      expect(w.goneClose).toHaveBeenCalledTimes(1);
      expect(w.invisibleClose).toHaveBeenCalledTimes(1);
    });
  });
});
