import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PageService } from '../../service/page-service.service';
import { mockImage } from '../../../_tests/mocks';
import { ContentImageComponent } from './content-image.component';

describe('ContentImageComponent', () => {
  let component: ContentImageComponent;
  let fixture: ComponentFixture<ContentImageComponent>;
  const fileName = 'name-of-file.png';
  const filePath = `/some-folder/${fileName}`;
  const image = mockImage(fileName, filePath);
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
});
