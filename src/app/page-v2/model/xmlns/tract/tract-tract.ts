
import { KgwContentComplexTypeImage } from '../content/content-ct-image';
import { KgwContentComplexTypeTabs } from '../content/content-ct-tabs';
import { KgwContentElementItem } from '../content/content-element';
import { KgwTractCallToAction } from './tract-call-to-action';
import { KgwTractCard } from './tract-card';
import { KgwTractComplexTypePage } from './tract-ct-page';
import { KgwTractModal } from './tract-modal';
import { KgwTractPageHeader } from './tract-page-header';
import { KgwTractPageHero } from './tract-page-hero';

export class KgwTract {
    private _xmlString: string;
    page: KgwTractComplexTypePage;
    pagename?: string;
    pageorder?: number;

    constructor(xmlstring: string) {
      this._xmlString = xmlstring;
    }

    public parseXml(): void {
      this.page = {attributes: {}};
      const parser = new DOMParser();
      const xml: any = parser.parseFromString(this._xmlString, 'application/xml');
      const tNode = xml.childNodes[0];

      if (tNode.getAttribute('primary-color')) {
        this.page.attributes.primaryColor = tNode.getAttribute('primary-color');
      }
      if (tNode.getAttribute('primary-text-color')) {
        this.page.attributes.primaryTextColor = tNode.getAttribute('primary-text-color');
      }
      if (tNode.getAttribute('text-color')) {
        this.page.attributes.textColor = tNode.getAttribute('text-color');
      }
      if (tNode.getAttribute('background-color')) {
        this.page.attributes.backgroundColor = tNode.getAttribute('background-color');
      }
      if (tNode.getAttribute('background-image')) {
        this.page.attributes.backgroundImage = tNode.getAttribute('background-image');
      }
      if (tNode.getAttribute('background-image-align')) {
        this.page.attributes.backgroundImageAlign = tNode.getAttribute('background-image-align');
      }
      if (tNode.getAttribute('background-image-scale-type')) {
        this.page.attributes.backgroundImageScaleType = tNode.getAttribute('background-image-scale-type');
      }
      if (tNode.getAttribute('text-scale')) {
        this.page.attributes.textScale = parseFloat(tNode.getAttribute('text-scale'));
      }
      if (tNode.getAttribute('card-text-color')) {
        this.page.attributes.cardTextColor = tNode.getAttribute('card-text-color');
      }
      if (tNode.getAttribute('card-background-color')) {
        this.page.attributes.cardBackgroundColor = tNode.getAttribute('card-background-color');
      }
      if (tNode.getAttribute('listeners')) {
        this.page.attributes.listeners = tNode.getAttribute('listeners');
      }

      for (let i = 0; i < tNode.childNodes.length; i++) {
        const cNode = tNode.childNodes[i];
        if (cNode.nodeName === 'header') {
          const t: KgwTractPageHeader = new KgwTractPageHeader(cNode);
          this.page.header = t.parse();
        } else if (cNode.nodeName === 'hero') {
          const t: KgwTractPageHero = new KgwTractPageHero(cNode);
          this.page.hero = t.parse();
        } else if (cNode.nodeName === 'cards') {
          this.page.cards = [];
          if (cNode.childNodes && cNode.childNodes.length) {
            for (let j = 0; j < cNode.childNodes.length; j++) {
              const ccNode = cNode.childNodes[j];
              if (ccNode.nodeName === 'card') {
                const t: KgwTractCard = new KgwTractCard(ccNode);
                this.page.cards.push(t.parse());
              }
            }
          }
        } else if (cNode.nodeName === 'modals') {
          this.page.modals = [];
          if (cNode.childNodes && cNode.childNodes.length) {
            for (let j = 0; j < cNode.childNodes.length; j++) {
              const ccNode = cNode.childNodes[j];
              if (ccNode.nodeName === 'modal') {
                const t: KgwTractModal = new KgwTractModal(ccNode);
                this.page.modals.push(t.parse());
              }
            }
          }
        } else if (cNode.nodeName === 'call-to-action') {
          const t: KgwTractCallToAction = new KgwTractCallToAction(cNode);
          this.page.callToAction = t.parse();
        }
      }
    }

    public getImageResources(): string[] {
      if (!this.page) {
        return [];
      }

      const images = [] as string[];

      if (this.page.hero && this.page.hero.content && this.page.hero.content.length > 0) {
        this.page.hero.content.forEach(
          element => {
            if (element && element.children && element.children.length) {
              element.children.forEach(
                child => {
                  const tItem: KgwContentElementItem = child as KgwContentElementItem;
                  if (tItem && tItem.type && tItem.type === 'image' && tItem.element) {
                    const tImage = tItem.element as KgwContentComplexTypeImage;
                    if (tImage && tImage.attributes && tImage.attributes.resource) {
                      images.push(tImage.attributes.resource);
                    }
                  }
                }
              );
            }
          }
        );
      }

      if (this.page.cards && this.page.cards.length > 0) {
        this.page.cards.forEach(
          card => {
            if (card && card.content && card.content.length > 0) {
              card.content.forEach(
                element => {
                  if (element && element.children && element.children.length) {
                    element.children.forEach(
                      child => {
                        const tItem: KgwContentElementItem = child as KgwContentElementItem;
                        if (tItem && tItem.type && tItem.type === 'image' && tItem.element) {
                          const tImage = tItem.element as KgwContentComplexTypeImage;
                          if (tImage && tImage.attributes && tImage.attributes.resource) {
                            images.push(tImage.attributes.resource);
                          }
                        } else if (tItem && tItem.type && tItem.type === 'tabs' && tItem.element) {
                          const tTab = tItem.element as KgwContentComplexTypeTabs;
                          if (tTab && tTab.tabs && tTab.tabs.length) {
                            tTab.tabs.forEach(
                              tab => {
                                if (tab && tab.children && tab.children.length) {
                                  tab.children.forEach(
                                    tabChild => {
                                      const tbItem: KgwContentElementItem = tabChild as KgwContentElementItem;
                                      if (tbItem && tbItem.type && tbItem.type === 'image' && tbItem.element) {
                                        const tImage = tbItem.element as KgwContentComplexTypeImage;
                                        if (tImage && tImage.attributes && tImage.attributes.resource) {
                                          images.push(tImage.attributes.resource);
                                        }
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }

      if (this.page.modals && this.page.modals.length > 0) {
        this.page.modals.forEach(
          modal => {
            if (modal && modal.content && modal.content.length > 0) {
              modal.content.forEach(
                element => {
                  if (element && element.children && element.children.length) {
                    element.children.forEach(
                      child => {
                        const tItem: KgwContentElementItem = child as KgwContentElementItem;
                        if (tItem && tItem.type && tItem.type === 'image' && tItem.element) {
                          const tImage = tItem.element as KgwContentComplexTypeImage;
                          if (tImage && tImage.attributes && tImage.attributes.resource) {
                            images.push(tImage.attributes.resource);
                          }
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }

      return images;
    }
}
