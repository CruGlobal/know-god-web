import { KgwContentComplexTypeVideo } from './content-ct-video';

export class KgwContentVideo {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwContentComplexTypeVideo {
    const item: KgwContentComplexTypeVideo = { attributes: {} };

    if (this._xmlNode.getAttribute('restrictTo')) {
      const tValue = this._xmlNode.getAttribute('restrictTo') as string;
      if (tValue && tValue.trim().length > 0) {
        item.attributes.restrictTo = tValue.trim().split(' ');
      }
    }
    if (this._xmlNode.getAttribute('version')) {
      item.attributes.version = parseInt(
        this._xmlNode.getAttribute('version'),
        10,
      );
    }
    if (this._xmlNode.getAttribute('provider')) {
      item.attributes.provider = this._xmlNode.getAttribute('provider');
    }
    if (this._xmlNode.getAttribute('video-id')) {
      item.attributes.videoId = this._xmlNode.getAttribute('video-id');
    }

    return item;
  }
}
