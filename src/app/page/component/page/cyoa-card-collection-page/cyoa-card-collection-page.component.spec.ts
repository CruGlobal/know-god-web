import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { PageService } from '../../../service/page-service.service';
import { CYOACardCollectionComponent } from './cyoa-card-collection-page.component';

describe('CYOACardCollectionComponent', () => {
  let component: CYOACardCollectionComponent;
  let fixture: ComponentFixture<CYOACardCollectionComponent>;
  let setCardUrlSpy: jasmine.Spy;

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
    component.setCardUrl = (card: number) => card;
    setCardUrlSpy = spyOn(component, 'setCardUrl');
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

    component.showNextCard();

    expect(component.currentCardIndex).toBe(1);
    expect(setCardUrlSpy).toHaveBeenCalledWith(1);
  });

  it('should not go past last card', () => {
    setCardUrlSpy.calls.reset();
    component.currentCardIndex = component.cards.length - 1;

    component.showNextCard();

    expect(component.currentCardIndex).toBe(component.cards.length - 1);
    expect(setCardUrlSpy).not.toHaveBeenCalled();
  });

  it('should not go before first card', () => {
    setCardUrlSpy.calls.reset();
    component.currentCardIndex = 0;

    component.showPreviousCard();

    expect(component.currentCardIndex).toBe(0);
    expect(setCardUrlSpy).not.toHaveBeenCalled();
  });

  it('should show previous card', () => {
    component.currentCardIndex = 1;

    component.showPreviousCard();

    expect(component.currentCardIndex).toBe(0);
    expect(setCardUrlSpy).toHaveBeenCalledWith(0);
  });

  it('should update isFirstCard and isLastCard correctly', () => {
    component.goToCard(0);
    expect(component.isFirstCard()).toBeTrue();
    expect(component.isLastCard()).toBeFalse();

    component.goToCard(1);
    expect(component.isFirstCard()).toBeFalse();
    expect(component.isLastCard()).toBeFalse();

    component.goToCard(component.cards.length - 1);
    expect(component.isFirstCard()).toBeFalse();
    expect(component.isLastCard()).toBeTrue();
  });

  it('should subscribe and update card index from paramMap', () => {
    paramMapSubject.next({
      get: () => '2'
    } as unknown as ParamMap);

    expect(component.currentCardIndex).toBe(2);
  });

  it('should navigate to card 0 if param is invalid or missing', () => {
    paramMapSubject.next({ get: () => null } as unknown as ParamMap);
    expect(setCardUrlSpy).toHaveBeenCalledWith(0);

    paramMapSubject.next({ get: () => '-1' } as unknown as ParamMap);
    expect(setCardUrlSpy).toHaveBeenCalledWith(0);

    paramMapSubject.next({ get: () => 'not-a-number' } as unknown as ParamMap);
    expect(setCardUrlSpy).toHaveBeenCalledWith(0);
  });
});
