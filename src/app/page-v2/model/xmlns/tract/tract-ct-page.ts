import { KgwTractComplexTypeCallToAction } from './tract-ct-call-to-action';
import { KgwTractComplexTypeCard } from './tract-ct-card';
import { KgwTractComplexTypeModal } from './tract-ct-modal';
import { KgwTractComplexTypePageHeader } from './tract-ct-page-header';
import { KgwTractComplexTypePageHero } from './tract-ct-page-hero';

export interface KgwTractComplexTypePage {
  header?: KgwTractComplexTypePageHeader;
  hero?: KgwTractComplexTypePageHero;
  cards?: Array<KgwTractComplexTypeCard>;
  modals?: Array<KgwTractComplexTypeModal>;
  callToAction?: KgwTractComplexTypeCallToAction;
  attributes: {
    primaryColor?: string;
    primaryTextColor?: string;
    textColor?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundImageAlign?: string;
    backgroundImageScaleType?: string;
    textScale?: number;
    cardTextColor?: string;
    cardBackgroundColor?: string;
    listeners?: string;
  };
}
