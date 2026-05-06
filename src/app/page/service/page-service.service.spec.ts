import { TestBed, inject } from '@angular/core/testing';
import { createEventId } from 'src/app/_tests/mocks';
import { PageService } from './page-service.service';

describe('PageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PageService]
    });
  });

  let service: PageService;

  beforeEach(inject([PageService], (pageService: PageService) => {
    service = pageService;
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleClickable', () => {
    beforeEach(() => {
      spyOn(service, 'formAction');
      spyOn(window, 'open');
    });

    it('fires events and opens url when both are present', async () => {
      await service.handleClickable(
        [createEventId('foo')],
        'https://example.com'
      );
      expect(service.formAction).toHaveBeenCalledWith('foo');
      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
    });

    it('fires events when url not present', () => {
      service.handleClickable([createEventId('foo')], null);
      expect(service.formAction).toHaveBeenCalledWith('foo');
      expect(window.open).not.toHaveBeenCalled();
    });

    it('opens url only when events not present', () => {
      service.handleClickable([], 'https://example.com');
      expect(service.formAction).not.toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
    });

    it('does nothing when neither events nor url are provided', () => {
      service.handleClickable([], null);
      expect(service.formAction).not.toHaveBeenCalled();
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  it('addToNavigationStack() should add a page to the stack', (done) => {
    service.addToNavigationStack('1');
    service.getNavigationStack().subscribe((stack) => {
      expect(stack).toEqual(['1']);
      done();
    });
  });

  it('removeFromNavigationStack() should remove the last page if no argument is provided', (done) => {
    service.addToNavigationStack('1');
    service.addToNavigationStack('2');
    service.removeFromNavigationStack();
    service.getNavigationStack().subscribe((stack) => {
      expect(stack).toEqual(['1']);
      done();
    });
  });

  it('removeFromNavigationStack() should remove the specified page if only 2 pages are listed', (done) => {
    service.addToNavigationStack('1');
    service.addToNavigationStack('2');
    service.removeFromNavigationStack('2');
    service.getNavigationStack().subscribe((stack) => {
      expect(stack).toEqual(['1']);
      done();
    });
  });

  it('removeFromNavigationStack() should remove the specified page and all pages after it', (done) => {
    service.addToNavigationStack('1');
    service.addToNavigationStack('2');
    service.addToNavigationStack('3');
    service.removeFromNavigationStack('2');
    service.getNavigationStack().subscribe((stack) => {
      expect(stack).toEqual(['1']);
      done();
    });
  });

  it('clearNavigationStack() should clear the stack', (done) => {
    service.addToNavigationStack('1');
    service.addToNavigationStack('2');
    service.addToNavigationStack('3');
    service.clearNavigationStack();
    service.getNavigationStack().subscribe((stack) => {
      expect(stack).toEqual([]);
      done();
    });
  });

  it('ensureParentPageIsInNavigationStack() should add the parent page if not in stack', (done) => {
    service.addToNavigationStack('0');
    service.addToNavigationStack('2');
    service.ensureParentPageIsInNavigationStack('1');
    service.getNavigationStack().subscribe((stack) => {
      expect(stack).toEqual(['1', '0', '2']);
      done();
    });
  });

  it('ensureParentPageIsInNavigationStack() should not add the parent page if already in stack', (done) => {
    service.addToNavigationStack('1');
    service.addToNavigationStack('2');
    service.ensureParentPageIsInNavigationStack('1');
    service.getNavigationStack().subscribe((stack) => {
      expect(stack).toEqual(['1', '2']);
      done();
    });
  });

  it('ensurePageIsLatestInNavigationStack() should add the page if not in stack', (done) => {
    service.ensurePageIsLatestInNavigationStack('1');
    service.getNavigationStack().subscribe((stack) => {
      expect(stack).toEqual(['1']);
      done();
    });
  });

  it('ensurePageIsLatestInNavigationStack() should move the page to the end if already in stack', (done) => {
    service.addToNavigationStack('0');
    service.addToNavigationStack('1');
    service.addToNavigationStack('2');
    service.ensurePageIsLatestInNavigationStack('1');
    service.getNavigationStack().subscribe((stack) => {
      console.log('stack', stack);
      expect(stack).toEqual(['0', '1']);
      done();
    });
  });
});
