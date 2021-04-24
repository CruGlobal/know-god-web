import { KgwAnalyticsComplexTypeEvents } from '../analytics/analytics-ct-events';
import { KgwContentComplexTypeText } from './content-ct-text';
import { KgwContentElementItem } from './content-element';

export interface KgwContentComplexTypeTab {
    label?: KgwContentComplexTypeText;
    events?: KgwAnalyticsComplexTypeEvents;
    children: Array<KgwContentElementItem>;
    attributes: {
        listeners?: string;
    };
}
