import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PageService } from '../../service/page-service.service';
import { mockVideo } from '../../../_tests/mocks';
import { ContentVideoNewComponent } from './content-video.component';
import { ɵunwrapSafeValue } from '@angular/core';

describe('ContentVideoComponent', () => {
  let component: ContentVideoNewComponent;
  let fixture: ComponentFixture<ContentVideoNewComponent>;
  let pageService: PageService;
  const videoId = 'testVideoId';
  const video = mockVideo(videoId);

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentVideoNewComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentVideoNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(pageService, 'formAction');
  }));

  it('Values are assigned correctly', async () => {
    component.item = video;
    component.ngOnChanges({
      item: new SimpleChange(null, video, true)
    });
    expect(component.provider).toBe('YOUTUBE');
    setTimeout(() => {
      expect(ɵunwrapSafeValue(component.videoUrl)).toBe(
        `https://www.youtube.com/embed/${videoId}`
      );
      expect(component.videoId).toBe(videoId);
    }, 0);
    expect(component.ready).toBe(true);
  });
});
