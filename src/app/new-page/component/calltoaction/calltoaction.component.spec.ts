import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PageService } from '../../service/page-service.service';
import { CalltoactionNewComponent } from './calltoaction.component';
import { mockCallToAction } from '../../../_tests/mocks';

describe('CallToActionComponent', () => {
  let component: CalltoactionNewComponent;
  let fixture: ComponentFixture<CalltoactionNewComponent>;
  const mockCallToActionWithText = mockCallToAction(
    'The following explains how you can receive Christ ...'
  );
  const mockCallToActionWithoutText = mockCallToAction('');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CalltoactionNewComponent],
      providers: [PageService]
    }).compileComponents();
    fixture = TestBed.createComponent(CalltoactionNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create and load in CTA', () => {
    component.item = mockCallToActionWithText;
    component.ngOnChanges({
      item: new SimpleChange(null, mockCallToActionWithText, true)
    });
    expect(component).toBeTruthy();
    expect(component.actionText).toBe(
      'The following explains how you can receive Christ ...'
    );
  });

  it('should create but not load in CTA', () => {
    component.item = mockCallToActionWithoutText;
    component.ngOnChanges({
      item: new SimpleChange(null, mockCallToActionWithoutText, true)
    });
    expect(component).toBeTruthy();
    expect(component.actionText).toBeFalsy();
  });
});
