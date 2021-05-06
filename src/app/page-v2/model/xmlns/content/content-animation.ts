import { KgwContentComplexTypeAnimation } from './content-ct-animation';

export class KgwContentAnimation {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwContentComplexTypeAnimation {
    const item: KgwContentComplexTypeAnimation = { attributes: {} };

    if (this._xmlNode.getAttribute('resource')) {
      item.attributes.resource = this._xmlNode.getAttribute('resource');
    }
    item.attributes.autoplay = true;
    if (this._xmlNode.getAttribute('autoplay')) {
      item.attributes.autoplay =
        this._xmlNode.getAttribute('autoplay') === 'true';
    }
    item.attributes.loop = true;
    if (this._xmlNode.getAttribute('loop')) {
      item.attributes.loop = this._xmlNode.getAttribute('loop') === 'true';
    }
    if (this._xmlNode.getAttribute('events')) {
      item.attributes.events = this._xmlNode.getAttribute('events');
    }
    if (this._xmlNode.getAttribute('play-listeners')) {
      item.attributes.playListeners = this._xmlNode.getAttribute(
        'play-listeners'
      );
    }
    if (this._xmlNode.getAttribute('stop-listeners')) {
      item.attributes.stopListeners = this._xmlNode.getAttribute(
        'stop-listeners'
      );
    }

    return item;
  }
}
