import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

/* This component is shared between lesson-page
 * and tract-page but is not used in cyoa-page
 */

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page-navigation.component.html'
})
export class PageNavigationComponent {
  @Input() direction$: Observable<string>;
  @Input() isForm$: Observable<boolean>;
  @Input() isModal$: Observable<boolean>;
  @Input() isFirstPage$: Observable<boolean>;
  @Input() isLastPage$: Observable<boolean>;

  @Output() nextEvent = new EventEmitter<void>();
  @Output() previousEvent = new EventEmitter<void>();

  next(): void {
    this.nextEvent.emit();
  }

  previous(): void {
    this.previousEvent.emit();
  }
}
