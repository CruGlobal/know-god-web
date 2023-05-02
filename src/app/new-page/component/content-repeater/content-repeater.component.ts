import {
  Component,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import { PageService } from '../../service/page-service.service';
import { ContentInputNewComponent } from '../content-input/content-input.component';
import {
  ContentItems,
  Content,
  ContentParser,
  ContentItemsType,
} from 'src/app/services/xml-parser-service/xmp-parser.service';
@Component({
  selector: 'app-content-new-repeater',
  templateUrl: './content-repeater.component.html',
  styleUrls: ['./content-repeater.component.css']
})
export class ContentRepeaterNewComponent implements OnChanges {
  @Input() items: Content[];
  @ViewChildren(ContentInputNewComponent)
  components: QueryList<ContentInputNewComponent>;

  ready: boolean;
  content: ContentItemsType[];

  constructor(private pageService: PageService) {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'items': {
            if (
              !changes['items'].previousValue ||
              changes['items'].currentValue !== changes['items'].previousValue
            ) {
              this.ready = false;
              this.content = [];
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    if (this.items?.length) {
      this.items.forEach((content) => {
        if (content['content']) {
          const hasInputChildren = content['content'].filter(
            (c) => ContentParser(c) === 'input'
          );
          if (hasInputChildren?.length) {
            this.content.push({ type: 'form', content: content['content'] });
          } else {
            content['content'].forEach((c) => {
              const type = ContentParser(c);
              this.content.push({ type, content: c as ContentItems });
            });
          }
        } else {
          const type = ContentParser(content);
          if (type)
            this.content.push({ type, content: content as ContentItems });
        }
      });
    }
    this.ready = true;
  }
}
