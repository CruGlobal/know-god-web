import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { KgwTrainingComplexTypeTip } from '../../model/xmlns/training/training-ct-tip';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-training-new-tip',
  templateUrl: './training-tip.component.html',
  styleUrls: ['./training-tip.component.css']
})
export class TrainingTipNewComponent implements OnChanges {
  @Input() item: KgwContentElementItem;

  tip: KgwTrainingComplexTypeTip;
  ready: boolean;
  visible$: Observable<boolean>;
  dir$: Observable<string>;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.visible$ = this.pageService.visibleTipId$.pipe(
      map((id) => id && this.tip && this.tip.id && this.tip.id === id)
    );
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
              this.tip = this.item.element as KgwTrainingComplexTypeTip;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.ready = true;
  }
}
