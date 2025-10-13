import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Animation } from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-animation',
  templateUrl: './content-animation.component.html',
  styleUrls: ['./content-animation.component.css']
})
export class ContentAnimationComponent implements OnChanges, OnDestroy {
  @Input() item: Animation;

  private _unsubscribeAll = new Subject<void>();
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

  onAnimationCreated(anim: AnimationItem): void {
    this.anmViewItem = anim as AnimationItem;
  }

  private init(): void {
    if (!this.animation?.resource?.name) {
      return;
    }
    this.anmResource = this.pageService.getAnimationUrl(
      this.animation.resource.name
    );
    if (
      this.anmResource === this.animation.resource.name &&
      !this.anmResource.includes('http')
    ) {
      this.anmResource = this.pageService.findAttachment(
        this.animation.resource.name
      );
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
