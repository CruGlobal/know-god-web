import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from '../services/common.service';
import { APIURL } from '../api/url';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<any>();
  private routerLanguage: string;

  Images = [];
  englishLangId = 1;
  englishLangCode = 'en';
  englishLangDirection = 'ltr';

  allLanguages: any;
  currentYear = new Date().getFullYear();
  dispLanguage: number;
  dispLanguageCode: string;
  dispLanguageDirection: string;

  constructor(
    public route: Router,
    public activatedRoute: ActivatedRoute,
    public commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      let _langId = params.get('langid');
      if (!_langId || _langId == null || _langId.trim() == '') {
        this.dispLanguage = this.englishLangId;
        this.dispLanguageCode = this.englishLangCode;
        this.dispLanguageDirection = this.englishLangDirection;
        this.getAttachments();
      } else {
        this.AllLanguages(_langId);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  /*To get all languages*/
  AllLanguages(pRouteLang: string) {
    //console.log('ROUTE LANG:', pRouteLang);
    this.dispLanguage = undefined;
    this.commonService
      .getLanguages(APIURL.GET_ALL_LANGUAGES)
      .pipe(
        takeUntil(this._unsubscribeAll),
        take(1)
      )
      .subscribe((data: any) => {
        this.allLanguages = data.data;
        this.allLanguages.forEach(tLanguage => {
          if (
            tLanguage.attributes &&
            tLanguage.attributes.code &&
            tLanguage.attributes.code == pRouteLang
          ) {
            this.dispLanguage = parseInt(tLanguage.id as string);
            this.dispLanguageCode = tLanguage.attributes.code;
            this.dispLanguageDirection = tLanguage.attributes.direction;
          }
        });

        if (!this.dispLanguage) {
          this.dispLanguage = this.englishLangId;
          this.dispLanguageCode = this.englishLangCode;
          this.dispLanguageDirection = this.englishLangDirection;
        }

        //console.log('ROUTE LANG:', this.dispLanguage);
        this.getAttachments();
      });
  }

  getAttachments() {
    const url =
      APIURL.GET_ALL_BOOKS + '?include=latest-translations,attachments';

    this.commonService
      .getBooks(url)
      .pipe(
        takeUntil(this._unsubscribeAll),
        take(1)
      )
      .subscribe((data: any) => {
        const attachments = data.included.filter(
          included => included.type === 'attachment'
        );

        const _translations = data.included.filter(
          included =>
            included.type === 'translation' &&
            Number(included.relationships.language.data.id) ===
              this.dispLanguage
        );

        data.data.forEach(resource => {
          if (resource.attributes['resource-type'] !== 'tract') {
            return;
          }

          const resourceId = resource.id;
          const bannerId = resource.attributes['attr-banner'];

          const _tTranslation = _translations.find(
            x => x.relationships.resource.data.id === resourceId
          );

          if (_tTranslation && _tTranslation.attributes) {
            let _tTranslatedName = _tTranslation.attributes['translated-name'];
            let _tTranslatedTagLine =
              _tTranslation.attributes['translated-tagline'];

            this.Images.push({
              ImgUrl: attachments.find(x => x.id === bannerId).attributes.file,
              resource: _tTranslatedName,
              id: resourceId,
              abbreviation: resource.attributes.abbreviation,
              tagline: _tTranslatedTagLine
            });
          } else {
            console.log('MISSING TRANSLATION', resource, _tTranslation);
          }
        });
      });
  }

  navigateToPage(abbreviation) {
    this.route.navigateByUrl(this.dispLanguageCode + '/' + abbreviation);
  }
}
