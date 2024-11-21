import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockHeader } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { PageHeaderComponent } from './page-header.component';

describe('pageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;
  let pageService: PageService;
  const header = mockHeader('6', 'How jesus can \nchange your life.');

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [PageHeaderComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.header = header;
    component.ngOnChanges({
      header: new SimpleChange(null, header, true)
    });

    expect(component.headerText).toBe('How jesus can <br/>change your life.');
    expect(component.headerNumber).toBe(6);
    expect(component.ready).toBeTrue();
  });

  it('Header should chnage if pageService.changeHeader is run', async () => {
    component.header = header;
    component.ngOnChanges({
      header: new SimpleChange(null, header, true)
    });

    pageService.changeHeader('New header about jesus saving lifes.');
    expect(component.headerText).toBe('New header about jesus saving lifes.');
  });
});
