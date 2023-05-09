import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeInput } from '../../model/xmlns/content/content-ct-input';
import { KgwContentComplexTypeTextchild } from '../../model/xmlns/content/content-ct-text-child';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-input',
  templateUrl: './content-input.component.html',
  styleUrls: ['./content-input.component.css'],
})
export class ContentInputComponent implements OnChanges {
  @Input() item: KgwContentElementItem;

  input: KgwContentComplexTypeInput;
  label: KgwContentComplexTypeTextchild;
  placeholder: KgwContentComplexTypeTextchild;
  ready: boolean;
  labelText: string;
  placeholderText: string;
  required: boolean;
  value: string;
  name: string;
  type: string;
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
              this.labelText = '';
              this.placeholderText = '';
              this.input = this.item.element as KgwContentComplexTypeInput;
              this.label = null;
              this.placeholder = null;
              this.required = false;
              this.value = '';
              this.name = '';
              this.type = '';
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    if (this.input.label) {
      this.label = this.input.label;
      if (this.label && this.label.text && this.label.text.value) {
        this.labelText = this.label.text.value.trim();
      }
    }
    if (this.input.placeholder) {
      this.placeholder = this.input.placeholder;
      if (
        this.placeholder &&
        this.placeholder.text &&
        this.placeholder.text.value
      ) {
        if (this.placeholder.text && this.placeholder.text.value) {
          this.placeholderText = this.placeholder.text.value
            .trim()
            .replace(/<br\s*[\/]?>/gi, ' ');
        }
      }
    }

    this.required = this.input.attributes.required;
    this.value = this.input.attributes.value;
    this.name = this.input.attributes.name;
    this.type = this.input.attributes.type;
    this.ready = true;
  }
}
