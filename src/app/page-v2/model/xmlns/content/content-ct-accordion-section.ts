import { KgwContentComplexTypeText } from './content-ct-text';
import { KgwContentElementItem } from './content-element';

export interface KgwContentComplexTypeAccordionSection {
    header?: KgwContentComplexTypeText;
    children: Array<KgwContentElementItem>;
}
