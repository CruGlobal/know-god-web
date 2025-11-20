import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Text,
  FlowWatcher,
  parseTextRemoveBrTags,
  Input as xmlInput
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-input',
  templateUrl: './content-input.component.html',
  styleUrls: ['./content-input.component.css']
})
export class ContentInputComponent implements OnChanges, OnDestroy {
  @Input() item: xmlInput;

  input: xmlInput;
  label: Text;
  placeholder: Text;
  ready: boolean;
  labelText: string;
  placeholderText: string;
  required: boolean;
  value: string;
  name: string;
  type: string;
  dir$: Observable<string>;
  isHidden: boolean;
  isHiddenWatcher: FlowWatcher;
  state: any;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.state = this.pageService.parserState();
  }

  ngOnDestroy(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
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
              this.input = this.item;
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
    // Initialize visibility watcher
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();

    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    this.label = this.input?.label || null;
    this.labelText = this.input.label?.text || '';
    this.placeholder = this.input?.placeholder || null;
    this.placeholderText =
      parseTextRemoveBrTags(this.input?.placeholder?.text) || '';
    this.required = this.input.isRequired;
    this.value = this.input.value;
    this.name = this.input.name;
    this.type = this.input.type.name;
    this.ready = true;
  }
}
