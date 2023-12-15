import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  Paragraph,
  Content
} from 'src/app/services/xml-parser-service/xmp-parser.service';
@Component({
  selector: 'app-content-new-paragraph',
  templateUrl: './content-paragraph.component.html',
  styleUrls: ['./content-paragraph.component.css']
})
export class ContentParagraphComponent implements OnChanges {
  @Input() item: Paragraph;

  paragraph: Paragraph;
  ready: boolean;
  items: Array<Content>;

  constructor() {}

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
              this.items = [];
              this.paragraph = this.item;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.items = this.paragraph.content;
    this.ready = true;
  }
}
