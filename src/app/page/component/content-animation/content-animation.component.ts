import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KgwContentComplexTypeAnimation } from '../../model/xmlns/content/content-ct-animation';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-animation',
  templateUrl: './content-animation.component.html',
  styleUrls: ['./content-animation.component.css'],
})
export class ContentAnimationComponent implements OnChanges, OnDestroy {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() item: KgwContentElementItem;

  private _unsubscribeAll = new Subject<any>();
  animation: KgwContentComplexTypeAnimation;
  ready: boolean;
  anmResource: string;
  anmOptions: any;
  anmViewItem: any;
  hasEvents: boolean;
  dir$: Observable<string>;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
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
              this.animation = this.item
                .element as KgwContentComplexTypeAnimation;
              this.init();
            }
          }
        }
      }
    }
  }

  onAnimationClick(): void {
    if (this.animation.attributes.events) {
      this.pageService.formAction(this.animation.attributes.events);
    }
  }

  onAnimationCreated(anim: any) {
    this.anmViewItem = anim;
  }

  private init(): void {
    this.anmResource = this.pageService.getAnimationUrl(
      this.animation.attributes.resource
        ? this.animation.attributes.resource.trim()
        : '',
    );
    if (this.anmResource) {
      this.anmOptions = {
        path: this.anmResource,
        loop: !!this.animation.attributes.loop,
        autoplay: !!this.animation.attributes.autoplay,
      };
    }

    this.hasEvents = !!this.animation.attributes.events;

    if (
      !!this.animation.attributes.playListeners ||
      !!this.animation.attributes.stopListeners
    ) {
      this.awaitAnimEvent();
    }

    this.ready = true;
  }

  private awaitAnimEvent(): void {
    this.pageService.contentEvent$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((event) => {
        if (this.animation.attributes.playListeners) {
          const tEvents = this.animation.attributes.playListeners.split(' ');
          if (tEvents.find((playEvent) => playEvent === event)) {
            // Start animation
            if (this.anmViewItem) {
              if (
                this.animation.attributes.events &&
                this.animation.attributes.events === event
              ) {
                this.anmViewItem.togglePause();
              } else {
                this.anmViewItem.play();
              }
            }
          }
        } else if (this.animation.attributes.stopListeners) {
          const tEvents = this.animation.attributes.stopListeners.split(' ');
          if (tEvents.find((playEvent) => playEvent === event)) {
            // Stop animation
            if (this.anmViewItem) {
              if (
                this.animation.attributes.events &&
                this.animation.attributes.events === event
              ) {
                this.anmViewItem.togglePause();
              } else {
                this.anmViewItem.pause();
              }
            }
          }
        }
      });
  }
}
