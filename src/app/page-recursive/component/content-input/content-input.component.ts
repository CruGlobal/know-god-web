import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeInput } from '../../model/xmlns/content/content-ct-input';
import { KgwContentComplexTypeTextchild } from '../../model/xmlns/content/content-ct-text-child';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-input',
  templateUrl: './content-input.component.html',
  styleUrls: ['./content-input.component.css']
})
export class ContentInputComponent implements OnInit {

  @Input('item') item : KgwContentElementItem;

  input: KgwContentComplexTypeInput;
  label: KgwContentComplexTypeTextchild;
  placeholder: KgwContentComplexTypeTextchild;
  ready: boolean;
  labelText: string;
  placeholderText: string;
  dir$: Observable<string>;

  constructor(
    private pageService: PageService
  ) { 
    this.dir$ = this.pageService.pageDir$;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'item': {
            if (!changes['item'].previousValue || changes['item'].currentValue !== changes['item'].previousValue) {
              this.labelText = '';
              this.placeholderText = '';
              this.input = this.item.element as KgwContentComplexTypeInput;
              this.label = null;
              this.placeholder = null;
              this.ready = false;
              setTimeout(() => { this.init(); }, 0);
            }
          }
        }
      }
    }
  }

  private init(): void {
    console.log("[CONTENT TEXT]: input:", this.input);
    this.ready = true;
  }

}
