import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockLesson } from '../../../../_tests/mocks';
import { PageService } from '../../../service/page-service.service';
import { LessonComponent } from './lesson-page.component';

describe('LessonComponent', () => {
  let component: LessonComponent;
  let fixture: ComponentFixture<LessonComponent>;
  let pageService: PageService;
  const page = mockLesson();

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [LessonComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(LessonComponent);
    component = fixture.componentInstance;
    component.page = page;
    component.order = 2;
    component.totalPages = 4;
    fixture.detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should create and initialize correctly', () => {
    component.ngOnChanges({
      page: new SimpleChange(null, page, true)
    });

    expect(component).toBeTruthy();
    expect(component.content).toEqual(page.content);
    expect(component.ready).toBeTrue();
  });

  it('should trigger onFormAction when formAction emits', () => {
    const spy = spyOn(component, 'onFormAction');
    component.ngOnChanges({
      page: new SimpleChange(null, page, true)
    });

    pageService.formAction('test_action');

    expect(spy).toHaveBeenCalledWith('test_action');
  });

  it('should call contentEvent for standard actions', () => {
    spyOn(pageService, 'contentEvent');
    component.ngOnChanges({
      page: new SimpleChange(null, page, true)
    });

    pageService.formAction('state:test_state');

    expect(pageService.contentEvent).toHaveBeenCalledWith('state:test_state');
  });

  it('should update observables correctly', (done) => {
    pageService.formVisible();

    component.isForm$.subscribe((value) => {
      expect(value).toBeTrue();
      done();
    });
  });

  it('should unsubscribe on destroy', () => {
    const spy = spyOn(component['_unsubscribeAll'], 'next');

    component.ngOnDestroy();

    expect(spy).toHaveBeenCalled();
  });
});
