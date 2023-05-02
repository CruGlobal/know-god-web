import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageService } from '../../service/page-service.service';
import { Text, Hero, parseTextAddBrTags, Content } from 'src/app/services/xml-parser-service/xmp-parser.service';
@Component({
  selector: 'app-page-new-hero',
  templateUrl: './page-hero.component.html',
  styleUrls: ['./page-hero.component.css']
})
export class PageHeroNewComponent implements OnDestroy, OnChanges {
  @Input() hero: Hero;

  private _unsubscribeAll: Subject<any>;

  ready: boolean;
  heading: Text;
  headingText: string;
  content: Array<Content>;
  dir$: Observable<string>;
  isForm$: Observable<boolean>;
  isFirstPage$: Observable<boolean>;
  changeHeader$: Observable<string>;

  constructor(private pageService: PageService) {
    this._unsubscribeAll = new Subject<any>();
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
    this.isFirstPage$ = this.pageService.isFirstPage$;
    this.changeHeader$ = this.pageService.changeHeader$;
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'hero': {
            if (
              !changes['hero'].previousValue ||
              changes['hero'].currentValue !== changes['hero'].previousValue
            ) {
              this.ready = false;
              this.heading = null;
              this.headingText = '';
              this.content = [];
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    if (this.hero.heading) {
      this.heading = this.hero.heading;
      this.headingText = parseTextAddBrTags(this.heading.text) || '';
    }
    this.content = this.hero.content

    this.changeHeader$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((newHeader) => {
        this.headingText = newHeader;
      });

    this.ready = true;
  }
}
