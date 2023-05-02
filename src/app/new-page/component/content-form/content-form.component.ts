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
import { PageService } from '../../service/page-service.service';
import { ContentRepeaterNewComponent } from '../content-repeater/content-repeater.component';
import { Content } from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-content-new-form',
  templateUrl: './content-form.component.html',
  styleUrls: ['./content-form.component.css']
})
export class ContentFormNewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() item: Content[];
  @ViewChildren(ContentRepeaterNewComponent)
  private _inputChildren: QueryList<ContentRepeaterNewComponent>;

  private _unsubscribeAll = new Subject<any>();

  form: Content[];
  ready: boolean;
  items: Content[];
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
              this.form = this.item;
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
    this.items = this.item;
    this.ready = true;
  }

  private awaitEmailSignupFormDataNeeded(): void {
    this.pageService.getEmailSignupFormData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        const emailFormInputs = [];
        const emailFormData = { name: '', email: '', destination_id: '' };
        this._inputChildren.first.components.forEach((component) => {
          switch (component.name) {
            case 'name':
              emailFormData.name = component.value;
              emailFormInputs.push(component);
              break;
            case 'email':
              emailFormData.email = component.value;
              emailFormInputs.push(component);
              break;
            case 'destination_id':
              emailFormData.destination_id = component.value;
              emailFormInputs.push(component);
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
