import { ParserState } from 'src/app/services/xml-parser-service/xml-parser.service';
import { mockText, mockVisibilityWatchers } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { VisibilityWatchers } from './visibility-watchers';

describe('VisibilityWatchers', () => {
  let pageService: PageService;
  let state: ParserState;
  let visibility: VisibilityWatchers;

  beforeEach(() => {
    pageService = new PageService();
    state = pageService.parserState();
    spyOn(pageService, 'parserState').and.returnValue(state);
    visibility = new VisibilityWatchers(pageService);
  });

  it('reads the parser state from PageService on construction', () => {
    expect(pageService.parserState).toHaveBeenCalled();
  });

  describe('init', () => {
    it('opens a gone and an invisible watcher, passing the parser state', () => {
      const { item } = mockVisibilityWatchers(mockText('sample'));

      visibility.init(item);

      expect(item.watchIsGone).toHaveBeenCalledWith(
        state,
        jasmine.any(Function)
      );
      expect(item.watchIsInvisible).toHaveBeenCalledWith(
        state,
        jasmine.any(Function)
      );
    });

    it('updates isHidden when the gone watcher emits', () => {
      const watchers = mockVisibilityWatchers(mockText('sample'));
      visibility.init(watchers.item);

      watchers.triggerGone(true);
      expect(visibility.isHidden).toBe(true);

      watchers.triggerGone(false);
      expect(visibility.isHidden).toBe(false);
    });

    it('updates isInvisible when the invisible watcher emits', () => {
      const watchers = mockVisibilityWatchers(mockText('sample'));
      visibility.init(watchers.item);

      watchers.triggerInvisible(true);
      expect(visibility.isInvisible).toBe(true);

      watchers.triggerInvisible(false);
      expect(visibility.isInvisible).toBe(false);
    });

    it('closes the previous watchers before opening new ones on re-init', () => {
      const first = mockVisibilityWatchers(mockText('first'));
      visibility.init(first.item);

      const second = mockVisibilityWatchers(mockText('second'));
      visibility.init(second.item);

      expect(first.goneClose).toHaveBeenCalledTimes(1);
      expect(first.invisibleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeWatchers', () => {
    it('closes both watchers', () => {
      const watchers = mockVisibilityWatchers(mockText('sample'));
      visibility.init(watchers.item);

      visibility.closeWatchers();

      expect(watchers.goneClose).toHaveBeenCalledTimes(1);
      expect(watchers.invisibleClose).toHaveBeenCalledTimes(1);
    });

    it('does not throw when no watchers have been opened', () => {
      expect(() => visibility.closeWatchers()).not.toThrow();
    });
  });
});
