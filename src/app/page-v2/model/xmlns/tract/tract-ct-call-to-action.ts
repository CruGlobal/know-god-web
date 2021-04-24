import { KgwContentComplexTypeText } from '../content/content-ct-text';

export interface KgwTractComplexTypeCallToAction {
    text?: KgwContentComplexTypeText;
    attributes?: {
        events?: any;
        controlColor?: string;
        tip?: string;
    };
}
