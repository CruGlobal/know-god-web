import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { content } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentFormComponent } from './content-form.component';

describe('ContentFormComponent', () => {
  let component: ContentFormComponent;
  let fixture: ComponentFixture<ContentFormComponent>;
  let pageService: PageService;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentFormComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(pageService, 'formAction');
  }));

  it('Values are assigned correctly', async () => {
    component.item = content;
    component.ngOnChanges({
      item: new SimpleChange(null, content, true)
    });
    expect(component.items).toEqual(content);
  });
});
