import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private _nextPage = new Subject<any>();
  private _previousPage = new Subject<any>();
  private _formAction = new Subject<string>();
  private _contentEvent = new Subject<string>();
  private _changeHeader = new Subject<string>();
  private _getEmailSignupFormData = new Subject<any>();
  private _emailSignupFormData = new Subject<any>();
  private _dir = new BehaviorSubject<string>('ltr');
  private _visibleTip = new BehaviorSubject<string>('');
  private _isFirstPage = new BehaviorSubject<boolean>(false);
  private _isLastPage = new BehaviorSubject<boolean>(false);
  private _isForm = new BehaviorSubject<boolean>(false);
  private _isModal = new BehaviorSubject<boolean>(false);
  private _imageUrlsDict = new BehaviorSubject<string[]>([]);
  private _animationUrlsDict = new BehaviorSubject<string[]>([]);
  private _allAttachmentResources = new Map<string, string>();

  formAction$: Observable<string> = this._formAction.asObservable();
  contentEvent$: Observable<string> = this._formAction.asObservable();
  changeHeader$: Observable<string> = this._changeHeader.asObservable();
  getEmailSignupFormData$: Observable<any> =
    this._getEmailSignupFormData.asObservable();
  emailSignupFormData$: Observable<any> =
    this._emailSignupFormData.asObservable();
  nextPage$: Observable<any> = this._nextPage.asObservable();
  previousPage$: Observable<any> = this._previousPage.asObservable();
  pageDir$: Observable<string> = this._dir.asObservable();
  isFirstPage$: Observable<boolean> = this._isFirstPage.asObservable();
  isLastPage$: Observable<boolean> = this._isLastPage.asObservable();
  isForm$: Observable<boolean> = this._isForm.asObservable();
  isModal$: Observable<boolean> = this._isModal.asObservable();
  visibleTipId$: Observable<string> = this._visibleTip.asObservable();

  clear(): void {
    this._isFirstPage.next(false);
    this._isLastPage.next(false);
    this._isForm.next(false);
    this._isModal.next(false);
    this.clearImagesDict();
    this.clearAnimationsDict();
  }

  addAttachment(pImageName: string, pImageUrl: string): void {
    const tImages = this._allAttachmentResources.get(pImageName);
    if (!tImages) this._allAttachmentResources.set(pImageName, pImageUrl);
  }

  findAttachment(pImageName: string): string {
    const tImages = this._allAttachmentResources.get(pImageName);
    return tImages || '';
  }

  nextPage(): void {
    this._nextPage.next();
  }

  previousPage(): void {
    this._previousPage.next();
  }

  formAction(action: string): void {
    this._formAction.next(action);
  }

  contentEvent(event: string): void {
    this._contentEvent.next(event);
  }

  changeHeader(newHeader: string): void {
    this._changeHeader.next(newHeader);
  }

  setPageOrder(currentPageOrder: number, numberOfPages: number): void {
    this._isFirstPage.next(currentPageOrder === 0);
    this._isLastPage.next(numberOfPages - 1 === currentPageOrder);
  }

  setDir(pDir: string): void {
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

  setEmailSignupFormData(data: any): void {
    this._emailSignupFormData.next(data);
  }

  showTip(id: string): void {
    this._visibleTip.next(id);
  }

  hideTip(): void {
    this._visibleTip.next('');
  }

  clearImagesDict(): void {
    this._imageUrlsDict.next([]);
  }

  addToImagesDict(pImageName: string, pImageUrl: string): void {
    const tImages = this._imageUrlsDict.getValue();
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
  getAllImages() {
    return this._imageUrlsDict.getValue();
  }

  clearAnimationsDict(): void {
    this._animationUrlsDict.next([]);
  }

  addToAnimationsDict(pFileName: string, pFileUrl: string): void {
    const tFiles = this._animationUrlsDict.getValue();
    tFiles[pFileName.toLocaleLowerCase()] = pFileUrl;
    this._animationUrlsDict.next(tFiles);
  }

  getAnimationUrl(pFileName: string): string {
    const tFiles = this._animationUrlsDict.getValue();
    if (tFiles && tFiles[pFileName.toLocaleLowerCase()]) {
      return tFiles[pFileName.toLocaleLowerCase()];
    }
    return pFileName;
  }

  isRestricted(deviceTypes: string[]): boolean {
    if (deviceTypes && deviceTypes.length) {
      if (deviceTypes.findIndex((t) => t === 'web') < 0) {
        return true;
      }
    }
    return false;
  }
}
