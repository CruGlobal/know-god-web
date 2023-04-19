import { KgwAnalyticsComplexTypeEvents } from '../analytics/analytics-ct-events';
import { KgwContentComplexTypeForm } from '../content/content-ct-form';
import { KgwContentComplexTypeParagraph } from '../content/content-ct-paragraph';
import { KgwContentComplexTypeTextchild } from '../content/content-ct-text-child';

export interface KgwTractComplexTypeCard {
  label?: KgwContentComplexTypeTextchild;
  events?: Array<KgwAnalyticsComplexTypeEvents>;
  content?: Array<KgwContentComplexTypeParagraph | KgwContentComplexTypeForm>;
  attributes: {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundImageAlign?: string;
    backgroundImageScaleType?: string;
    textColor?: string;
    hidden?: boolean;
    listeners?: string;
    dismissListeners?: string;
  };
}
