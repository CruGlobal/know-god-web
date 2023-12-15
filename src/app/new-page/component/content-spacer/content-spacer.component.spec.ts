import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockSpacer } from '../../../_tests/mocks';
import { ContentSpacerNewComponent } from './content-spacer.component';

describe('ContentSpacerComponent', () => {
  let component: ContentSpacerNewComponent;
  let fixture: ComponentFixture<ContentSpacerNewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentSpacerNewComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentSpacerNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.item = mockSpacer(200);
    component.ngOnChanges({
      item: new SimpleChange(null, mockSpacer(200), true)
    });
    expect(component.height).toEqual(200);
    expect(component.mode).toBe('FIXED');
  });
});
