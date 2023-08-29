import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockCard } from '../../../_tests/mocks';
import { ContentCardNewComponent } from './content-card.component';
import { PageService } from '../../service/page-service.service';

describe('ContentCardNewComponent', () => {
  let component: ContentCardNewComponent;
  let fixture: ComponentFixture<ContentCardNewComponent>;
  const card = mockCard(false);
  const cardClickable = mockCard(true);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentCardNewComponent],
      providers: [PageService]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentCardNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.item = card;
    component.ngOnChanges({
      item: new SimpleChange(null, card, true)
    });

    expect(component.contents).toEqual(card.content);
    expect(component.background).toEqual(card.backgroundColor);
    expect(component.url).toEqual(card.url);
    expect(component.events).toEqual(card.events);
    expect(component.ready).toBeTrue();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    component.eventClick();

    expect(pageService.formAction).not.toHaveBeenCalled();
  });

  it('should run pageService formAction if clicked on with events', async () => {
    component.item = cardClickable;
    component.ngOnChanges({
      item: new SimpleChange(null, cardClickable, true)
    });

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    component.eventClick();
    expect(pageService.formAction).toHaveBeenCalled();
  });
});
