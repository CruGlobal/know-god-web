import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {
  Content,
  Paragraph
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';
import { VisibilityWatchers } from '../visibility-watchers/visibility-watchers';

@Component({
  selector: 'app-content-paragraph',
  templateUrl: './content-paragraph.component.html',
  styleUrls: ['./content-paragraph.component.css']
})
export class ContentParagraphComponent implements OnChanges, OnDestroy {
  @Input() item: Paragraph;

  paragraph: Paragraph;
  ready: boolean;
  items: Array<Content>;
  visibility: VisibilityWatchers;

  constructor(private pageService: PageService) {
    this.visibility = new VisibilityWatchers(this.pageService);
  }

  ngOnDestroy(): void {
    this.visibility.closeWatchers();
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
    this.visibility.init(this.paragraph);

    this.items = this.paragraph.content;
    this.ready = true;
  }
}
