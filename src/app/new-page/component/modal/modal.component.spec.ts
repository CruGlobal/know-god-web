import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PageService } from '../../service/page-service.service';
import { mockModal } from '../../../_tests/mocks';
import { ModalNewComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalNewComponent;
  let fixture: ComponentFixture<ModalNewComponent>;
  let pageService: PageService;
  const modal = mockModal(
    'Modal top title \n Model bottom title',
    'modal-listener',
  );

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ModalNewComponent],
      providers: [{ provide: PageService, useValue: pageService }],
    }).compileComponents();
    fixture = TestBed.createComponent(ModalNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Values are assigned correctly', async () => {
    component.modal = modal;
    component.ngOnChanges({
      modal: new SimpleChange(null, modal, true),
    });

    expect(component.title).toBe(modal.title);
    expect(component.titleText).toBe(
      'Modal top title <br/> Model bottom title',
    );
    expect(component.content).toBe(modal.content);
    expect(component.ready).toBeTrue();
  });
});
