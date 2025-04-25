export const getUrlResourceType = (resourceType: string): string => {
  return resourceType === 'tract' ? 'v1' : 'v2';
};
