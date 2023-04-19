import { KgwAnalyticsComplexTypeEvents } from '../analytics/analytics-ct-events';
import { KgwContentComplexTypeForm } from '../content/content-ct-form';
import { KgwContentComplexTypeParagraph } from '../content/content-ct-paragraph';
import { KgwContentComplexTypeTextchild } from '../content/content-ct-text-child';

export interface KgwTractComplexTypePageHero {
  heading?: KgwContentComplexTypeTextchild;
  events?: KgwAnalyticsComplexTypeEvents;
  content?: Array<KgwContentComplexTypeParagraph | KgwContentComplexTypeForm>;
}
