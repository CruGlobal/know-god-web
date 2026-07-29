import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  Button,
  Resource,
  Text
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';
import { VisibilityWatchers } from '../visibility-watchers/visibility-watchers';

@Component({
  selector: 'app-content-button',
  templateUrl: './content-button.component.html',
  styleUrls: ['./content-button.component.css']
})
export class ContentButtonComponent implements OnChanges, OnDestroy {
  @Input() item: Button;

  button: Button;
  text: Text;
  ready: boolean;
  buttonText: string;
  buttonTextColor: string;
  buttonBgColor: string;
  isOutlined: boolean;
  iconResource: string | null;
  iconWidth: string | null;
  iconGravity: string;
  imgAlt: string;
  dir$: Observable<string>;
  visibility: VisibilityWatchers;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.visibility = new VisibilityWatchers(this.pageService);
  }

  ngOnDestroy(): void {
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
              this.buttonText = '';
              this.text = null;
              this.button = this.item;
              this.buttonTextColor = '';
              this.buttonBgColor = '';
              this.isOutlined = false;
              this.iconResource = null;
              this.iconWidth = null;
              this.iconGravity = '';
              this.imgAlt = '';
              this.init();
            }
          }
        }
      }
    }
  }

  onClick(): void {
    this.pageService.handleClickable(this.button.events);
  }

  private init(): void {
    this.visibility.init(this.button);

    this.isOutlined = this.button.style?.name === 'OUTLINED';

    // TODO Allow Button styles when Books are ready
    // this.buttonTextColor = this.button.buttonColor || ''
    // this.buttonBgColor = this.button.backgroundColor || ''
    if (this.button.text) {
      this.text = this.button.text;
      this.buttonText = this.text?.text || '';
    }

    this.iconResource = this.resolveImage(this.button.icon);
    this.iconWidth = this.button.iconSize ? this.button.iconSize + 'px' : null;
    this.iconGravity = this.button.iconGravity?.name || '';

    // Keep the icon decorative when the button has a text label, but give
    // it a non-empty alt when it is the only content so the control still
    // has an accessible name (WCAG 4.1.2).
    this.imgAlt = this.buttonText ? '' : this.imageAltFallback();

    this.ready = true;
  }

  private imageAltFallback(): string {
    const name = this.button.icon?.name || '';
    return name.replace(/\.[^.]+$/, '') || 'button';
  }

  private resolveImage(resource: Resource | null): string | null {
    if (!resource?.name) {
      return null;
    }
    let url = this.pageService.getImageUrl(resource.name);
    // Try to find image in all attachments
    if (url === resource.name && !url.includes('http')) {
      url = this.pageService.findAttachment(resource.name);
    }
    return url || null;
  }
}
