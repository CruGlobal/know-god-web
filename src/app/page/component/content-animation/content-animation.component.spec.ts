import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockAnimation } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentAnimationComponent } from './content-animation.component';

describe('ContentAnimationComponent', () => {
  let component: ContentAnimationComponent;
  let fixture: ComponentFixture<ContentAnimationComponent>;
  const fileName = 'the_four_animation.json';
  const filePath = `/some-folder/${fileName}`;
  const animation = mockAnimation(fileName, filePath, 'event');
  const fileNameNotAdded = 'name-of-file-not-added.png';
  const filePathNotAdded = `/some-folder/${fileName}`;
  const animationNoNameNotAdded = mockAnimation(
    fileNameNotAdded,
    filePathNotAdded,
    'event'
  );
  let pageService: PageService;

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentAnimationComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    pageService.addToAnimationsDict(fileName, filePath);
    spyOn(pageService, 'findAttachment');
  }));

  it('Fetch animation from pageService', async () => {
    component.item = animation;
    component.ngOnChanges({
      item: new SimpleChange(null, animation, true)
    });
    expect(pageService.findAttachment).not.toHaveBeenCalledWith(fileName);
    expect(component.anmResource).toEqual(filePath);
    expect(component.lottieOptions).toEqual({
      path: filePath,
      loop: true,
      autoplay: true
    });
    expect(component.hasEvents).toBeTrue();
  });

  it('Find animation from pageService if not in pageService', () => {
    component.item = animationNoNameNotAdded;
    component.ngOnChanges({
      item: new SimpleChange(null, animationNoNameNotAdded, true)
    });
    expect(pageService.findAttachment).toHaveBeenCalledWith(fileNameNotAdded);
  });
});
