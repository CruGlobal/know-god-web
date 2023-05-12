import {
  OnChanges,
  QueryList,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KgwContentComplexTypeForm } from '../../model/xmlns/content/content-ct-form';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';
import { ContentInputNewComponent } from '../content-input/content-input.component';
import { ContentItems } from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-content-new-form',
  templateUrl: './content-form.component.html',
  styleUrls: ['./content-form.component.css']
})
export class ContentFormNewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() item: ContentItems;
  @ViewChildren(ContentInputNewComponent)
  private _inputChildren: QueryList<ContentInputNewComponent>;

  private _unsubscribeAll = new Subject<any>();

  form: KgwContentComplexTypeForm;
  ready: boolean;
  items: Array<KgwContentElementItem>;
  dir$: Observable<string>;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
  }

  ngOnInit() {
    this.awaitEmailSignupFormDataNeeded();
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
              // PIZZA
              // this.form = this.item as KgwContentComplexTypeForm;
              this.init();
            }
          }
        }
      }
    }
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  trackByFn(index, item) {
    return index;
  }

  private init(): void {
    // PIZZA
    // this.items = this.pageService.checkContentElements(this.form.children);
    this.ready = true;
  }

  private awaitEmailSignupFormDataNeeded(): void {
    this.pageService.getEmailSignupFormData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        const emailFormInputs = [];
        const emailFormData = { name: '', email: '', destination_id: '' };
        this._inputChildren.forEach((item, index) => {
          switch (item.name) {
            case 'name':
              emailFormData.name = item.value;
              emailFormInputs.push(item);
              break;
            case 'email':
              emailFormData.email = item.value;
              emailFormInputs.push(item);
              break;
            case 'destination_id':
              emailFormData.destination_id = item.value;
              emailFormInputs.push(item);
              break;
            default:
              break;
          }
        });

        if (emailFormInputs.length === 3) {
          setTimeout(() => {
            this.pageService.setEmailSignupFormData(emailFormData);
          }, 0);
        }
      });
  }
}
