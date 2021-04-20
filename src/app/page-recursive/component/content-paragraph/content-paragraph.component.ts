import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { KgwContentComplexTypeParagraph } from '../../model/xmlns/content/content-ct-paragraph';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-paragraph',
  templateUrl: './content-paragraph.component.html',
  styleUrls: ['./content-paragraph.component.css']
})
export class ContentParagraphComponent implements OnInit {

  @Input('item') item : KgwContentComplexTypeParagraph;
  
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
              setTimeout(() => { this.init(); }, 0);
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.items = this.pageService.checkContentElements(this.item.children);
    this.ready = true;
  }

}
