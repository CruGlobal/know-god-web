import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeFallback } from '../../model/xmlns/content/content-ct-fallback';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-fallback',
  templateUrl: './content-fallback.component.html',
  styleUrls: ['./content-fallback.component.css']
})
export class ContentFallbackComponent implements OnInit, OnChanges {
  // tslint:disable-next-line:no-input-rename
  @Input() item: KgwContentElementItem;

  fallback: KgwContentComplexTypeFallback;
  content: KgwContentElementItem;
  ready: boolean;
  dir$: Observable<string>;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
  }

  ngOnInit() {}

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
              this.content = null;
              this.fallback = this.item
                .element as KgwContentComplexTypeFallback;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    if (this.fallback.children && this.fallback.children.length > 0) {
      this.content = this.pageService.getFirstSupportedContentElement(
        this.fallback.children
      );
    }
    this.ready = true;
  }
}
