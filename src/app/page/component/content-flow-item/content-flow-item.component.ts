import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {
  Content,
  FlowItem
} from 'src/app/services/xml-parser-service/xml-parser.service';

@Component({
  selector: 'app-content-flow-item',
  templateUrl: './content-flow-item.component.html',
  styleUrls: ['./content-flow-item.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ContentFlowItemComponent implements OnChanges {
  @Input() item: FlowItem;
  contents: Content[];
  ready: boolean;

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
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    const contents: Content[] = [];
    this.item.content.forEach((content) =>
      content ? contents.push(content) : null
    );
    this.contents = contents;
    this.ready = true;
  }
}
