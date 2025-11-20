import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Text,
  FlowWatcher,
  parseTextAddBrTags
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-text',
  templateUrl: './content-text.component.html',
  styleUrls: ['./content-text.component.css']
})
export class ContentTextComponent implements OnChanges, OnDestroy {
  @Input() item: Text;

  text: Text;
  ready: boolean;
  textValue: string;
  isFirstPage$: Observable<boolean>;
  dir$: Observable<string>;
  textColor: string;
  styles: any;
  startImgResource: string | null;
  startImgWidth: string | null;
  isHidden: boolean;
  isInvisible: boolean;
  isHiddenWatcher: FlowWatcher;
  isInvisibleWatcher: FlowWatcher;
  state: any;

  constructor(private pageService: PageService) {
    this.isFirstPage$ = pageService.isFirstPage$;
    this.dir$ = this.pageService.pageDir$;
    this.state = this.pageService.parserState();
  }

  ngOnDestroy(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();
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
              this.textValue = '';
              this.text = this.item as Text;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    // Initialize visibility watchers
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();

    // Watch for gone-if expressions (removes from DOM)
    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    // Watch for invisible-if expressions (hides but keeps space)
    this.isInvisibleWatcher = this.item.watchIsInvisible(
      this.state,
      (value) => (this.isInvisible = value)
    );

    const styles = {
      'font-weight': this.text.fontWeight ? this.text.fontWeight : '',
      'font-style': this.text.textStyles?.some(
        (style) => style.name === 'ITALIC'
      )
        ? 'italic'
        : '',
      'text-decoration': this.text.textStyles?.some(
        (style) => style.name === 'UNDERLINE'
      )
        ? 'underline'
        : '',
      'justify-content': this.text.textAlign.name || '',
      'font-size': this.text.textScale ? `${this.text.textScale}rem` : '',
      'line-height': this.text.textScale
        ? `${this.text.textScale * 1.25}rem`
        : '',
      'min-height': this.text.minimumLines ? `${this.text.minimumLines}em` : ''
      // Do not use color for now since we don't want to support desktop and mobile colors
      // color: this.text.textColor || ''
    };

    this.startImgResource = this.item.startImage
      ? this.pageService.getImageUrl(this.item.startImage.name || '')
      : null;
    // Try to find image in all attachments
    if (
      this.startImgResource === this.item.startImage?.name &&
      !this.startImgResource.includes('http')
    ) {
      this.startImgResource =
        this.pageService.findAttachment(this.item.startImage?.name) || '';
    }
    this.startImgWidth = this.item.startImageSize
      ? this.item.startImageSize + 'px'
      : null;

    this.textColor = this.text?.textColor || null;
    this.styles = styles;
    const text = parseTextAddBrTags(this.text.text);
    this.textValue = text || '';
    this.ready = true;
  }
}
