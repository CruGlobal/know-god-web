import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockCard } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentCardComponent } from './content-card.component';

describe('ContentCardComponent', () => {
  let component: ContentCardComponent;
  let fixture: ComponentFixture<ContentCardComponent>;
  const card = mockCard(false, false);
  const clickableUrl = mockCard(true, true);
  const eventClickable = mockCard(true, false);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentCardComponent],
      providers: [PageService]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentCardComponent);
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
    expect(component.ready).toBeTrue();

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');

    component.onClick();

    expect(pageService.formAction).not.toHaveBeenCalled();
  });

  it('fires events only when clicked on with events', async () => {
    component.item = eventClickable;
    component.ngOnChanges({
      item: new SimpleChange(null, eventClickable, true)
    });

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');
    spyOn(window, 'open');

    component.onClick();
    expect(pageService.formAction).toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it('opens urls only when clicked on with url', async () => {
    component.item = clickableUrl;
    component.ngOnChanges({
      item: new SimpleChange(null, clickableUrl, true)
    });

    const pageService = TestBed.get(PageService);
    spyOn(pageService, 'formAction');
    spyOn(window, 'open');

    component.onClick();
    expect(pageService.formAction).not.toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('URL', '_blank');
  });
});
