import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockTractCard } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { CardComponent } from './card.component';

describe('ContentCardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let pageService: PageService;
  const card = mockTractCard('test label', 0, 'test-label-listener', false);

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [CardComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(pageService, 'formAction');
  }));

  it('Values are assigned correctly', async () => {
    component.card = card;
    component.ngOnChanges({
      card: new SimpleChange(null, card, true)
    });

    expect(component.label).toEqual(card.label);
    expect(component.labelText).toEqual('test label');
    expect(component.content).toEqual(card.content);
  });
});
