import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageService } from '../../service/page-service.service';
import { Animation } from 'src/app/services/xml-parser-service/xmp-parser.service';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-content-new-animation',
  templateUrl: './content-animation.component.html',
  styleUrls: ['./content-animation.component.css']
})
export class ContentAnimationComponent implements OnChanges, OnDestroy {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() item: Animation;

  private _unsubscribeAll = new Subject<any>();
  animation: Animation;
  ready: boolean;
  anmResource: string;
  anmViewItem: AnimationItem;
  hasEvents: boolean;
  dir$: Observable<string>;
  lottieOptions: AnimationOptions;

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
              this.animation = this.item;
              this.init();
            }
          }
        }
      }
    }
  }

  onAnimationClick(): void {
    if (this.animation.events) {
      let action = '';
      this.animation.events.forEach((event, idx) => {
        const value = event?.namespace
          ? `${event.namespace}:${event.name}`
          : event.name;
        action += idx ? ` ${value}` : value;
      });
      this.pageService.formAction(action);
    }
  }

  onAnimationCreated(anim: any) {
    this.anmViewItem = anim as AnimationItem;
  }

  private init(): void {
    // TODO
    // Need to update to e31_1 when we release a new Shared Parser.
    const resource = {
      name: (this.animation as any).e31_1 || ''
    };
    this.anmResource = this.pageService.getAnimationUrl(resource.name || '');
    if (
      this.anmResource === resource.name &&
      !this.anmResource.includes('http')
    ) {
      this.anmResource = this.pageService.findAttachment(resource.name) || '';
    }

    if (this.anmResource) {
      this.lottieOptions = {
        path: this.anmResource,
        loop: !!this.animation.loop,
        autoplay: !!this.animation.autoPlay
      };
    }

    this.hasEvents = !!this.animation.events;

    if (!!this.animation.playListeners || !!this.animation.stopListeners) {
      this.awaitAnimEvent();
    }
    this.ready = true;
  }

  private awaitAnimEvent(): void {
    this.pageService.contentEvent$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((event) => {
        if (!this.anmViewItem) return;
        const playListeners = this.animation.playListeners.filter(
          (listener) => listener.name === event
        ).length;
        const stopListeners = this.animation.stopListeners.filter(
          (listener) => listener.name === event
        ).length;

        if (playListeners) {
          this.anmViewItem.play();
        } else if (stopListeners) {
          this.anmViewItem.pause();
        }
      });
  }
}
