import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { PageService } from '../../../service/page-service.service';
import { CYOACardCollectionComponent } from './cyoa-card-collection-page.component';

describe('CYOACardCollectionComponent', () => {
  let component: CYOACardCollectionComponent;
  let fixture: ComponentFixture<CYOACardCollectionComponent>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CYOACardCollectionComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (_key: string) => '0'
            })
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

    component.cards = [
      { id: '1', content: [] },
      { id: '2', content: [] }
    ] as any;
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
    component.currentCardIndex = 1;
    spyOn(router, 'navigate');

    component.showNextCard();

    expect(component.currentCardIndex).toBe(1);
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
});
