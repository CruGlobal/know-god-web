import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { PageService } from '../../../service/page-service.service';
import { CYOACardCollectionComponent } from './cyoa-card-collection-page.component';

describe('CYOACardCollectionComponent', () => {
  let component: CYOACardCollectionComponent;
  let fixture: ComponentFixture<CYOACardCollectionComponent>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  const paramMapSubject = new BehaviorSubject<ParamMap>({
    get: (_: string) => '0'
  } as ParamMap);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CYOACardCollectionComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable()
          }
        },
        PageService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CYOACardCollectionComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();

    // Simulate Input and ngOnChanges to trigger init()
    component.page = {
      cards: [
        { id: '1', content: [] },
        { id: '2', content: [] },
        { id: '3', content: [] }
      ]
    } as any;

    component.order = 1;
    component.totalPages = 3;

    component.ngOnChanges({
      page: {
        previousValue: null,
        currentValue: component.page,
        firstChange: true,
        isFirstChange: () => true
      }
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the URL when showing next card', () => {
    component.currentCardIndex = 0;
    spyOn(router, 'navigate');

    component.showNextCard();

    expect(component.currentCardIndex).toBe(1);
    expect(router.navigate).toHaveBeenCalledWith(['../', 1], {
      relativeTo: activatedRoute
    });
  });

  it('should not go past last card', () => {
    component.currentCardIndex = component.cards.length - 1;
    spyOn(router, 'navigate');

    component.showNextCard();

    expect(component.currentCardIndex).toBe(component.cards.length - 1);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not go before first card', () => {
    component.currentCardIndex = 0;
    spyOn(router, 'navigate');

    component.showPreviousCard();

    expect(component.currentCardIndex).toBe(0);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should show previous card', () => {
    component.currentCardIndex = 1;
    spyOn(router, 'navigate');

    component.showPreviousCard();

    expect(component.currentCardIndex).toBe(0);
    expect(router.navigate).toHaveBeenCalledWith(['../', 0], {
      relativeTo: activatedRoute
    });
  });

  it('should update isFirstCard and isLastCard correctly', () => {
    component.goToCard(0);
    expect(component.isFirstCard).toBeTrue();
    expect(component.isLastCard).toBeFalse();

    component.goToCard(1);
    expect(component.isFirstCard).toBeFalse();
    expect(component.isLastCard).toBeFalse();

    component.goToCard(component.cards.length - 1);
    expect(component.isFirstCard).toBeFalse();
    expect(component.isLastCard).toBeTrue();
  });

  it('should subscribe and update card index from paramMap', () => {
    spyOn(router, 'navigate');

    paramMapSubject.next({
      get: () => '2'
    } as unknown as ParamMap);

    expect(component.currentCardIndex).toBe(2);
  });

  it('should navigate to card 0 if param is invalid or missing', () => {
    spyOn(router, 'navigate');

    paramMapSubject.next({ get: () => null } as unknown as ParamMap);
    expect(router.navigate).toHaveBeenCalledWith([0], {
      relativeTo: activatedRoute,
      replaceUrl: true
    });

    paramMapSubject.next({ get: () => '-1' } as unknown as ParamMap);
    expect(router.navigate).toHaveBeenCalledWith([0], {
      relativeTo: activatedRoute,
      replaceUrl: true
    });

    paramMapSubject.next({ get: () => 'not-a-number' } as unknown as ParamMap);
    expect(router.navigate).toHaveBeenCalledWith([0], {
      relativeTo: activatedRoute,
      replaceUrl: true
    });
  });
});
