import { QueryList } from '@angular/core';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChildren } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KgwContentComplexTypeForm } from '../../model/xmlns/content/content-ct-form';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';
import { ContentInputComponent } from '../content-input/content-input.component';

@Component({
  selector: 'app-content-form',
  templateUrl: './content-form.component.html',
  styleUrls: ['./content-form.component.css']
})
export class ContentFormComponent implements OnInit, OnDestroy {

  @Input('item') item : KgwContentElementItem;
  @ViewChildren(ContentInputComponent) private _inputChildren: QueryList<ContentInputComponent>;

  private _unsubscribeAll = new Subject<any>();

  form: KgwContentComplexTypeForm;
  ready: boolean;
  items: Array<KgwContentElementItem>;
  dir$: Observable<string>;

  constructor(
    private pageService: PageService
  ) { 
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
            if (!changes['item'].previousValue || changes['item'].currentValue !== changes['item'].previousValue) {
              this.ready = false;
              this.items = [];
              this.form = this.item.element as KgwContentComplexTypeForm;
              setTimeout(() => { this.init(); }, 0);
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
    this.items = this.pageService.checkContentElements(this.form.children);
    this.ready = true;
  }

  private awaitEmailSignupFormDataNeeded(): void {
    this.pageService.getEmailSignupFormData$
      .pipe(
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(
        () => {
          
          let emailFormInputs = [];
          let emailFormData = {name:'', email: '', destination_id: ''};
          this._inputChildren.forEach(
            (item, index) => {
              switch(item.name) {
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
            }
          );

          if (emailFormInputs.length === 3) {
            setTimeout(() => {this.pageService.setEmailSignupFormData(emailFormData);}, 0);
          }
        }
      )
  }
}
