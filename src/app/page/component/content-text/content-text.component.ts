import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { PageService } from '../../service/page-service.service';
import {
  Text,
  parseTextAddBrTags
} from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-content-new-text',
  templateUrl: './content-text.component.html',
  styleUrls: ['./content-text.component.css']
})
export class ContentTextComponent implements OnChanges {
  @Input() item: Text;

  text: Text;
  ready: boolean;
  textValue: string;
  isFirstPage$: Observable<boolean>;
  dir$: Observable<string>;
  textColor: string;
  styles: any;

  constructor(private pageService: PageService) {
    this.isFirstPage$ = pageService.isFirstPage$;
    this.dir$ = this.pageService.pageDir$;
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
              this.textValue = '';
              this.text = this.item as Text;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    const styles = {};
    this.text?.textStyles?.forEach((style) => {
      if (style.name === 'BOLD') styles['font-weight'] = 'bold';
      if (style.name === 'ITALIC') styles['font-style'] = 'italic';
      if (style.name === 'UNDERLINE') styles['text-decoration'] = 'underline';
    });
    this.styles = styles;
    this.textColor = this.text.textColor || null;
    const text = parseTextAddBrTags(this.text.text);
    this.textValue = text || '';
    this.ready = true;
  }
}
