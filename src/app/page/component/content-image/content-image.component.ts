import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DimensionParser,
  EventId,
  FlowWatcher,
  Image
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { formatEvents } from 'src/app/shared/formatEvents';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-image',
  templateUrl: './content-image.component.html',
  styleUrls: ['./content-image.component.css']
})
export class ContentImageComponent implements OnChanges, OnDestroy {
  @Input() item: Image;

  image: Image;
  ready: boolean;
  imgResource: string;
  isFirstPage$: Observable<boolean>;
  width: string;
  events: EventId[];
  isEventType: boolean;
  isHidden: boolean;
  isHiddenWatcher: FlowWatcher;
  state: any;

  constructor(private pageService: PageService) {
    this.isFirstPage$ = this.pageService.isFirstPage$;
    this.state = this.pageService.parserState();
  }

  ngOnDestroy(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'item': {
            if (
              !changes['item'].previousValue ||
              changes['item'].currentValue !== changes['item'].previousValue
            ) {
              this.ready = false;
              this.imgResource = '';
              this.image = this.item;
              this.init();
            }
          }
        }
      }
    }
  }

  formAction(): void {
    if (this.events && this.isEventType) {
      this.pageService.formAction(formatEvents(this.events));
    }
  }

  private init(): void {
    // Initialize visibility watcher
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();

    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    this.imgResource = this.pageService.getImageUrl(
      this.image.resource.name || ''
    );
    // Try to find image in all attachments
    if (
      this.imgResource === this.image.resource.name &&
      !this.imgResource.includes('http')
    ) {
      this.imgResource =
        this.pageService.findAttachment(this.image.resource.name) || '';
    }
    const dimensions = DimensionParser(this.image.width);
    this.width = dimensions?.value
      ? dimensions.value + dimensions.symbol
      : null;
    this.events = this.image.events;
    this.isEventType = !!this.events?.length;
    this.ready = true;
  }
}
