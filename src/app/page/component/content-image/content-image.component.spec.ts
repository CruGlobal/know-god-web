import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockImage } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentImageComponent } from './content-image.component';

describe('ContentImageComponent', () => {
  let component: ContentImageComponent;
  let fixture: ComponentFixture<ContentImageComponent>;
  const fileName = 'name-of-file.png';
  const filePath = `/some-folder/${fileName}`;
  const imageEvent = 'page3';
  const image = mockImage(fileName, filePath, imageEvent);
  const fileNameNotAdded = 'name-of-file-not-added.png';
  const filePathNotAdded = `/some-folder/${fileName}`;
  const imageNoNameNotAdded = mockImage(fileNameNotAdded, filePathNotAdded);
  let pageService: PageService;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentImageComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    pageService.addToImagesDict(fileName, filePath);
    spyOn(pageService, 'findAttachment');
  }));

  it('Fetch image from pageService', async () => {
    component.item = image;
    component.ngOnChanges({
      item: new SimpleChange(null, image, true)
    });
    expect(pageService.findAttachment).not.toHaveBeenCalledWith(fileName);
    expect(component.imgResource).toBe(filePath);
  });

  it('Find image from pageService if not in pageService', () => {
    component.item = imageNoNameNotAdded;
    component.ngOnChanges({
      item: new SimpleChange(null, imageNoNameNotAdded, true)
    });
    expect(pageService.findAttachment).toHaveBeenCalledWith(fileNameNotAdded);
  });

  it('Test events', () => {
    component.item = image;
    component.ngOnChanges({
      item: new SimpleChange(null, image, true)
    });

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    component.formAction();

    expect(pageService.formAction).toHaveBeenCalledWith(imageEvent);
  });
});
