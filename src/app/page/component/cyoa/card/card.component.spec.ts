import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockCyoaCard } from 'src/app/_tests/mocks';
import { PageService } from 'src/app/page/service/page-service.service';
import { CyoaCardComponent } from './card.component';

describe('CyoaCardComponent', () => {
  let component: CyoaCardComponent;
  let fixture: ComponentFixture<CyoaCardComponent>;
  let pageService: PageService;
  const card = mockCyoaCard(0);

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [CyoaCardComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(CyoaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(pageService, 'formAction');
  }));

  it('Values are assigned correctly', async () => {
    component.card = card;
    component.ngOnChanges({
      card: new SimpleChange(null, card, true)
    });

    expect(component.content).toEqual(card.content);
  });
});
