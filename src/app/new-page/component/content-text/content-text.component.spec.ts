import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PageService } from '../../service/page-service.service';
import { mockText } from '../../../_tests/mocks';
import { ContentTextNewComponent } from './content-text.component';

describe('ContentInputComponent', () => {
  let component: ContentTextNewComponent;
  let fixture: ComponentFixture<ContentTextNewComponent>;
  let pageService: PageService;
  const text = mockText('text cru text \ndps.');

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentTextNewComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentTextNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(pageService, 'formAction');
  }));

  it('Values are assigned correctly', async () => {
    component.item = text;
    component.ngOnChanges({
      item: new SimpleChange(null, text, true)
    });

    expect(component.text).toEqual(text);
    expect(component.textValue).toEqual('text cru text <br/>dps.');
  });
});
