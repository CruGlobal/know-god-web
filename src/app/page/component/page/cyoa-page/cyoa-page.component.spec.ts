import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockCyoa } from '../../../../_tests/mocks';
import { PageService } from '../../../service/page-service.service';
import { CYOAComponent } from './cyoa-page.component';

describe('CYOAComponent', () => {
  let component: CYOAComponent;
  let fixture: ComponentFixture<CYOAComponent>;
  let pageService: PageService;
  const page = mockCyoa();

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [CYOAComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(CYOAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.page = page;
    component.order = 2;
    component.totalPages = 4;
    component.ngOnChanges({
      page: new SimpleChange(null, page, true)
    });
  }));

  it('Values are assigned correctly', async () => {
    expect(component.content).toEqual(page.content);
    expect(component.ready).toBeTrue();
  });

  it('Ensure formAction is run when pageService.formAction is ran', async () => {
    const spy = spyOn(component, 'onFormAction');
    expect(spy).not.toHaveBeenCalled();
    pageService.formAction('action');
    expect(spy).toHaveBeenCalledWith('action');
  });

  it('Test Observables', async () => {
    component.ngOnChanges({
      page: new SimpleChange(null, component, true)
    });

    component.isForm$.subscribe((value) => {
      expect(value).toBeFalse();
    });
  });

  it('Form Observable', async () => {
    pageService.formVisible();
    component.isForm$.subscribe((value) => {
      expect(value).toBeTrue();
    });
  });

  describe('onFormAction', () => {
    beforeEach(waitForAsync(() => {
      spyOn(pageService, 'emailSignumFormDataNeeded');
      component['init']();
    }));

    it('Event followup:send', async () => {
      pageService.formAction('followup:send');
      expect(pageService.emailSignumFormDataNeeded).toHaveBeenCalled();
    });
  });

  describe('navigateBack', () => {
    const setupNavigateBackTest = (
      parentPagePosition: string | undefined,
      ready: boolean,
      showBackButton: boolean
    ) => {
      component.page['parentPage'] = { position: parentPagePosition };
      component.ready = ready;
      component.showBackButton = showBackButton;
    };

    beforeEach(() => {
      spyOn(pageService, 'navigateToPage');
      component.page = page;
    });

    it('should navigate back to page 1', async () => {
      setupNavigateBackTest('1', true, true);

      component.navigateBack();
      expect(pageService.navigateToPage).toHaveBeenCalledWith('1');
    });

    it('should not navigate back', async () => {
      setupNavigateBackTest(undefined, true, true);

      component.navigateBack();
      expect(pageService.navigateToPage).not.toHaveBeenCalled();
    });

    it('should not navigate back when back button is not shown', async () => {
      setupNavigateBackTest('1', true, false);

      component.navigateBack();
      expect(pageService.navigateToPage).not.toHaveBeenCalled();
    });

    it('should not navigate back when component is not ready', async () => {
      setupNavigateBackTest('1', false, true);

      component.navigateBack();
      expect(pageService.navigateToPage).not.toHaveBeenCalled();
    });
  });
});
