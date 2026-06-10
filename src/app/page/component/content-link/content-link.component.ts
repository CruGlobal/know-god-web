import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  Link,
  Text
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';
import { VisibilityWatchers } from '../visibility-watchers/visibility-watchers';

@Component({
  selector: 'app-content-link',
  templateUrl: './content-link.component.html',
  styleUrls: ['./content-link.component.css']
})
export class ContentLinkComponent implements OnChanges, OnDestroy {
  @Input() item: Link;

  link: Link;
  text: Text;
  ready: boolean;
  linkText: string;
  dir$: Observable<string>;
  visibility: VisibilityWatchers;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
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
              this.linkText = '';
              this.text = null;
              this.link = this.item;
              this.init();
            }
          }
        }
      }
    }
  }

  onClick(): void {
    this.pageService.handleClickable(this.link.events);
  }

  private init(): void {
    this.visibility.init(this.link);

    this.text = this.link.text || null;
    this.linkText = this.link.text?.text || '';
    this.ready = true;
  }
}
