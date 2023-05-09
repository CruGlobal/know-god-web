import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PageService } from '../../service/page-service.service';
import { content } from '../../../_tests/mocks';
import { ContentFormNewComponent } from './content-form.component';

describe('ContentFormComponent', () => {
  let component: ContentFormNewComponent;
  let fixture: ComponentFixture<ContentFormNewComponent>;
  let pageService: PageService;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentFormNewComponent],
      providers: [{ provide: PageService, useValue: pageService }],
    }).compileComponents();
    fixture = TestBed.createComponent(ContentFormNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(pageService, 'formAction');
  }));

  it('Values are assigned correctly', async () => {
    component.item = content;
    component.ngOnChanges({
      item: new SimpleChange(null, content, true),
    });
    expect(component.items).toEqual(content);
  });
});
