import {
  Component,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import { ContentInputNewComponent } from '../content-input/content-input.component';
import {
  ContentItems,
  Content,
  ContentParser,
  ContentItemsType
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

  constructor() {}

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
        const type = ContentParser(content);
        if (type === 'form') {
          this.content.push({ type, content: content['content'] });
        } else if (type === 'card') {
          this.content.push({ type, content });
        } else if (content['content']) {
          content['content'].forEach((c) => {
            const contentType = ContentParser(c);
            this.content.push({
              type: contentType,
              content: c as ContentItems
            });
          });
        } else {
          if (type)
            this.content.push({ type, content: content as ContentItems });
        }
      });
    }
    this.ready = true;
  }
}
