import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockParagraph } from '../../../_tests/mocks';
import { ContentParagraphComponent } from './content-paragraph.component';

describe('ContentInputComponent', () => {
  let component: ContentParagraphComponent;
  let fixture: ComponentFixture<ContentParagraphComponent>;
  const paragraph = mockParagraph();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentParagraphComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentParagraphComponent);
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
