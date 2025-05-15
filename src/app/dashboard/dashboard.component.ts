import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, take, takeUntil } from 'rxjs/operators';
import { APIURL } from '../api/url';
import { CommonService } from '../services/common.service';
import {
  ResourceType,
  ToolType
} from '../services/xml-parser-service/xml-parser.service';
import { getUrlResourceType } from '../shared/getUrlResourceType';

interface Resource {
  imgUrl: string;
  resourceName: string;
  id: string;
  abbreviation: string;
  tagline: string;
  resourceType: ResourceType;
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
  private _booksData: any;
  private _languagesData: any;

  resources: Resource[] = [];
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
  resourceTypes = [ResourceType.Tract, ResourceType.CYOA];

  constructor(
    public route: Router,
    public activatedRoute: ActivatedRoute,
    public commonService: CommonService
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

  private fetchBooks(): void {
    const url =
      APIURL.GET_ALL_BOOKS +
      '?include=attachments,latest-translations,metatool';

    this.commonService
      .getBooks(url)
      .pipe(takeUntil(this._unsubscribeAll), take(1))
      .subscribe((data: any) => {
        this._booksData = data;
        this._prepareDataForLanguage.next();
      });
  }

  private awaitBooks(): void {
    this._prepareDataForLanguage
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        if (!this._booksData) {
          this.fetchBooks();
        } else {
          const attachments = this._booksData.included.filter(
            (included) => included.type === 'attachment'
          );

          const translations = this._booksData.included.filter(
            (included) =>
              included.type === 'translation' &&
              Number(included.relationships.language.data.id) ===
                this.dispLanguage
          );

          this._booksData.data
            .sort(
              (o1, o2) =>
                (o1.attributes['attr-default-order'] || 0) -
                (o2.attributes['attr-default-order'] || 0)
            )
            .forEach((resource) => {
              const { id: resourceId, attributes, relationships } = resource;
              const resourceType = attributes['resource-type'] as ResourceType;

              if (attributes['attr-hidden']) {
                return;
              }
              if (!this.resourceTypes.includes(resourceType)) {
                return;
              }

              if (relationships?.metatool?.data) {
                const metaToolId = relationships.metatool.data.id;
                const metaTool =
                  this._booksData.data.find((tool) => tool.id === metaToolId) ||
                  this._booksData.included.find(
                    (tool) => tool.type === 'resource' && tool.id === metaToolId
                  );

                const defaultVariant =
                  metaTool?.relationships['default-variant'] || null;
                if (
                  defaultVariant != null &&
                  defaultVariant.data.id !== resourceId
                ) {
                  return;
                }
              }

              const translation = translations.find(
                (x) => x.relationships.resource.data.id === resourceId
              );

              if (translation?.attributes) {
                const resourceName = translation.attributes['translated-name'];
                const tagline = translation.attributes['translated-tagline'];
                const imgUrl = attachments.find(
                  (x) => x.id === attributes['attr-banner']
                )?.attributes.file;

                this.resources = [
                  ...this.resources,
                  {
                    imgUrl,
                    resourceName,
                    id: resourceId,
                    abbreviation: attributes.abbreviation,
                    tagline,
                    resourceType
                  }
                ];
              } else {
                console.log('MISSING TRANSLATION', resource, translation);
              }
            });

          this.sectionReady = true;
        }
      });
  }

  navigateToPage(resource: Resource): void {
    const abbreviation = resource.abbreviation;
    const urlResourceType = getUrlResourceType(resource.resourceType);
    const bookType = this.resourceTypes.includes(resource.resourceType)
      ? ToolType.Tool
      : ToolType.Lesson;

    const url = `${this.dispLanguageCode}/${bookType}/${urlResourceType}/${abbreviation}`;
    this.route.navigateByUrl(url);
  }

  onSwitchLanguage(): void {
    this.langSwitchOn = !this.langSwitchOn;
  }

  onSelectLanguage(pLangCode: string): void {
    this.sectionReady = false;
    this._languageChanged.next();
    this.resources = [];
    this.langSwitchOn = !this.langSwitchOn;
    this.route.navigate(['/', pLangCode]);
  }
}
