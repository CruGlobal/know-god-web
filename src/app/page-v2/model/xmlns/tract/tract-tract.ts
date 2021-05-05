import { KgwContentComplexTypeAccordionSection } from '../content/content-ct-accordion-section';
import { KgwContentComplexTypeAnimation } from '../content/content-ct-animation';
import { KgwContentComplexTypeFallback } from '../content/content-ct-fallback';
import { KgwContentComplexTypeForm } from '../content/content-ct-form';
import { KgwContentComplexTypeImage } from '../content/content-ct-image';
import { KgwContentComplexTypeParagraph } from '../content/content-ct-paragraph';
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
    this.page = { attributes: {} };
    const parser = new DOMParser();
    const xml: any = parser.parseFromString(this._xmlString, 'application/xml');
    const tNode = xml.childNodes[0];

    if (tNode.getAttribute('primary-color')) {
      this.page.attributes.primaryColor = tNode.getAttribute('primary-color');
    }
    if (tNode.getAttribute('primary-text-color')) {
      this.page.attributes.primaryTextColor = tNode.getAttribute(
        'primary-text-color'
      );
    }
    if (tNode.getAttribute('text-color')) {
      this.page.attributes.textColor = tNode.getAttribute('text-color');
    }
    if (tNode.getAttribute('background-color')) {
      this.page.attributes.backgroundColor = tNode.getAttribute(
        'background-color'
      );
    }
    if (tNode.getAttribute('background-image')) {
      this.page.attributes.backgroundImage = tNode.getAttribute(
        'background-image'
      );
    }
    if (tNode.getAttribute('background-image-align')) {
      this.page.attributes.backgroundImageAlign = tNode.getAttribute(
        'background-image-align'
      );
    }
    if (tNode.getAttribute('background-image-scale-type')) {
      this.page.attributes.backgroundImageScaleType = tNode.getAttribute(
        'background-image-scale-type'
      );
    }
    if (tNode.getAttribute('text-scale')) {
      this.page.attributes.textScale = parseFloat(
        tNode.getAttribute('text-scale')
      );
    }
    if (tNode.getAttribute('card-text-color')) {
      this.page.attributes.cardTextColor = tNode.getAttribute(
        'card-text-color'
      );
    }
    if (tNode.getAttribute('card-background-color')) {
      this.page.attributes.cardBackgroundColor = tNode.getAttribute(
        'card-background-color'
      );
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

  public getResources(): string[] {
    const files = [];
    files['images'] = [];
    files['animations'] = [];

    if (!this.page) {
      return files;
    }

    const allElements: KgwContentElementItem[] = [];

    if (
      this.page.hero &&
      this.page.hero.content &&
      this.page.hero.content.length > 0
    ) {
      this.page.hero.content.forEach((element) => {
        if (element && element.children && element.children.length) {
          element.children.forEach((child) => {
            allElements.push(child);
          });
        }
      });
    }

    if (this.page.cards && this.page.cards.length > 0) {
      this.page.cards.forEach((card) => {
        if (card.content && card.content.length) {
          card.content.forEach((element) => {
            if (element && element.children && element.children.length) {
              element.children.forEach((child) => {
                allElements.push(child);
              });
            }
          });
        }
      });
    }

    if (this.page.modals && this.page.modals.length > 0) {
      this.page.modals.forEach((card) => {
        if (card.content && card.content.length) {
          card.content.forEach((element) => {
            if (element && element.children && element.children.length) {
              element.children.forEach((child) => {
                allElements.push(child);
              });
            }
          });
        }
      });
    }


    if (allElements.length) {
      allElements.forEach((element) => {
        const tImageResources = this.getResourcesOfContentElement(
          'image',
          element
        );
        if (tImageResources && tImageResources.length) {
          tImageResources.forEach((tResource) => {
            files['images'].push(tResource);
          });
        }
        const tAnimationResources = this.getResourcesOfContentElement(
          'animation',
          element
        );
        if (tAnimationResources && tAnimationResources.length) {
          tAnimationResources.forEach((tResource) => {
            files['animations'].push(tResource);
          });
        }
      });
    }

    return files;
  }

  private getResourcesOfContentElement(
    type: string,
    element: KgwContentElementItem
  ): string[] {
    if (type !== 'image' && type !== 'animation') {
      return [];
    }

    const files = [];

    switch (element.type) {
      case 'image':
        if (type === 'image') {
          const tImage = element.element as KgwContentComplexTypeImage;
          if (tImage && tImage.attributes && tImage.attributes.resource) {
            files.push(tImage.attributes.resource);
          }
        }
        break;
      case 'animation':
        if (type === 'animation') {
          const tAnimation = element.element as KgwContentComplexTypeAnimation;
          if (
            tAnimation &&
            tAnimation.attributes &&
            tAnimation.attributes.resource
          ) {
            files.push(tAnimation.attributes.resource);
          }
        }
        break;
      case 'paragraph':
        const tParagraph = element.element as KgwContentComplexTypeParagraph;
        if (tParagraph.children && tParagraph.children.length) {
          tParagraph.children.forEach((paragraphChild) => {
            const tParagraphChildResources = this.getResourcesOfContentElement(
              type,
              paragraphChild
            );
            if (tParagraphChildResources && tParagraphChildResources.length) {
              tParagraphChildResources.forEach((t) => {
                files.push(t);
              });
            }
          });
        }
        break;
      case 'form':
        const tForm = element.element as KgwContentComplexTypeForm;
        if (tForm.children && tForm.children.length) {
          tForm.children.forEach((formChild) => {
            const tFormChildResources = this.getResourcesOfContentElement(
              type,
              formChild
            );
            if (tFormChildResources && tFormChildResources.length) {
              tFormChildResources.forEach((t) => {
                files.push(t);
              });
            }
          });
        }
        break;
      case 'fallback':
        const tFallback = element.element as KgwContentComplexTypeFallback;
        if (tFallback.children && tFallback.children.length) {
          tFallback.children.forEach((fallbackChild) => {
            const tFallbackChildResources = this.getResourcesOfContentElement(
              type,
              fallbackChild
            );
            if (tFallbackChildResources && tFallbackChildResources.length) {
              tFallbackChildResources.forEach((t) => {
                files.push(t);
              });
            }
          });
        }
        break;
      case 'tabs':
        const tTabs = element.element as KgwContentComplexTypeTabs;
        if (tTabs.tabs && tTabs.tabs.length) {
          tTabs.tabs.forEach((tab) => {
            if (tab.children && tab.children.length) {
              tab.children.forEach((tabChild) => {
                const tTabChildResources = this.getResourcesOfContentElement(
                  type,
                  tabChild
                );
                if (tTabChildResources && tTabChildResources.length) {
                  tTabChildResources.forEach((t) => {
                    files.push(t);
                  });
                }
              });
            }
          });
        }
        break;
      case 'accordion':
        const tAccordion = element.element as KgwContentComplexTypeAccordionSection;
        if (tAccordion.children && tAccordion.children.length) {
          tAccordion.children.forEach((accordionChild) => {
            const tAccordionChildResources = this.getResourcesOfContentElement(
              type,
              accordionChild
            );
            if (tAccordionChildResources && tAccordionChildResources.length) {
              tAccordionChildResources.forEach((t) => {
                files.push(t);
              });
            }
          });
        }
        break;
    }
    return files;
  }
}
