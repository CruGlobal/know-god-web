import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { KgwContentComplexTypeParagraph } from "../model/xmlns/content/content-ct-paragraph";
import { KgwContentComplexTypeText } from "../model/xmlns/content/content-ct-text";
import { KgwContentComplexTypeImage } from "../model/xmlns/content/content-ct-image";
import { KgwContentComplexTypeVideo } from "../model/xmlns/content/content-ct-video";
import { KgwContentComplexTypeButton } from "../model/xmlns/content/content-ct-button";
import { KgwContentElementItem } from "../model/xmlns/content/content-element";

@Injectable({
    providedIn: 'root'
})
export class PageService {

    private _nextPage = new Subject<any>();
    private _previousPage = new Subject<any>();
    private _formAction = new Subject<string>();
    private _changeHeader = new Subject<string>();
    private _getEmailSignupFormData = new Subject<any>();
    private _emailSignupFormData = new Subject<any>();
    private _dir = new BehaviorSubject<string>('ltr');
    private _isFirstPage = new BehaviorSubject<boolean>(false);
    private _isLastPage = new BehaviorSubject<boolean>(false);
    private _isForm = new BehaviorSubject<boolean>(false);
    private _isModal = new BehaviorSubject<boolean>(false);
    private _imageUrlsDict = new BehaviorSubject<string[]>([]);

    formAction$:Observable<string> = this._formAction.asObservable();
    changeHeader$:Observable<string> = this._changeHeader.asObservable();
    getEmailSignupFormData$: Observable<any> = this._getEmailSignupFormData.asObservable();
    emailSignupFormData$: Observable<any> = this._emailSignupFormData.asObservable();
    nextPage$:Observable<any> = this._nextPage.asObservable();
    previousPage$:Observable<any> = this._previousPage.asObservable();
    pageDir$:Observable<string> = this._dir.asObservable();
    isFirstPage$:Observable<boolean> = this._isFirstPage.asObservable();
    isLastPage$:Observable<boolean> = this._isLastPage.asObservable();
    isForm$:Observable<boolean> = this._isForm.asObservable();
    isModal$:Observable<boolean> = this._isModal.asObservable();

    clear(): void {
        this._isFirstPage.next(false);
        this._isLastPage.next(false);
        this._dir.next('ltr');
        this._isForm.next(false);
        this._isModal.next(false);
        this.clearImagesDict();
    }

    nextPage(): void {
        this._nextPage.next();
    }

    previousPage(): void {
        this._previousPage.next();
    }

    formAction(action:string): void {
        this._formAction.next(action);
    }

    changeHeader(newHeader:string): void {
        this._changeHeader.next(newHeader);
    }

    setPageOrder(currentPageOrder: number, numberOfPages:number): void {
        this._isFirstPage.next(currentPageOrder === 0);
        this._isLastPage.next((numberOfPages-1) === currentPageOrder);
    }

    setDir(pDir:string): void {
        this._dir.next(pDir);
    }

    formVisible(): void {
        this._isForm.next(true);
    }

    formHidden(): void {
        this._isForm.next(false);
    }

    modalVisible(): void {
        this._isModal.next(true);
    }

    modalHidden(): void {
        this._isModal.next(false);
    }

    emailSignumFormDataNeeded(): void {
        this._getEmailSignupFormData.next();
    }

    setEmailSignupFormData(data:any): void {
        this._emailSignupFormData.next(data);
    }

    clearImagesDict(): void {
        this._imageUrlsDict.next([]);
    }

    addToImagesDict(pImageName: string, pImageUrl: string): void {
        let tImages = this._imageUrlsDict.getValue();
        tImages[pImageName.toLocaleLowerCase()] = pImageUrl;
        this._imageUrlsDict.next(tImages);
    }

    getImageUrl(pImageName: string): string {
        const tImages = this._imageUrlsDict.getValue();
        if (tImages && tImages[pImageName.toLocaleLowerCase()]) {
            return tImages[pImageName.toLocaleLowerCase()];
        }
        return pImageName;      
    }

    isRestricted(deviceTypes:string[]): boolean {
        if (deviceTypes && deviceTypes.length) {
            if (deviceTypes.findIndex(t => t == "web") < 0) {
                return true;
            }
        }

        return false;
    }

    checkContentElements(pItems: KgwContentElementItem[]): KgwContentElementItem[] {
        if (!pItems || !pItems.length){
            return [];
        }
        
        let items:KgwContentElementItem[] = [];
        pItems.forEach(
            item => {
                switch (item.type) {
                    case 'paragraph':
                        let tParagraph: KgwContentComplexTypeParagraph = item.element as KgwContentComplexTypeParagraph;
                        if (tParagraph) {
                            if (!this.isRestricted(tParagraph.attributes.restrictTo)) {
                                items.push(item);
                            }
                        }
                        break;
                    case 'text':
                        let tText: KgwContentComplexTypeText = item.element as KgwContentComplexTypeText;
                        if (tText) {
                            if (!this.isRestricted(tText.attributes.restrictTo)) {
                                items.push(item);
                            }
                        }
                        break;
                    case 'image':
                        let tImage: KgwContentComplexTypeImage = item.element as KgwContentComplexTypeImage;
                        if (tImage) {
                            if (!this.isRestricted(tImage.attributes.restrictTo)) {
                                items.push(item);
                            }
                        }
                        break;
                    case 'video':
                        let tVideo: KgwContentComplexTypeVideo = item.element as KgwContentComplexTypeVideo;
                        if (tVideo) {
                            if (!this.isRestricted(tVideo.attributes.restrictTo)) {
                                items.push(item);
                            }
                        }
                        break;
                    case 'button':
                        let tButton: KgwContentComplexTypeButton = item.element as KgwContentComplexTypeButton;
                        if (tButton) {
                            if (!this.isRestricted(tButton.attributes.restrictTo)) {
                                items.push(item);
                            }
                        }
                        break;
                    default:
                        items.push(item);
                        break;
                }
            }
        );

        return items;
    }
}
