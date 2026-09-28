# Code patterns (copied from merged code on `main`)

Copy these shapes. Each one was reviewed and approved. Paths are relative to
`src/app/`.

## Content component

From `page/component/content-button/content-button.component.ts` (#315, #334,
#335, #340). Note `standalone: false`, typed fields, reset in `ngOnChanges`,
`private init()`, `ready` flag, shared visibility and click logic.

```ts
@Component({
  selector: 'app-content-button',
  templateUrl: './content-button.component.html',
  styleUrls: ['./content-button.component.css'],
  standalone: false
})
export class ContentButtonComponent implements OnChanges, OnDestroy {
  @Input() item: Button;

  button: Button;
  ready: boolean;
  buttonText: string;
  isOutlined: boolean;
  iconResource: string | null;
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
              // Reset every derived field before init()
              this.ready = false;
              this.buttonText = '';
              this.button = this.item;
              this.isOutlined = false;
              this.iconResource = null;
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
    this.buttonText = this.button.text?.text || '';
    this.iconResource = this.pageService.getResourceUrl(this.button.icon);
    this.ready = true;
  }
}
```

New components must also be added to `declarations` in `app.module.ts`.

## Template: link vs button, shared inner markup, visibility on existing element

From `content-button.component.html`:

```html
<div
  *ngIf="ready && !visibility.isHidden"
  class="mw568 buttonContent tc"
  [style.visibility]="visibility.isInvisible ? 'hidden' : 'visible'"
  dir="{{ dir$ | async }}"
>
  <a
    *ngIf="button.url; else buttonTemplate"
    class="button"
    [class.button-outline]="isOutlined"
    [href]="button.url"
    target="_blank"
    rel="noopener noreferrer"
    (click)="onClick()"
  >
    <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
  </a>
  <ng-template #buttonTemplate>
    <button type="button" class="button" [class.button-outline]="isOutlined" (click)="onClick()">
      <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
    </button>
  </ng-template>
  <ng-template #buttonContent>
    <img
      *ngIf="iconResource && iconGravity === 'START'"
      class="buttonImg buttonImgStart"
      [src]="iconResource"
      [alt]="imgAlt"
    />{{ buttonText }}
  </ng-template>
</div>
```

Button reset CSS when swapping an `<a>` for a `<button>` (#315):

```css
button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
}
```

RTL-safe spacing (#334):

```css
.buttonImgStart {
  margin-inline-end: 8px;
}
.buttonImgEnd {
  margin-inline-start: 8px;
}
```

## Wrap parser models instead of mutating them

From `page/component/content-flow/content-flow.component.ts` (#328):

```ts
type FlowContent = {
  item: FlowItem;
  itemWidth?: string | null;
  visibility?: VisibilityWatchers;
};

private closeItemWatchers(): void {
  this.items?.forEach((contentItem) =>
    contentItem.visibility?.closeWatchers()
  );
}

private init(): void {
  this.closeItemWatchers();
  this.items = this.flow.items.map((flowItem) => { ... });
}
```

## Shared behavior as a plain class (composition)

From `page/component/visibility-watchers/visibility-watchers.ts` (#306):

```ts
export class VisibilityWatchers {
  isHidden: boolean;
  isInvisible: boolean;
  private isHiddenWatcher: FlowWatcher;
  private isInvisibleWatcher: FlowWatcher;
  private state: ParserState;

  constructor(private pageService: PageService) {
    this.state = this.pageService.parserState();
  }

  closeWatchers(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();
  }

  init(item: Content): void {
    this.closeWatchers();
    // Watch for gone-if expressions (removes from DOM)
    this.isHiddenWatcher = item.watchIsGone(this.state, (value) => {
      this.isHidden = value;
    });
    ...
  }
}
```

## Service logic

From `page/service/page-service.service.ts` (#315, #320, #340):

```ts
// Resolve a manifest resource to its published, immutable file. Resources
// are copied to the published content location under their sha256-based
// filename (localName) when a tool is published.
getResourceUrl(resource: Resource | null): string | null {
  return resource?.localName
    ? APIURL.GET_TRANSLATION_FILES + resource.localName
    : null;
}

handleClickable(events: EventId[]): void {
  if (events && events.length) {
    // Each event can resolve into an array of events, so combine them into a single array.
    // This is necessary to support complex form actions with 'state' in the EventId.
    const resolvedEvents = events.flatMap((event) =>
      event.resolve(this.parserState()).asJsReadonlyArrayView()
    );
    this.formAction(formatEvents(resolvedEvents));
  }
}
```

Service shape (`services/resource.service.ts`, #291): `providedIn: 'root'`,
`readonly` injected deps, `pipe(map(...))`, exported interfaces for return
types.

```ts
@Injectable({ providedIn: 'root' })
export class ResourceService {
  constructor(readonly commonService: CommonService) {}

  getDashboardData(languageId: number): Observable<DashboardData> {
    return this.commonService
      .getBooks(APIURL.GET_ALL_BOOKS + '?include=...')
      .pipe(map((booksData) => this.processBookData(booksData, languageId)));
  }
}
```

Subjects in services: `private _x = new Subject<T>()` plus
`x$: Observable<T> = this._x.asObservable()`, with concrete generic types.

## Subscriptions in components

From `page/component/page/lesson-page/lesson-page.component.ts` (#292):

```ts
readonly _unsubscribeAll: Subject<void>;

constructor(readonly pageService: PageService) {
  this._unsubscribeAll = new Subject();
}

ngOnDestroy() {
  this._unsubscribeAll.next();
  this._unsubscribeAll.complete();
}

private init(): void {
  this._unsubscribeAll.next();
  this.formAction$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((action) => {
      this.onFormAction(action);
    });
  this.ready = true;
}
```

## godtools-shared types and enums

Re-export from `services/xml-parser-service/xml-parser.service.ts`, then import
from there (#314):

```ts
export type Resource = org.cru.godtools.shared.tool.parser.model.Resource;
export const MultiselectOptionStyle =
  org.cru.godtools.shared.tool.parser.model.Multiselect.Option.Style;
```

## API URLs

`api/url.ts`, derived from the environment (#298):

```ts
GET_TRANSLATION_FILES: `${environment.mobileContentApiUrl}/translations/files/`,
```

## Pure helpers

Put framework-free logic in `shared/` with its own spec (`language-search.ts`,
`formatEvents.ts`, `getUrlResourceType.ts`). Short JSDoc header, required
params, generic where useful (`filterLanguages<T>(items, getSearchKey, query)`).

## Spec

From `content-button.component.spec.ts` (#315, #335):

```ts
describe('ContentButtonComponent', () => {
  let component: ContentButtonComponent;
  let fixture: ComponentFixture<ContentButtonComponent>;
  const mockEventButton = mockButton(buttonText, '', buttonEvent);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentButtonComponent],
      providers: [PageService]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('fires events only when clicked on with events', () => {
    component.item = mockEventButton;
    component.ngOnChanges({
      item: new SimpleChange(null, mockEventButton, true)
    });
    fixture.detectChanges();

    const pageService = TestBed.inject(PageService);
    spyOn(pageService, 'formAction');

    component.onClick();
    expect(pageService.formAction).toHaveBeenCalledWith(buttonEvent);
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });
});
```

Visibility tests reuse the shared helper from `_tests/mocks.ts`. From
`content-flow.component.spec.ts` (#328):

```ts
const wireFlowItems = (flow: Flow) =>
  flow.items.map((item: FlowItem) => mockVisibilityWatchers(item));

it('closes every item watcher on destroy', () => {
  const flow = mockFlow();
  const wired = wireFlowItems(flow);
  initWith(flow);

  component.ngOnDestroy();

  wired.forEach((w) => {
    expect(w.goneClose).toHaveBeenCalledTimes(1);
    expect(w.invisibleClose).toHaveBeenCalledTimes(1);
  });
});
```

DOM-level assertions with a small local render helper, from
`content-text-filtering.component.spec.ts` (#306):

```ts
it('keeps the element but hides it when invisible-if is true', () => {
  const element = renderWith({ invisible: true });

  expect(element).not.toBeNull();
  expect(element.style.visibility).toBe('hidden');
});
```

Private access in specs (#308): keep `component` typed and use
`component['_languagesData'] = [...]` or `spyOn<any>(component, 'onFormAction')`.
