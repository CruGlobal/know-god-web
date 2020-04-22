export class PageParserHelper {
  constructor() {}

  public static isNodeRestricted(pNode: any): boolean {
    return (
      pNode.getAttribute('restrictTo') &&
      pNode.getAttribute('restrictTo') != 'web'
    );
  }
}
