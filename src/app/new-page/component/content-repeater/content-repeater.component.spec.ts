import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { paragraph, text, content } from '../../../_tests/mocks';
import { ContentRepeaterNewComponent } from './content-repeater.component';
import { ContentParser } from 'src/app/services/xml-parser-service/xmp-parser.service';

describe('ContentInputComponent', () => {
  let component: ContentRepeaterNewComponent;
  let fixture: ComponentFixture<ContentRepeaterNewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentRepeaterNewComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ContentRepeaterNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.items = content;
    component.ngOnChanges({
      items: new SimpleChange(null, content, true),
    });
    expect(component.content.length).toEqual(3);
    expect(component.content[0].type).toBe('text');
    expect(component.content[1].type).toBe('text');
    expect(component.content[2].type).toBe('image');
    expect(component.ready).toBeTrue();
  });
});
