import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeImage } from '../../model/xmlns/content/content-ct-image';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-image',
  templateUrl: './content-image.component.html',
  styleUrls: ['./content-image.component.css'],
})
export class ContentImageComponent implements OnChanges {
  @Input() item: KgwContentElementItem;

  image: KgwContentComplexTypeImage;
  ready: boolean;
  imgResource: string;
  isFirstPage$: Observable<boolean>;

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
              this.image = this.item.element as KgwContentComplexTypeImage;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.imgResource = this.pageService.getImageUrl(
      this.image.attributes.resource
        ? this.image.attributes.resource.trim()
        : '',
    );
    this.ready = true;
  }
}
