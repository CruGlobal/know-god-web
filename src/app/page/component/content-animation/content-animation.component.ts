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
import { VisibilityWatchers } from '../visibility-watchers/visibility-watchers';

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
  dir$: Observable<string>;
  lottieOptions: AnimationOptions;
  visibility: VisibilityWatchers;

  private getAnimationListeners(): {
    playListeners: { name: string }[];
    stopListeners: { name: string }[];
  } {
    const animationWithListeners = this.animation as Animation & {
      playListeners?: { name: string }[];
      stopListeners?: { name: string }[];
      _playListeners?: { name: string }[];
      _stopListeners?: { name: string }[];
    };

    return {
      playListeners:
        animationWithListeners.playListeners ??
        animationWithListeners._playListeners ??
        [],
      stopListeners:
        animationWithListeners.stopListeners ??
        animationWithListeners._stopListeners ??
        []
    };
  }

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.visibility = new VisibilityWatchers(this.pageService);
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.visibility.closeWatchers();
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

  onClick(): void {
    this.pageService.handleClickable(this.animation.events);
  }

  onAnimationCreated(anim: AnimationItem): void {
    this.anmViewItem = anim;
  }

  private init(): void {
    this.visibility.init(this.item);

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

    const { playListeners, stopListeners } = this.getAnimationListeners();
    if (playListeners.length || stopListeners.length) {
      this.awaitAnimEvent();
    }
    this.ready = true;
  }

  private awaitAnimEvent(): void {
    this.pageService.contentEvent$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((event) => {
        if (!this.anmViewItem) return;
        const { playListeners, stopListeners } = this.getAnimationListeners();
        const shouldPlay = playListeners.some(
          (listener) => listener.name === event
        );
        const shouldStop = stopListeners.some(
          (listener) => listener.name === event
        );

        if (shouldPlay) {
          this.anmViewItem.play();
        } else if (shouldStop) {
          this.anmViewItem.pause();
        }
      });
  }
}
