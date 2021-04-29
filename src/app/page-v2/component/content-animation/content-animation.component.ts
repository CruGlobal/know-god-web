import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeAnimation } from '../../model/xmlns/content/content-ct-animation';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-animation',
  templateUrl: './content-animation.component.html',
  styleUrls: ['./content-animation.component.css']
})
export class ContentAnimationComponent implements OnInit, OnChanges {
  // tslint:disable-next-line:no-input-rename
  @Input() item: KgwContentElementItem;

  animation: KgwContentComplexTypeAnimation;
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
              this.animation = this.item
                .element as KgwContentComplexTypeAnimation;
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
