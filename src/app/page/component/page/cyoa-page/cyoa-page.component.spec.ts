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
    const spy = spyOn<any>(component, 'onFormAction');
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
      (component as any).init();
    }));

    it('Event followup:send', async () => {
      pageService.formAction('followup:send');
      expect(pageService.emailSignumFormDataNeeded).toHaveBeenCalled();
    });
  });
});
