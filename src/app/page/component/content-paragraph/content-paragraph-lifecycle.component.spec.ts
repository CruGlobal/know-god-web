import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockParagraph } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentParagraphComponent } from './content-paragraph.component';

describe('ContentParagraphComponent - Visibility Delegation', () => {
  let component: ContentParagraphComponent;
  let fixture: ComponentFixture<ContentParagraphComponent>;
  let pageService: PageService;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentParagraphComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentParagraphComponent);
    component = fixture.componentInstance;
  }));

  it('initializes the visibility watcher when the item changes', () => {
    spyOn(component.visibility, 'init');
    const item = mockParagraph();

    component.item = item;
    component.ngOnChanges({ item: new SimpleChange(null, item, true) });

    expect(component.visibility.init).toHaveBeenCalledWith(item);
  });

  it('closes the visibility watcher on destroy', () => {
    spyOn(component.visibility, 'closeWatchers');

    component.ngOnDestroy();

    expect(component.visibility.closeWatchers).toHaveBeenCalled();
  });
});
