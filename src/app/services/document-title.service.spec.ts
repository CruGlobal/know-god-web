import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { DocumentTitleService } from './document-title.service';

describe('DocumentTitleService', () => {
  let service: DocumentTitleService;
  let title: Title;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentTitleService);
    title = TestBed.inject(Title);
    spyOn(title, 'setTitle');
  });

  it('setToolTitle() should put the tool name before the site name', () => {
    service.setToolTitle('Knowing God Personally');
    expect(title.setTitle).toHaveBeenCalledWith(
      'Knowing God Personally | Know God'
    );
  });

  it('setToolTitle() should use only the site name when the tool name is empty', () => {
    service.setToolTitle('');
    expect(title.setTitle).toHaveBeenCalledWith('Know God');
  });

  it('resetTitle() should use only the site name', () => {
    service.resetTitle();
    expect(title.setTitle).toHaveBeenCalledWith('Know God');
  });
});
