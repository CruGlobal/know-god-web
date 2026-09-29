import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

const SITE_NAME = 'Know God';

// Sets the browser tab title. Link preview crawlers do not run JavaScript, so
// this does not change previews. Those come from the static tags in index.html.
@Injectable({
  providedIn: 'root'
})
export class DocumentTitleService {
  constructor(readonly title: Title) {}

  setToolTitle(toolName: string): void {
    this.title.setTitle(toolName ? `${toolName} | ${SITE_NAME}` : SITE_NAME);
  }

  resetTitle(): void {
    this.title.setTitle(SITE_NAME);
  }
}
