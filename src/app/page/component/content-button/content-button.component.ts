import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { Button } from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-button',
  templateUrl: './content-button.component.html',
  styleUrls: ['./content-button.component.css']
})
export class ContentButtonComponent implements OnChanges {
  @Input() item: Button;

  button: Button;
  text: any;
  ready: boolean;
  buttonText: string;
  buttonTextColor: string;
  buttonBgColor: string;
  dir$: Observable<string>;

  constructor(private pageService: PageService) {
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
              this.buttonText = '';
              this.text = null;
              this.button = this.item;
              this.buttonTextColor = '';
              this.buttonBgColor = '';
              this.init();
            }
          }
        }
      }
    }
  }

  onClick(): void {
    this.pageService.handleClickable(this.button.events, this.button.url);
  }

  private init(): void {
    // TODO Allow Button styles when Books are ready
    // this.buttonTextColor = this.button.buttonColor || ''
    // this.buttonBgColor = this.button.backgroundColor || ''
    if (this.button.text) {
      this.text = this.button.text;
      this.buttonText = this.text?.text || '';
    }

    this.ready = true;
  }
}
