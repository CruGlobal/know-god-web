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
    // After our changes: content = [text, paragraph, text, image] = 4 items
    // The paragraph is now preserved as a paragraph component instead of being broken down
    expect(component.content.length).toEqual(4);
    expect(component.content[0].type).toBe('text');
    expect(component.content[1].type).toBe('paragraph'); // Now preserved as paragraph
    expect(component.content[2].type).toBe('text');
    expect(component.content[3].type).toBe('image');
    expect(component.ready).toBeTrue();
  });
});
