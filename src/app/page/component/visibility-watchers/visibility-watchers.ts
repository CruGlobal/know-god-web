import {
  Content,
  FlowWatcher,
  ParserState
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

export class VisibilityWatchers {
  isHidden: boolean;
  isInvisible: boolean;
  private isHiddenWatcher: FlowWatcher;
  private isInvisibleWatcher: FlowWatcher;
  private state: ParserState;

  constructor(private pageService: PageService) {
    this.state = this.pageService.parserState();
  }

  closeWatchers(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();
  }

  init(item: Content): void {
    // Initialize visibility watchers
    this.closeWatchers();

    // Watch for gone-if expressions (removes from DOM)
    this.isHiddenWatcher = item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    // Watch for invisible-if expressions (hides but keeps space)
    this.isInvisibleWatcher = item.watchIsInvisible(
      this.state,
      (value) => (this.isInvisible = value)
    );
  }
}
