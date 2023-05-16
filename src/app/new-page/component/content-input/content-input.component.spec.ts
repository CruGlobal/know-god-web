import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PageService } from '../../service/page-service.service';
import { mockInput } from '../../../_tests/mocks';
import { ContentInputNewComponent } from './content-input.component';

describe('ContentInputComponent', () => {
  let component: ContentInputNewComponent;
  let fixture: ComponentFixture<ContentInputNewComponent>;
  let pageService: PageService;
  const input = mockInput('name', 'value', 'label', 'placeholder');

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentInputNewComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentInputNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Ensure input values are correctly set', async () => {
    component.item = input;
    component.ngOnChanges({
      item: new SimpleChange(null, input, true)
    });
    expect(component.label).not.toBe(null);
    expect(component.labelText).toBe('label');
    expect(component.placeholder).not.toBe(null);
    expect(component.placeholderText).toBe('placeholder');
    expect(component.required).toBe(true);
    expect(component.value).toBe('value');
    expect(component.name).toBe('name');
    expect(component.type).toBe('TEXT');
  });
});
