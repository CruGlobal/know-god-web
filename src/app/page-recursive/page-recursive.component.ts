import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { CommonService } from '../services/common.service';
import { LoaderService } from '../services/loader-service/loader.service';
import { IPageParameters } from './model/page-parameters';
import { APIURL } from '../api/url';
import { KgwManifest } from './model/xmlns/manifest/manifest-manifest';
import { KgwTract } from './model/xmlns/tract/tract-tract';
import { KgwManifestComplexTypePage } from './model/xmlns/manifest/manifest-ct-page';
import { KgwTractComplexTypePage } from './model/xmlns/tract/tract-ct-page';
import { PageService } from './service/page-service.service';

@Component({
  selector: 'app-page-recursive',
  templateUrl: './page-recursive.component.html',
  styleUrls: ['./page-recursive.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PageRecursiveComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<any>();
  private _pageChanged = new Subject<any>();
  private _pageParams: IPageParameters;
  private _allLanguagesLoaded: boolean;
  private _allLanguages: Array<any>;
  private _booksLoaded: boolean;
  private _books: Array<any>;
  private _pageBookLoaded: boolean;
  private _pageBook: any;
  private _pageBookIndex: any;
  private _pageBookMainfest:KgwManifest;
  private _pageBookMainfestLoaded: boolean;
  private _pageBookTranslations: Array<any>;
  private _pageBookTranslationId: number;
  private _pageBookSubPagesManifest: Array<KgwManifestComplexTypePage>;
  private _pageBookSubPages: Array<KgwTract>;
  private _selectedLanguage: any;

  pagesLoaded: boolean;
  selectedLang: string;
  availableLanguages: Array<any>;
  languagesVisible: boolean;
  selectedBookName: string;
  activePage: KgwTractComplexTypePage;
  activePageOrder: number;
  totalPages: number;
  bookNotAvailableInLanguage: boolean;

  constructor(
    private loaderService: LoaderService,
    public commonService: CommonService,
    private pageService: PageService,
    private route: ActivatedRoute,
    public router: Router
  ) {    
    this._pageParams = {
      langid: '',
      bookid: ''
    };
    this._books = [];
    this.activePageOrder = 0;
  }

  ngOnInit() {
    console.log("[PAGEREC]: ngOnInit!");
    this.awaitPageChanged();
    this.awaitPageParameters();
    this.awaitEmailFormSignupDataSubmitted();
  }

  ngOnDestroy() {
    console.log("[PAGEREC]: ngOnDestroy!");
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this._pageChanged.complete();
  }

  selectLanguage(lang): void {
    console.log("[PAGEREC]: selectLanguage: _pageParams:langCode", this._pageParams, lang);
    this.router.navigate(['page/new/recursive', lang.attributes.code, this._pageParams.bookid, '0'])
    return; 
  }

  onToggleLanaguageSelect(): void {
    this.languagesVisible = !this.languagesVisible;
  }

  private onPreviousPage(): void {
    let tPageId = this._pageParams.pageid;
    if (tPageId > 0){
      tPageId--;
      this.router.navigate(['page/new/recursive', this._pageParams.langid, this._pageParams.bookid, tPageId]);
    }
  }

  private onNextPage(): void {
    let tPageId = this._pageParams.pageid;
    tPageId++;
    if (tPageId < this._pageBookSubPagesManifest.length){
      setTimeout(() => {this.router.navigate(['page/new/recursive', this._pageParams.langid, this._pageParams.bookid, tPageId]);}, 0)
    }
  }

  private getImage(resource) {
    if (resource == undefined || resource == '' || resource == null) return '';

    if (this._pageBookIndex != undefined && this._pageBookIndex != null) {
      var attachments = this._pageBookIndex.included.filter(
        row => {
          if (
            row.type.toLowerCase() == 'attachment' &&
            row.attributes['file-file-name'].toLowerCase() ==
              resource.toLowerCase()
          )
            return true;
          else 
            return false;
        }
      );

      if (attachments.length == 0) {
        console.log('getImages: Image not found in index file');
        return '';
      }

      var filename = attachments[0].attributes.file;

      //add name to prefetch
      let link = document.createElement('link');
      link.href = filename;
      link.rel = 'prefetch';
      document.getElementsByTagName('head')[0].appendChild(link);

      this.pageService.addToImagesDict(resource, filename);
      return filename;
    }
  }

  private loadBookPage(page:KgwManifestComplexTypePage, pageorder:number): void {    
    this.commonService
      .downloadFile(
        APIURL.GET_XML_FILES_FOR_MANIFEST + this._pageBookTranslationId + '/' + page.src
      )
      .subscribe((data: any) => {
        let enc = new TextDecoder('utf-8');
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);

        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'application/xml');

        let _tTract: KgwTract = new KgwTract(result);
        _tTract.pagename = page.filename;
        _tTract.pageorder = pageorder;
        _tTract.parseXml();
        if (_tTract && _tTract.page) {
          var _tTractImages = _tTract.getImageResources();
          if (_tTractImages && _tTractImages.length){
            _tTractImages.forEach(
              image => {
                this.getImage(image);
              }
            );
          }
          
          this._pageBookSubPages.push(_tTract);

          if (
            (this._pageParams.pageid && pageorder === this._pageParams.pageid) ||
            (!this._pageParams.pageid && pageorder === 0)
          ) {
            this.showPage(_tTract);
          }
        }
      });    
  }

  private loadBookManifestXML(): void {  
    this.pageService.clear();  
    var item:any = {};
    this._pageBookTranslations.forEach(
      translation => {
        if (
          translation &&
          translation.relationships &&
          translation.relationships.language && 
          translation.relationships.language.data &&          
          translation.relationships.language.data.id &&       
          translation.relationships.language.data.id  == this._selectedLanguage.id
        ) {
          item = translation;
          return;
        }
      }
    );
   
    if (
      item &&
      item.id &&
      item.attributes &&
      item.attributes &&
      item.attributes['manifest-name']
    ) {
      const manifestName = item.attributes['manifest-name'];
      const translationid = item.id;
      this.commonService
        .downloadFile(
          APIURL.GET_XML_FILES_FOR_MANIFEST +
          translationid +
          '/' +
          manifestName
        )
        .pipe(
          takeUntil(this._unsubscribeAll),
          takeUntil(this._pageChanged)
        )
        .subscribe(
          data => {
            let enc = new TextDecoder('utf-8');
            let arr = new Uint8Array(data);
            let result = enc.decode(arr);
            this._pageBookMainfest = new KgwManifest(result);
            this._pageBookMainfest.parseXml();
            this._pageBookTranslationId = translationid;

            if (
              this._pageBookMainfest.manifest &&
              this._pageBookMainfest.manifest.pages &&
              this._pageBookMainfest.manifest.pages.length > 0) {
                this._pageBookSubPagesManifest = [];
                this._pageBookSubPages = [];
                let tPageOrder = 0;
                this._pageBookMainfest.manifest.pages.forEach(
                  tPage => {
                    this._pageBookSubPagesManifest.push(tPage);
                    this.loadBookPage(tPage, tPageOrder);
                    tPageOrder++;
                  }
                );
                this.totalPages = this._pageBookSubPagesManifest.length;
                this._pageBookMainfestLoaded = true;
            } else {
              //TODO: Page not found for language
            }
          }
        );      
    }
  }

  private getAvailableLanguagesForSelectedBook(): void {
    this.availableLanguages = [];
    if (this._allLanguages && this._allLanguages.length > 0) {
      this._allLanguages.forEach(
        languageItem => {
          if (
            languageItem.relationships &&
            languageItem.relationships.translations &&
            languageItem.relationships.translations.data
          ) {
            const languageTranslations = languageItem.relationships.translations.data;

            let isLanguageForSelectedBook = false;

            languageTranslations.forEach(
              languageTranslation => {
                this._pageBookTranslations.forEach(
                  pageBookTranslation => {                    
                    if (languageTranslation.id == pageBookTranslation.id) {
                      isLanguageForSelectedBook = true;
                      return;
                    }
                  }                  
                );
                if (isLanguageForSelectedBook) {
                  return;
                }
              }
            );

            if (isLanguageForSelectedBook) {
              this.availableLanguages.push(languageItem);
            }
          }
        }
      );
    }

    if (this.checkIfPreSelectedLanguageExists()){
      this.loadBookManifestXML();
    } else {
      this.bookNotAvailableInLanguage = true;
      this.loaderService.display(false);
      console.log("[PAGEREC]: Book not available in routed language!", this._pageParams.langid, this._selectedLanguage, this._pageBookTranslations);
    }
  }

  private loadPageBookIndex(): void {
    this._pageBookTranslations = [];
    this.commonService
      .downloadFile(APIURL.GET_INDEX_FILE.replace('{0}', this._pageBook.id))
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._pageChanged)
      )
      .subscribe(
        (data:any) => {
          let enc = new TextDecoder('utf-8');
          let arr = new Uint8Array(data);
          let result = enc.decode(arr);
          let jsonResource = JSON.parse(result);
          this._pageBookIndex = jsonResource;
          console.log("[PAGEREC]: loadPageBookIndex:", this._pageBookIndex);
          
          if (
            jsonResource &&
            jsonResource.data &&
            jsonResource.data.attributes &&
            jsonResource.data.attributes['resource-type'] &&
            jsonResource.data.attributes['resource-type'] === 'tract'
            ) {
              if (!jsonResource.data.attributes['manifest']) {
                //TODO: Implement tract manifest not available!
                return;
              }

              if (
                jsonResource.data.relationships &&
                jsonResource.data.relationships['latest-translations'] &&                
                jsonResource.data.relationships['latest-translations'].data
              ) {                
                const tPageBookRequiredTranslations = jsonResource.data.relationships['latest-translations'].data;
                if (
                  tPageBookRequiredTranslations &&
                  tPageBookRequiredTranslations.length > 0 &&
                  jsonResource.included &&
                  jsonResource.included.length > 0
                ) {
                  const tIncluded = jsonResource.included;
                  tPageBookRequiredTranslations.forEach(
                    pageBookTranslationItem => {
                      let translations = tIncluded.filter(
                        row => {
                          if (row.type == 'translation' && row.id == pageBookTranslationItem.id)
                            return true;
                          else
                            return false;                          
                        }
                      );
                      if (translations && translations.length > 0) {
                        translations.forEach(
                          item => {
                            this._pageBookTranslations.push(item);
                          }
                        );
                      }
                    }
                  );
                }
              }
              
              this.selectedBookName = jsonResource.data.attributes['name'];

              this.getAvailableLanguagesForSelectedBook();
          } else {
            //TODO: Implement invalid resource type error
          }
        }
      )
  }

  private loadPageBook(): void {
    this._pageBook = {};

    this._books.forEach(x => {
      if (x.attributes.abbreviation == this._pageParams.bookid) {
        this._pageBook = x;
      }
    });

    if (!this._pageBook.id) {
      //TODO: Implement page book not found error
    } else {
      this._pageBookLoaded = true;
      this.loadPageBookIndex();
    }
  }

  private getAllBooks(): void {
    this.commonService
      .getBooks(APIURL.GET_ALL_BOOKS)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (data: any) => {
          if (data && data.data) {
            this._books = data.data;
            this._booksLoaded = true;
            this.loadPageBook();
          } else {
            //TODO: implement books load error
          }          
        }
      );
  }

  private getAllLanguages(): void {
    this._allLanguages = [];
    this.commonService
      .getLanguages(APIURL.GET_ALL_LANGUAGES)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        if (data && data.data) {
          this._allLanguages = data.data;
          this._allLanguagesLoaded = true;
          if (this._pageParams && this._pageParams.langid) {
            this.setSelectedLanguage();
          }
          this.getAllBooks();
        } else {
          //TODO: Implement languages load error
        }
      });
  }

  private setSelectedLanguage(): void {
    this._allLanguages.forEach(
      lang => {
        if (lang && lang.attributes && lang.attributes['code'] && lang.attributes['code'] == this._pageParams.langid) {
          this._selectedLanguage = lang;
          this.selectedLang = lang.attributes.name;
          this.pageService.setDir(lang.attributes.direction);
        }
      }
    );    
  }

  private checkIfPreSelectedLanguageExists() {
    if (this._selectedLanguage && this._selectedLanguage.id) {
      let x = this._pageBookTranslations.find(
        x => {
          return x.relationships && 
            x.relationships.language &&
            x.relationships.language.data &&
            x.relationships.language.data.id &&
            x.relationships.language.data.id == this._selectedLanguage.id;
          }
      );
      return x && x.id;
    } else {
      return false;
    }
  }

  private awaitPageChanged(): void {
    this._pageChanged    
      .pipe(
        takeUntil(this._unsubscribeAll),
        delay(0)
      )
      .subscribe(
        () => {
          console.log("[PAGEREC]: Page changed!", this._pageParams);
          if (!this._allLanguagesLoaded) {
            this.loaderService.display(true);
            this.getAllLanguages();
          } else if (!this._booksLoaded) {
            this.loaderService.display(true);
            this.getAllBooks();
          } else if (!this._pageBookLoaded) {
            this.loaderService.display(true);
            this.loadPageBook();
          } else {
            if (this._pageBookMainfestLoaded ) {
              if (this._pageBookSubPages && this._pageBookSubPages.length) {
                const index = this._pageBookSubPages.findIndex(sPage => sPage.pageorder === this._pageParams.pageid);
                if (index >= 0) {
                  const tTract = this._pageBookSubPages[index];
                  this.showPage(tTract);
                  return;
                }
              }

              if (this._pageBookSubPagesManifest && this._pageBookSubPagesManifest.length > this._pageParams.pageid) {
                let tSubPageManifest = this._pageBookMainfest[this._pageParams.pageid];
                if (tSubPageManifest) {
                  this.pagesLoaded = false;
                  this.loaderService.display(true);
                  this.loadBookPage(tSubPageManifest, this.activePageOrder);
                  return;
                }
              }
            }

            this.loaderService.display(true);
            this.clearData();
            this.getAllBooks();            
          }
        }
      )
  }

  private awaitPageParameters(): void {
    this.route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {

        let bookChanged = false;
        if (this._pageParams.langid !== params['langid']) {
          bookChanged = true
        } else if (this._pageParams.bookid !== params['bookid']) {
          bookChanged = true
        }

        if (!bookChanged) {
          this._pageParams.pageid = Number(params['page']);
        } else {
          console.log("[PAGEREC]: awaitPageParameters: bookChanged!");
          this._pageParams.langid = params['langid'];
          this._pageParams.bookid = params['bookid'];
          this._pageParams.pageid = Number(params['page']);
          this.clearData();
          if (this._allLanguagesLoaded) {
            this.setSelectedLanguage();
          }
        }

        this._pageChanged.next();
      });
  }

  private awaitPageNavigation(): void {
    this.pageService.nextPage$
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._pageChanged),
        delay(0)
      )
      .subscribe(
        () => {
          this.onNextPage();
        }
      );

    this.pageService.previousPage$
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._pageChanged),
        delay(0)
      )
      .subscribe(
        () => {
          this.onPreviousPage();
        }
      );
  }

  private awaitEmailFormSignupDataSubmitted(): void {
    this.pageService.emailSignupFormData$
      .pipe(
        takeUntil(this._unsubscribeAll),
        filter(tData => tData)
      )
      .subscribe(
        data => {
          if (data.name && data.email && data.destination_id) {
            const subscriberData = {
              data: {
                type: 'follow_up',
                attributes: {
                  name: data.name,
                  email: data.email,
                  language_id: Number(this._selectedLanguage.id),
                  destination_id: Number(data.destination_id)
                }
              }
            };
            this.commonService.createSubscriber(subscriberData).pipe(takeUntil(this._unsubscribeAll)).subscribe(); 
          }            
        }
      )
  }

  private clearData(): void {
    this._booksLoaded = false;
    this._books = []
    this._pageBookLoaded = false;
    this._pageBook = {};
    this._pageBookIndex = {};
    this._pageBookMainfestLoaded = false;
    this._pageBookMainfest = new KgwManifest('');
    this._pageBookTranslations = [];
    this._pageBookTranslationId = 0;
    this._pageBookSubPagesManifest = [];
    this._pageBookSubPages = [];
    this.availableLanguages = [];
    this.selectedBookName = "";
    this.languagesVisible = false;
    this.activePage = null;
    this.activePageOrder = 0;
    this.totalPages = 0;
    this.bookNotAvailableInLanguage = false;
  }

  private showPage(page:KgwTract): void {
    console.log("[PAGE]: showPage:", page);
    this.activePageOrder = page.pageorder;
    this.activePage = page.page;
    this.awaitPageNavigation();
    setTimeout(()=>{
      this.pagesLoaded = true;
      this.loaderService.display(false);
    }, 0);       
  }
}
