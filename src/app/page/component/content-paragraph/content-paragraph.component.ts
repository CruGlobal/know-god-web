import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  Content,
  Paragraph
} from 'src/app/services/xml-parser-service/xml-parser.service';

@Component({
  selector: 'app-content-paragraph',
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
