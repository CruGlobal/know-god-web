import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private _languagesData: any;

  toolsRoute = 'tools';
  lessonsRoute = 'lessons';
  tools: Resource[] = [];
  lessons: Resource[] = [];
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
  availableLangs: [];
  resourceTypes = [ResourceType.Tract, ResourceType.CYOA, ResourceType.Lesson];

  constructor(
    public route: Router,
    public activatedRoute: ActivatedRoute,
    public commonService: CommonService,
    readonly resourceService: ResourceService
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
        this.availableLangs = this._languagesData.map((lang) => ({
          code: lang.attributes.code,
          name: lang.attributes.name
        }));
      });

    if (!this._languagesData) {
      this.commonService
        .getLanguages(APIURL.GET_ALL_LANGUAGES)
        .pipe(takeUntil(this._unsubscribeAll), take(1))
        .subscribe((data: any) => {
          this._languagesData = data.data;
          this._languagesReady.next();
        });
    } else {
      this._languagesReady.next();
    }
  }

  private checkRouteLang(pRouteLang: string): void {
    this.dispLanguage = undefined;

    if (this._languagesData) {
      this.setDisplayLanguage(pRouteLang);
    } else {
      this.commonService
        .getLanguages(APIURL.GET_ALL_LANGUAGES)
        .pipe(takeUntil(this._unsubscribeAll), take(1))
        .subscribe((data: any) => {
          this._languagesData = data.data;
          this.setDisplayLanguage(pRouteLang);
        });
    }
  }

  private setDisplayLanguage(pRouteLang: string): void {
    if (!this._languagesData) {
      return;
    }

    this._languagesData.forEach((tLanguage) => {
      if (
        tLanguage.attributes &&
        tLanguage.attributes.code &&
        tLanguage.attributes.code === pRouteLang
      ) {
        this.dispLanguage = parseInt(tLanguage.id as string, 10);
        this.dispLanguageCode = tLanguage.attributes.code;
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
          });
      });
  }

  navigateToResourcePage(resource: Resource): void {
    const abbreviation = resource.abbreviation;
    const urlResourceType = getUrlResourceType(resource.resourceType);
    const bookType = this.resourceTypes.includes(resource.resourceType)
      ? ToolType.Tool
      : ToolType.Lesson;

    const url = `${this.dispLanguageCode}/${bookType}/${urlResourceType}/${abbreviation}`;
    this.route.navigateByUrl(url);
  }

  navigateToListPage(type: string): void {
    const url = `/${this.dispLanguageCode}/${type}`;
    this.route.navigateByUrl(url);
  }

  onSwitchLanguage(): void {
    this.langSwitchOn = !this.langSwitchOn;
  }

  onSelectLanguage(pLangCode: string): void {
    this.sectionReady = false;
    this._languageChanged.next();
    this.tools = [];
    this.lessons = [];
    this.langSwitchOn = !this.langSwitchOn;
    this.route.navigate(['/', pLangCode]);
  }

  isToolsPage(): boolean {
    return this.route.url.includes(`/${this.toolsRoute}`);
  }

  isLessonsPage(): boolean {
    return this.route.url.includes(`/${this.lessonsRoute}`);
  }

  isMainDashboard(): boolean {
    return !this.isToolsPage() && !this.isLessonsPage();
  }
}
