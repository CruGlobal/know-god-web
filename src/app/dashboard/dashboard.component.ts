import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { Subject } from 'rxjs';
import { delay, take, takeUntil } from 'rxjs/operators';
import { APIURL } from '../api/url';
import { CommonService } from '../services/common.service';
import { Resource, ResourceService } from '../services/resource.service';
import {
  ResourceType,
  ToolType
} from '../services/xml-parser-service/xml-parser.service';
import { getUrlResourceType } from '../shared/getUrlResourceType';
import {
  buildLanguageSearchKey,
  filterLanguages
} from '../shared/language-search';

interface Language {
  id: string;
  attributes: {
    code: string;
    name: string;
    direction: string;
  };
}

interface LanguagesResponse {
  data: Language[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<void>();
  private _languagesReady = new Subject<void>();
  private _languageChanged = new Subject<void>();
  private _prepareDataForLanguage = new Subject<void>();
  private _languagesData: Language[];
  private _languageSearchKeys = new Map<string, string>();

  @ViewChild('languageSearchInput')
  private languageSearchInput: ElementRef<HTMLInputElement>;

  private readonly _toolsRoute = 'tools';
  private readonly _lessonsRoute = 'lessons';
  tools: Resource[] = [];
  lessons: Resource[] = [];
  languagesWithLessons: Set<string>;
  englishLangId = 1;
  englishLangCode = 'en';
  englishLangName = 'English';
  englishLangDirection = 'ltr';
  sectionReady: boolean;
  currentYear = new Date().getFullYear();
  dispLanguage: number;
  dispLanguageCode: string;
  dispLanguageName: string;
  dispLanguageDirection: string;
  langSwitchOn: boolean;
  availableLangs: { code: string; name: string }[];
  filteredLangs: { code: string; name: string }[] = [];
  showNoLanguagesMessage = false;
  languageSearchText = '';
  resourceTypes = [ResourceType.Tract, ResourceType.CYOA, ResourceType.Lesson];

  constructor(
    public route: Router,
    public activatedRoute: ActivatedRoute,
    public commonService: CommonService,
    readonly resourceService: ResourceService,
    @Inject(I18NEXT_SERVICE) private i18n: ITranslationService
  ) {}

  ngOnInit(): void {
    this.awaitBooks();

    this.activatedRoute.paramMap.subscribe((params) => {
      const _langId = params.get('langId');
      if (!_langId || _langId == null || _langId.trim() === '') {
        this.dispLanguage = this.englishLangId;
        this.dispLanguageCode = this.englishLangCode;
        this.dispLanguageName = this.englishLangName;
        this.dispLanguageDirection = this.englishLangDirection;
        this.prepareLanguageSwitcher();
        this._prepareDataForLanguage.next();
      } else {
        this.checkRouteLang(_langId);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this._languageChanged.complete();
    this._languagesReady.complete();
    this._prepareDataForLanguage.complete();
  }

  private prepareLanguageSwitcher(): void {
    this._languagesReady
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._languageChanged),
        delay(0)
      )
      .subscribe(() => {
        // awaitBooks can re-emit languagesReady before the languages request
        // has resolved; ignore emissions until the data is actually here.
        if (!this._languagesData) {
          return;
        }

        const shouldFilterLanguages =
          this.languagesWithLessons && this.isLessonsPage();

        this.availableLangs = this._languagesData
          .filter((lang) => {
            return (
              !shouldFilterLanguages || this.languagesWithLessons.has(lang.id)
            );
          })
          .map(({ attributes }) => ({
            code: attributes.code,
            name: attributes.name
          }));
        this.updateFilteredLangs();
      });

    if (!this._languagesData) {
      this.commonService
        .getLanguages(APIURL.GET_ALL_LANGUAGES)
        .pipe(takeUntil(this._unsubscribeAll), take(1))
        .subscribe((data: LanguagesResponse) => {
          this._languagesData = data.data;
          this._languagesReady.next();
        });
    } else {
      this._languagesReady.next();
    }
  }

  private checkRouteLang(urlLanguageCode: string): void {
    this.dispLanguage = undefined;

    if (this._languagesData) {
      this.setDisplayLanguage(urlLanguageCode);
    } else {
      this.commonService
        .getLanguages(APIURL.GET_ALL_LANGUAGES)
        .pipe(takeUntil(this._unsubscribeAll), take(1))
        .subscribe((data: LanguagesResponse) => {
          this._languagesData = data.data;
          this.setDisplayLanguage(urlLanguageCode);
        });
    }
  }

  private setDisplayLanguage(urlLanguageCode: string): void {
    if (!this._languagesData) {
      return;
    }

    this._languagesData.forEach((tLanguage) => {
      if (
        tLanguage.attributes &&
        tLanguage.attributes.code &&
        tLanguage.attributes.code.toLowerCase() ===
          urlLanguageCode.toLowerCase()
      ) {
        this.dispLanguage = parseInt(tLanguage.id as string, 10);
        this.dispLanguageCode = tLanguage.attributes.code;
        this.i18n.changeLanguage(this.dispLanguageCode);
        this.dispLanguageName = tLanguage.attributes.name;
        this.dispLanguageDirection = tLanguage.attributes.direction;
      }
    });

    if (!this.dispLanguage) {
      this.dispLanguage = this.englishLangId;
      this.dispLanguageCode = this.englishLangCode;
      this.dispLanguageName = this.englishLangName;
      this.dispLanguageDirection = this.englishLangDirection;
    }

    this.prepareLanguageSwitcher();
    this._prepareDataForLanguage.next();
  }

  private awaitBooks(): void {
    this._prepareDataForLanguage
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.resourceService
          .getDashboardData(this.dispLanguage)
          .pipe(takeUntil(this._unsubscribeAll), take(1))
          .subscribe((data) => {
            this.tools = data.tools;
            this.lessons = data.lessons;
            this.sectionReady = true;
            this.languagesWithLessons = data.languagesWithLessons;
            // Rebuild availableLangs since languagesWithLessons is set asynchronously after the initial load
            this._languagesReady.next();
          });
      });
  }

