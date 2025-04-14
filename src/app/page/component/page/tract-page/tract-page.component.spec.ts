import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockTractPage } from '../../../../_tests/mocks';
import { PageService } from '../../../service/page-service.service';
import { TractPageComponent } from './tract-page.component';

describe('TractPageComponent', () => {
  let component: TractPageComponent;
  let fixture: ComponentFixture<TractPageComponent>;
  let pageService: PageService;
  const page = mockTractPage(
    false,
    '2',
    'WE ARE SINFUL AND SEPARATED FROM GOD',
    'Have you heard of the four spiritual laws?',
    'callToActionText',
    'cardLabel',
    'modalTitle',
    1
  );
  const Lastpage = mockTractPage(
    true,
    '3',
    'WE ARE SINFUL AND SEPARATED FROM GOD',
    'Have you heard of the four spiritual laws?',
    'callToActionText',
    'cardLabel',
    'modalTitle',
    1
  );

  const Modalpage = mockTractPage(
    true,
    '3',
    'WE ARE SINFUL AND SEPARATED FROM GOD',
    'Have you heard of the four spiritual laws?',
    'callToActionText',
    null,
    'modalTitle',
    1
  );

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [TractPageComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(TractPageComponent);
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
    expect(component.header).toEqual(page.header);
    expect(component.hasPageHeader).toBeTrue();
    expect(component.hero).toEqual(page.hero);
    expect(component.cards).toEqual(page.cards);
    expect(component.modal).toEqual(page.modals[0]);
    expect(component.callToAction).toEqual(page.callToAction);
    expect(component.ready).toBeTrue();
  });

  it('Ensure formAction is run when pageService.formAction is ran', async () => {
    const spy = spyOn<any>(component, 'onFormAction');
    expect(spy).not.toHaveBeenCalled();
    pageService.formAction('action');
    expect(spy).toHaveBeenCalledWith('action');
  });

  it('Test all Observablers', async () => {
    component.page = Lastpage;
    component.order = 3;
    component.ngOnChanges({
      page: new SimpleChange(null, Lastpage, true)
    });

    component.isForm$.subscribe((value) => {
      expect(value).toBeFalse();
    });
    component.isModal$.subscribe((value) => {
      expect(value).toBeFalse();
    });
    component.isFirstPage$.subscribe((value) => {
      expect(value).toBeFalse();
    });
    component.isLastPage$.subscribe((value) => {
      expect(value).toBeTrue();
    });
  });

  it('Form Observable', async () => {
    pageService.formVisible();
    component.isForm$.subscribe((value) => {
      expect(value).toBeTrue();
    });
  });

  it('Modal Observable', async () => {
    pageService.modalVisible();
    component.isModal$.subscribe((value) => {
      expect(value).toBeTrue();
    });
  });

  describe('onFormAction', () => {
    let setHiddenCardToShowSpy, setShownCardToHiddenSpy;

    beforeEach(waitForAsync(() => {
      spyOn(pageService, 'emailSignumFormDataNeeded');
      spyOn(pageService, 'changeHeader');
      spyOn(pageService, 'nextPage');
      spyOn(pageService, 'previousPage');
      spyOn(pageService, 'formHidden');
      spyOn(pageService, 'formVisible');
      spyOn(pageService, 'modalHidden');
      spyOn(pageService, 'modalVisible');
      setHiddenCardToShowSpy = spyOn<any>(component, 'setHiddenCardToShow');
      setShownCardToHiddenSpy = spyOn<any>(component, 'setShownCardToHidden');
      (component as any).init();
    }));

    it('Event followup:send', async () => {
      pageService.formAction('followup:send');
      expect(pageService.emailSignumFormDataNeeded).toHaveBeenCalled();
    });

    it('Event includes "-no-thanks"', async () => {
      pageService.formAction('test-no-thanks');
      expect(pageService.emailSignumFormDataNeeded).not.toHaveBeenCalled();
      expect(pageService.previousPage).not.toHaveBeenCalled();
    });

    it('Event includes "-no-thanks" & on last page', async () => {
      component.page = Lastpage;
      component.order = 3;
      component.ngOnChanges({
        page: new SimpleChange(null, Lastpage, true)
      });

      pageService.formAction('test-no-thanks');

      expect(pageService.emailSignumFormDataNeeded).not.toHaveBeenCalled();
      expect(pageService.nextPage).not.toHaveBeenCalled();
    });

    it('should show Card 3 and hide the first 2 cards', async () => {
      component.cards[0].isTemporarilyHidden = false;
      component.cards[1].isTemporarilyHidden = false;
      pageService.formAction('cardLabel-2');

      expect(pageService.emailSignumFormDataNeeded).not.toHaveBeenCalled();
      expect((component as any)._cardShownOnFormAction).toBe(2);
      expect(pageService.formVisible).toHaveBeenCalled();
      expect(pageService.modalHidden).toHaveBeenCalled();
      expect(pageService.changeHeader).toHaveBeenCalledWith(
        page.cards[2].label.text
      );
      expect((component as any)._cardsHiddenOnFormAction).toEqual([0, 1]);
    });

    it('Card Dismiss Listeners', async () => {
      pageService.formAction('cardLabel-2-dismiss');

      expect(pageService.emailSignumFormDataNeeded).not.toHaveBeenCalled();
      setTimeout(() => {
        if ((component as any)._cardsHiddenOnFormAction.length) {
          expect(setHiddenCardToShowSpy).toHaveBeenCalled();
        }
        if ((component as any)._cardShownOnFormAction >= 0) {
          expect(setShownCardToHiddenSpy).toHaveBeenCalled();
        }
        expect((component as any)._cardShownOnFormAction).toBe(-1);
        expect((component as any)._cardsHiddenOnFormAction).toEqual([]);
      }, 0);
    });

    it('Modal Listeners', async () => {
      component.page = Modalpage;
      component.ngOnChanges({
        page: new SimpleChange(null, Modalpage, true)
      });

      pageService.formAction('modalTitle-0');

      expect(pageService.formHidden).toHaveBeenCalled();
      expect(pageService.modalVisible).toHaveBeenCalled();
    });

    it('Modal Dismiss Listeners', async () => {
      component.page = Modalpage;
      component.ngOnChanges({
        page: new SimpleChange(null, Modalpage, true)
      });

      pageService.formAction('modalTitle-0-dismess');

      expect(pageService.modalHidden).toHaveBeenCalled();
      expect(pageService.formHidden).toHaveBeenCalled();
      setTimeout(() => {
        if ((component as any)._cardsHiddenOnFormAction.length) {
          expect(setHiddenCardToShowSpy).toHaveBeenCalled();
        }
        if ((component as any)._cardShownOnFormAction >= 0) {
          expect(setShownCardToHiddenSpy).toHaveBeenCalled();
        }
        expect((component as any)._cardShownOnFormAction).toBe(-1);
        expect((component as any)._cardsHiddenOnFormAction).toEqual([]);
      }, 0);
    });
  });
});
