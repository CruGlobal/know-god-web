import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockSpacer } from '../../../_tests/mocks';
import { ContentSpacerComponent } from './content-spacer.component';

describe('ContentSpacerComponent', () => {
  let component: ContentSpacerComponent;
  let fixture: ComponentFixture<ContentSpacerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentSpacerComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentSpacerComponent);
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
