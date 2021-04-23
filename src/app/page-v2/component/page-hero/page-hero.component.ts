import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KgwContentComplexTypeForm } from '../../model/xmlns/content/content-ct-form';
import { KgwContentComplexTypeParagraph } from '../../model/xmlns/content/content-ct-paragraph';
import { KgwContentComplexTypeTextchild } from '../../model/xmlns/content/content-ct-text-child';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { KgwTractComplexTypePageHero } from '../../model/xmlns/tract/tract-ct-page-hero';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-page-hero',
  templateUrl: './page-hero.component.html',
  styleUrls: ['./page-hero.component.css']
})
export class PageHeroComponent implements OnInit, OnDestroy, OnChanges {

  @Input('hero') hero : KgwTractComplexTypePageHero;

  private _unsubscribeAll: Subject<any>;

  ready: boolean;
  heading: KgwContentComplexTypeTextchild;
  headingText: string;
  content: Array<KgwContentElementItem>;
  dir$: Observable<string>;
  isForm$: Observable<boolean>;
  isFirstPage$: Observable<boolean>;
  changeHeader$: Observable<string>;

  constructor(
    private pageService: PageService
  ) {
    this._unsubscribeAll = new Subject<any>();
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
    this.isFirstPage$ = this.pageService.isFirstPage$;
    this.changeHeader$ = this.pageService.changeHeader$;
  }

  ngOnInit() {
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
            if (!changes['hero'].previousValue || changes['hero'].currentValue !== changes['hero'].previousValue) {
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
      this.headingText = this.heading.text && this.heading.text.value ? this.heading.text.value.trim() : '';
    }
    if (this.hero.content && this.hero.content.length) {
      this.hero.content.forEach(
        contentChild => {
          if (contentChild.contentType === 'paragraph') {
            var tParagraph: KgwContentComplexTypeParagraph = contentChild as KgwContentComplexTypeParagraph;
            if (!this.pageService.isRestricted(tParagraph.attributes.restrictTo)) {
              let tItemToAdd: KgwContentElementItem = {
                type: 'paragraph',
                element: tParagraph
              };
              this.content.push(tItemToAdd);
            }
          } else if (contentChild.contentType === 'form') {
            var tForm: KgwContentComplexTypeForm = contentChild as KgwContentComplexTypeForm;
            let tItemToAdd: KgwContentElementItem = {
              type: 'form',
              element: tForm
            };            
            this.content.push(tItemToAdd);
          }
        }
      );
    }

    this.changeHeader$
      .pipe(
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(
        newHeader => {
          this.headingText = newHeader;
        }
      );

    this.ready = true;
  }
}
