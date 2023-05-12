import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockParagraph } from '../../../_tests/mocks';
import { ContentParagraphNewComponent } from './content-paragraph.component';

describe('ContentInputComponent', () => {
  let component: ContentParagraphNewComponent;
  let fixture: ComponentFixture<ContentParagraphNewComponent>;
  const paragraph = mockParagraph();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentParagraphNewComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentParagraphNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.item = paragraph;
    component.ngOnChanges({
      item: new SimpleChange(null, paragraph, true)
    });

    expect(component.items).toEqual(paragraph.content);
    expect(component.ready).toBeTrue();
  });
});
