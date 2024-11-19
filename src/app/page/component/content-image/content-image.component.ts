import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { PageService } from '../../service/page-service.service';
import {
  DimensionParser,
  Image
} from 'src/app/services/xml-parser-service/xmp-parser.service';
@Component({
  selector: 'app-content-new-image',
  templateUrl: './content-image.component.html',
  styleUrls: ['./content-image.component.css']
})
export class ContentImageComponent implements OnChanges {
  @Input() item: Image;

  image: Image;
  ready: boolean;
  imgResource: string;
  isFirstPage$: Observable<boolean>;
  width: string;

  constructor(private pageService: PageService) {
    this.isFirstPage$ = this.pageService.isFirstPage$;
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
              this.imgResource = '';
              this.image = this.item;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.imgResource = this.pageService.getImageUrl(
      this.image.resource.name || ''
    );
    // Try to find image in all attachments
    if (
      this.imgResource === this.image.resource.name &&
      !this.imgResource.includes('http')
    ) {
      this.imgResource =
        this.pageService.findAttachment(this.image.resource.name) || '';
    }
    const dimensions = DimensionParser(this.image.width);
    this.width = dimensions?.value
      ? dimensions.value + dimensions.symbol
      : null;
    this.ready = true;
  }
}
