import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { PageService } from '../../service/page-service.service';
import { Paragraph, ContentItems, Content } from 'src/app/services/xml-parser-service/xmp-parser.service';
@Component({
  selector: 'app-content-new-paragraph',
  templateUrl: './content-paragraph.component.html',
  styleUrls: ['./content-paragraph.component.css']
})
export class ContentParagraphNewComponent implements OnChanges {
  @Input() item: Paragraph;

  paragraph: Paragraph;
  ready: boolean;
  items: Array<Content>;

  constructor(private pageService: PageService) {}

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
    console.log('this.item', this.paragraph)
    console.log('this.item.content', this.paragraph.content)

    this.items = this.paragraph.content
    this.ready = true;
  }
}
