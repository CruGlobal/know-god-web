import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

/* Shared navigation component for lesson-page and tract-page.
 * Not used in cyoa-page since it navigates via content interactions, not buttons.
 * Also not used in cyoa-card-collection-page since it navigates between cards, not pages.
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