  navigateToResourcePage(resource: Resource): void {
    const abbreviation = resource.abbreviation;
    const urlResourceType = getUrlResourceType(resource.resourceType);
    const isLesson = resource.resourceType === ResourceType.Lesson;
    const url = isLesson
      ? `${this.dispLanguageCode}/${ToolType.Lesson}/${abbreviation}`
      : `${this.dispLanguageCode}/${ToolType.Tool}/${urlResourceType}/${abbreviation}`;
    this.route.navigateByUrl(url);
  }

  onSwitchLanguage(): void {
    this.langSwitchOn = !this.langSwitchOn;
    this.languageSearchText = '';
    this.updateFilteredLangs();
    if (this.langSwitchOn) {
      setTimeout(() => this.languageSearchInput?.nativeElement.focus());
    }
  }

  onLanguageSearchTextChange(searchText: string): void {
    this.languageSearchText = searchText;
    this.updateFilteredLangs();
  }

  // Recomputed on demand instead of a getter so the filter doesn't re-run on
  // every change-detection cycle.
  private updateFilteredLangs(): void {
    this.filteredLangs = this.availableLangs
      ? filterLanguages(
          this.availableLangs,
          (lang) => this.getLanguageSearchKey(lang),
          this.languageSearchText
        )
      : [];
    this.showNoLanguagesMessage =
      this.availableLangs?.length > 0 && this.filteredLangs.length === 0;
  }

  // Search keys are built lazily on the first non-empty search and cached, so
  // opening the dashboard never pays the Intl.DisplayNames cost for the full
  // language list up front.
  private getLanguageSearchKey(lang: { code: string; name: string }): string {
    const cacheKey = `${lang.code}|${this.dispLanguageCode}`;
    let searchKey = this._languageSearchKeys.get(cacheKey);
    if (searchKey === undefined) {
      searchKey = buildLanguageSearchKey(
        lang.code,
        lang.name,
        this.dispLanguageCode
      );
      this._languageSearchKeys.set(cacheKey, searchKey);
    }
    return searchKey;
  }

  onSelectLanguage(pLangCode: string): void {
    this.sectionReady = false;
    this._languageChanged.next();
    this.tools = [];
    this.lessons = [];
    this.langSwitchOn = !this.langSwitchOn;

    const segment = this.isToolsPage()
      ? this._toolsRoute
      : this.isLessonsPage()
        ? this._lessonsRoute
        : null;

    this.route.navigate(segment ? ['/', pLangCode, segment] : ['/', pLangCode]);
  }

  get toolsRoute(): string {
    return `/${this.dispLanguageCode}/${this._toolsRoute}`;
  }

  get lessonsRoute(): string {
    return `/${this.dispLanguageCode}/${this._lessonsRoute}`;
  }

  isToolsPage(): boolean {
    return this.route.url === this.toolsRoute;
  }

  isLessonsPage(): boolean {
    return this.route.url === this.lessonsRoute;
  }

  isMainDashboard(): boolean {
    return !this.isToolsPage() && !this.isLessonsPage();
  }
}
