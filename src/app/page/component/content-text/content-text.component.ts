import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Text,
  parseTextAddBrTags
} from 'src/app/services/xml-parser-service/xmp-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-text',
  templateUrl: './content-text.component.html',
  styleUrls: ['./content-text.component.css']
})
export class ContentTextComponent implements OnChanges {
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

  constructor(private pageService: PageService) {
    this.isFirstPage$ = pageService.isFirstPage$;
    this.dir$ = this.pageService.pageDir$;
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
    const styles = {
      'font-weight': this.text.textStyles?.some(
        (style) => style.name === 'BOLD'
      )
        ? 'bold'
        : '',
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
      'text-align': this.text.textAlign.name || '',
      'font-size': this.text.textScale ? `${this.text.textScale}rem` : '',
      'line-height': this.text.textScale ? `${this.text.textScale}rem` : '',
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
