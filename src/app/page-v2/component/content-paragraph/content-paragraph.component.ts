import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { KgwContentComplexTypeParagraph } from '../../model/xmlns/content/content-ct-paragraph';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-paragraph',
  templateUrl: './content-paragraph.component.html',
  styleUrls: ['./content-paragraph.component.css']
})
export class ContentParagraphComponent implements OnInit, OnChanges {

  @Input('item') item : KgwContentElementItem;
  
  paragraph: KgwContentComplexTypeParagraph;
  ready: boolean;
  items: Array<KgwContentElementItem>;

  constructor(
    private pageService: PageService
  ) {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'item': {
            if (!changes['item'].previousValue || changes['item'].currentValue !== changes['item'].previousValue) {
              this.ready = false;
              this.items = [];
              this.paragraph = this.item.element as KgwContentComplexTypeParagraph;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.items = this.pageService.checkContentElements(this.paragraph.children);
    this.ready = true;
  }

}
