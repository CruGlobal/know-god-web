import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { mockModal } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let pageService: PageService;
  const modal = mockModal(
    'Modal top title \n Model bottom title',
    'modal-listener'
  );

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ModalComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.modal = modal;
    component.ngOnChanges({
      modal: new SimpleChange(null, modal, true)
    });

    expect(component.title).toBe(modal.title);
    expect(component.titleText).toBe(
      'Modal top title <br/> Model bottom title'
    );
    expect(component.content).toBe(modal.content);
    expect(component.ready).toBeTrue();
  });
});
