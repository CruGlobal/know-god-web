import { KgwContentElementItem } from './content-element';

export interface KgwContentComplexTypeForm {
  contentType: string;
  children: Array<KgwContentElementItem>;
}
