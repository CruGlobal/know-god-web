import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { content } from '../../../_tests/mocks';
import { ContentRepeaterComponent } from './content-repeater.component';

describe('ContentInputComponent', () => {
  let component: ContentRepeaterComponent;
  let fixture: ComponentFixture<ContentRepeaterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentRepeaterComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentRepeaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.items = content;
    component.ngOnChanges({
      items: new SimpleChange(null, content, true)
    });
    expect(component.content.length).toEqual(3);
    expect(component.content[0].type).toBe('text');
    expect(component.content[1].type).toBe('text');
    expect(component.content[2].type).toBe('image');
    expect(component.ready).toBeTrue();
  });
});
