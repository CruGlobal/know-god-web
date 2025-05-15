import { ResourceType } from '../services/xml-parser-service/xml-parser.service';

export const getUrlResourceType = (resourceType: ResourceType): string => {
  return resourceType === ResourceType.Tract ? 'v1' : 'v2';
};
