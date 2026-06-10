import {
  Content,
  FlowWatcher,
  ParserState
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { mockText } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { VisibilityWatchers } from './visibility-watchers';

const wireWatchers = (item: Content) => {
  const goneClose = jasmine.createSpy('goneClose');
  const invisibleClose = jasmine.createSpy('invisibleClose');
  let goneCallback: (value: boolean) => void = () => {};
  let invisibleCallback: (value: boolean) => void = () => {};

  spyOn(item, 'watchIsGone').and.callFake(
    (_state: ParserState, callback: (value: boolean) => void) => {
      goneCallback = callback;
      return { close: goneClose } as unknown as FlowWatcher;
    }
  );
  spyOn(item, 'watchIsInvisible').and.callFake(
    (_state: ParserState, callback: (value: boolean) => void) => {
      invisibleCallback = callback;
      return { close: invisibleClose } as unknown as FlowWatcher;
    }
  );

  return {
    item,
    goneClose,
    invisibleClose,
    triggerGone: (value: boolean) => goneCallback(value),
    triggerInvisible: (value: boolean) => invisibleCallback(value)
  };
};

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
      const { item } = wireWatchers(mockText('sample'));

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
      const watchers = wireWatchers(mockText('sample'));
      visibility.init(watchers.item);

      watchers.triggerGone(true);
      expect(visibility.isHidden).toBe(true);

      watchers.triggerGone(false);
      expect(visibility.isHidden).toBe(false);
    });

    it('updates isInvisible when the invisible watcher emits', () => {
      const watchers = wireWatchers(mockText('sample'));
      visibility.init(watchers.item);

      watchers.triggerInvisible(true);
      expect(visibility.isInvisible).toBe(true);

      watchers.triggerInvisible(false);
      expect(visibility.isInvisible).toBe(false);
    });

    it('closes the previous watchers before opening new ones on re-init', () => {
      const first = wireWatchers(mockText('first'));
      visibility.init(first.item);

      const second = wireWatchers(mockText('second'));
      visibility.init(second.item);

      expect(first.goneClose).toHaveBeenCalledTimes(1);
      expect(first.invisibleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeWatchers', () => {
    it('closes both watchers', () => {
      const watchers = wireWatchers(mockText('sample'));
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
