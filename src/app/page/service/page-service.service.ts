import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { State } from '../../services/xml-parser-service/xml-parser.service';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private _nextPage = new Subject<void>();
  private _previousPage = new Subject<void>();
  private _navigateToPage = new Subject<string | number>();
  private _formAction = new Subject<string>();
  private _contentEvent = new Subject<string>();
  private _changeHeader = new Subject<string>();
  private _getEmailSignupFormData = new Subject<void>();
  private _emailSignupFormData = new Subject<void>();
  private _dir = new BehaviorSubject<string>('ltr');
  private _visibleTip = new BehaviorSubject<string>('');
  private _isFirstPage = new BehaviorSubject<boolean>(false);
  private _isLastPage = new BehaviorSubject<boolean>(false);
  private _isForm = new BehaviorSubject<boolean>(false);
  private _isModal = new BehaviorSubject<boolean>(false);
  private _imageUrlsDict = new BehaviorSubject<string[]>([]);
  private _animationUrlsDict = new BehaviorSubject<string[]>([]);
  private _allAttachmentResources = new Map<string, string>();
  private _navigationStack = new BehaviorSubject<string[]>([]);
  private XmlParserState = State.createState();

  formAction$: Observable<string> = this._formAction.asObservable();
  contentEvent$: Observable<string> = this._contentEvent.asObservable();
  changeHeader$: Observable<string> = this._changeHeader.asObservable();
  getEmailSignupFormData$: Observable<any> =
    this._getEmailSignupFormData.asObservable();
  emailSignupFormData$: Observable<any> =
    this._emailSignupFormData.asObservable();
  nextPage$: Observable<any> = this._nextPage.asObservable();
  previousPage$: Observable<any> = this._previousPage.asObservable();
  navigateToPage$: Observable<string | number> =
    this._navigateToPage.asObservable();
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

  navigateToPage(pagePosition: string | number): void {
    this._navigateToPage.next(pagePosition);
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

  setPageNavigationState(hasPreviousPage: boolean, hasNextPage: boolean): void {
    this._isFirstPage.next(!hasPreviousPage);
    this._isLastPage.next(!hasNextPage);
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

  parserState(): any {
    return this.XmlParserState;
  }

  // CYOA Navigation Stack/Array
  // We need to keep track of the navigation stack to ensure the user can navigate back to previous pages.
  // This is since CYOA can jump from page position 0 to 14 to 5.

  // getNavigationStack - Get the current navigation stack
  // addToNavigationStack - Add a page to the end of the navigation stack
  // removeFromNavigationStack - Remove a page and any page until that page from the navigation stack. If the page is not provided, remove the last page.
  // clearNavigationStack - Clears the navigation stack
  // ensureParentPageIsInNavigationStack - Ensure the parent page is in the navigation stack
  // ensurePageIsLatestInNavigationStack - Ensure the page is the last item in the navigation stack

  getNavigationStack(): Observable<string[]> {
    return this._navigationStack.asObservable();
  }

  addToNavigationStack(pagePosition: string): void {
    const currentStack = this._navigationStack.getValue();
    if (currentStack.includes(pagePosition)) {
      return;
    }
    this._navigationStack.next([...currentStack, pagePosition]);
  }

  removeFromNavigationStack(pagePosition?: string): void {
    const currentStack = this._navigationStack.getValue();
    // if empty, we need to get the original page.
    if (!pagePosition) {
      this._navigationStack.next(currentStack.slice(0, -1));
    } else {
      // We want to remove all pages that are after the pagePosition and the pagePosition itself.
      // We need to reverse the stack to remove the pages in the correct order.
      // For example, if the stack is [1, 2, 3, 4, 5] and the pagePosition is 3, we want to remove 4 and 5 as well.
      // So we reverse the stack to [5, 4, 3, 2, 1] and remove all pages from currentStack variable.
      // Which results in the stack being: 1, 2, 3
      const reverseStack = currentStack.slice().reverse();
      for (let i = reverseStack.length - 1; i >= 0; i--) {
        if (reverseStack[i] === pagePosition) {
          if (currentStack.includes(pagePosition)) {
            currentStack.pop();
          }
          break;
        }
        currentStack.pop();
      }
      this._navigationStack.next(currentStack);
    }
  }

  clearNavigationStack(): void {
    this._navigationStack.next([]);
  }

  ensureParentPageIsInNavigationStack(parentPagePosition?: string): void {
    if (!parentPagePosition) {
      return;
    }
    const currentStack = this._navigationStack.getValue();
    if (currentStack.includes(parentPagePosition)) {
      return;
    } else {
      // If not in stack, add it
      this._navigationStack.next([parentPagePosition, ...currentStack]);
    }
  }

  ensurePageIsLatestInNavigationStack(pagePosition: string): void {
    const currentStack = this._navigationStack.getValue();
    const isLatest = currentStack[currentStack.length - 1] === pagePosition;

    if (isLatest) {
      // If already latest, do nothing
      return;
    }

    if (currentStack.includes(pagePosition)) {
      // If in stack, remove all pages after it and it. And re-add it
      this.removeFromNavigationStack(pagePosition);
      this.addToNavigationStack(pagePosition);
      return;
    } else {
      // If not in stack, add it
      this.addToNavigationStack(pagePosition);
    }
  }
}
