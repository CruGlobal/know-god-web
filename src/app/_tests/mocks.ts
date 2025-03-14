import { org } from '@cruglobal/godtools-shared';
import {
  Animation,
  Button,
  CallToAction,
  Card,
  Content,
  EventId,
  Flow,
  FlowItem,
  Image,
  Input,
  Link,
  Modal,
  Multiselect,
  MultiselectOption,
  Paragraph,
  Resource,
  Spacer,
  Text,
  TractPageCard,
  Video
} from 'src/app/services/xml-parser-service/xmp-parser.service';

export const paragraph =
  org.cru.godtools.shared.tool.parser.model.Paragraph.createTestParagraph(null);
export const text =
  org.cru.godtools.shared.tool.parser.model.Text.createTestText(
    null,
    'text text'
  );
export const image =
  org.cru.godtools.shared.tool.parser.model.Image.createTestImage(
    null,
    'https://cru.org/image.png'
  );
export const content = [text, paragraph, text, image];

const standardTypeValues = () => {
  return {
    isInvisible: null,
    isInvisibleFlow: null,
    isGone: null,
    isGoneFlow: null,
    watchIsGone: null,
    watchIsInvisible: null,
    watchVisibility: null,
    invisibleIf: null,
    goneIf: null,
    tips: null,
    __doNotUseOrImplementIt: null,
    _events: null,
    _getAnalyticsEvents: null,
    getAnalyticsEvents: null,
    equals: () => null,
    hashCode: () => null
  };
};

const createText = (text: string): Text => {
  return org.cru.godtools.shared.tool.parser.model.Text.createTestText(
    null,
    text
  );
};

export const createEventId = (name: string, namespace?: string): EventId => {
  return {
    namespace,
    name,
    resolve: () => null,
    equals: () => null,
    hashCode: () => null,
    toString: () => null
  };
};

const createResource = (name: string, localName: string): Resource => {
  return {
    localName,
    name,
    equals: () => null,
    hashCode: () => null
  };
};

const createButton = (text: string, url: string, event: string): Button => {
  return {
    url: url || null,
    style: {
      name: 'CONTAINED',
      ordinal: 1
    },
    gravity: {
      name: 'CENTER',
      ordinal: 1
    },
    width: '',
    buttonColor: '',
    backgroundColor: '',
    icon: createResource('', ''),
    iconGravity: {
      name: 'CENTER',
      ordinal: 1
    },
    iconSize: 1,
    text: createText('Button Text'),
    events: event ? [createEventId(event)] : [],
    isClickable: true,
    ...standardTypeValues()
  };
};

export const mockCallToAction = (text: string): CallToAction => {
  return {
    label: createText(text) || null,
    tip: () => null
  };
};

export const mockButton = (
  text: string,
  url: string,
  event: string
): Button => {
  return createButton(text, url, event);
};

export const mockImage = (name: string, url: string): Image => {
  return {
    url,
    resource: createResource(name, url),
    gravity: null,
    width: null,
    isClickable: null,
    events: null,
    ...standardTypeValues()
  };
};

// TODO
// Once we get resource returning correctly, remove e31_1.
export const mockAnimation = (
  name: string,
  url: string,
  event: string
): Animation | any => {
  return {
    url,
    e31_1: name,
    resource: createResource(name, url),
    loop: true,
    autoPlay: true,
    playListeners: [createEventId(`${event}-play-listener`)],
    stopListeners: [createEventId(`${event}-stop-listener`)],
    isClickable: true,
    events: [createEventId(event)],
    _events: null,
    _playListeners: null,
    _stopListeners: null,
    ...standardTypeValues()
  };
};

export const mockInput = (
  name: string,
  value: string,
  label: string,
  placeholder: string
): Input => {
  return {
    type: {
      name: 'TEXT',
      ordinal: 0
    },
    name: name,
    value: value,
    isRequired: true,
    label: createText(label),
    placeholder: createText(placeholder),
    validateValue: null,
    ...standardTypeValues()
  };
};

export const mockLink = (
  url: string,
  text: string,
  isClickable: boolean
): Link => {
  return {
    url,
    text: createText(text),
    isClickable,
    events: [
      createEventId('followup-testing-event'),
      createEventId('send', 'followup')
    ],
    ...standardTypeValues()
  };
};

export const mockParagraph = (): Paragraph => {
  return {
    content: [
      mockButton('buttonText', 'buttonUrl', 'buttonEvent'),
      {
        content: [createText('text')],
        _content: null,
        ...standardTypeValues()
      } as Paragraph,
      mockInput('inputName', 'inputValue', 'inputLabel', 'inputPlaceholder')
    ],
    _content: null,
    ...standardTypeValues()
  };
};

export const mockContent = (): Content[] => {
  return [
    mockParagraph(),
    mockButton('buttonText', 'buttonUrl', 'buttonEvent')
  ];
};

export const mockText = (text: string): Text => {
  return createText(text);
};

export const mockVideo = (videoId): Video => {
  return {
    provider: {
      name: 'YOUTUBE',
      ordinal: 0
    },
    videoId,
    aspectRatio: null,
    gravity: null,
    width: null,
    ...standardTypeValues()
  };
};

export const mockTractCard = (
  label: string,
  position: number,
  listeners,
  isHidden: boolean
): TractPageCard => {
  return {
    page: null,
    id: null,
    position,
    visiblePosition: null,
    isLastVisibleCard: null,
    isHidden,
    _listeners: null,
    _dismissListeners: null,
    backgroundImage: null,
    label: createText(label),
    dismissListeners: [createEventId(`${listeners}-dismiss`)],
    listeners: [createEventId(listeners)],
    content: mockContent(),
    _content: null,
    ...standardTypeValues()
  };
};

export const mockModal = (title: string, listeners): Modal => {
  return {
    title: createText(title),
    content: content,
    page: null,
    id: null,
    _content: null,
    _dismissListeners: null,
    _listeners: null,
    dismissListeners: [createEventId(`${listeners}-dismiss`)],
    listeners: [createEventId(listeners)],
    ...standardTypeValues()
  };
};

export const mockMultiselectOption = (
  initialSelectedValue
): MultiselectOption => {
  let selectedValue = initialSelectedValue;
  return {
    style: {
      name: 'CARD',
      ordinal: 0
    },
    backgroundColor: '#000000',
    selectedColor: '#ffffff',
    multiselect: null,
    content: [],
    _content: null,
    isSelected: () => selectedValue,
    isSelectedFlow: null,
    watchIsSelected: () => null,
    toggleSelected: () => {
      selectedValue = !selectedValue;
      return selectedValue;
    },
    ...standardTypeValues()
  };
};

export const mockMultiselect = (): Multiselect => {
  return {
    columns: 4,
    options: [mockMultiselectOption(false), mockMultiselectOption(true)],
    _options: null,
    ...standardTypeValues()
  };
};

export const mockFlowItem = (initialSelectedValue): FlowItem => {
  return {
    flow: null,
    _content: null,
    content: [mockImage('filename', 'url_to_path')],
    ...standardTypeValues(),
    isGone: () => initialSelectedValue,
    watchIsGone: () => null
  };
};

export const mockFlow = (): Flow => {
  return {
    items: [
      mockFlowItem(false),
      mockFlowItem(false),
      mockFlowItem(true),
      mockFlowItem(true),
      mockFlowItem(false)
    ],
    _items: null,
    ...standardTypeValues()
  };
};

export const mockCard = (isClickable): Card => {
  return {
    backgroundColor: '#000000',
    _content: null,
    url: 'URL',
    content: mockContent(),
    isClickable,
    events: isClickable
      ? [createEventId('event-1', 'namespace'), createEventId('event-2')]
      : [],
    ...standardTypeValues()
  };
};

export const mockHeader = (
  number: string,
  text: string
): org.cru.godtools.shared.tool.parser.model.tract.Header => {
  return {
    number: createText(number),
    title: createText(text),
    tip: null
  };
};

export const mockHero = (
  heading: string
): org.cru.godtools.shared.tool.parser.model.tract.Hero => {
  return {
    heading: createText(heading),
    content,
    getAnalyticsEvents: null,
    _content: null,
    _getAnalyticsEvents: null,
    ...standardTypeValues()
  };
};

export const mockTractPage = (
  isLastPage: boolean,
  headerNumber: string,
  headerText: string,
  heroHeading: string,
  callToActionText: string,
  cardLabel: string,
  modalTitle: string,
  position: number,
  listeners: EventId[] = [],
  dismissListeners: EventId[] = []
): org.cru.godtools.shared.tool.parser.model.tract.TractPage => {
  return {
    isLastPage,
    header: mockHeader(headerNumber, headerText),
    hero: mockHero(heroHeading),
    callToAction: mockCallToAction(callToActionText),
    cardTextColor: '#000000',
    cards: cardLabel
      ? [
          mockTractCard(`${cardLabel}-0`, 0, `${cardLabel}-0`, false),
          mockTractCard(`${cardLabel}-1`, 1, `${cardLabel}-1`, true),
          mockTractCard(`${cardLabel}-2`, 2, `${cardLabel}-2`, true)
        ]
      : [],
    modals: [mockModal(modalTitle, `${modalTitle}-0`)],
    id: '1',
    position,
    parentPage: null,
    parentPageParams: null,
    nextPage: null,
    previousPage: null,
    isHidden: false,
    _modals: null,
    findModal: null,
    _cards: null,
    visibleCards: null,
    backgroundImage: null,
    getAnalyticsEvents: null,
    _dismissListeners: null,
    _listeners: null,
    dismissListeners: dismissListeners,
    listeners: listeners,
    ...standardTypeValues()
  };
};

export const mockPageComponent = {
  books: [
    {
      id: '1',
      attributes: {
        abbreviation: 'fourlaws'
      }
    },
    {
      attributes: {
        abbreviation: 'connectingwithgod'
      }
    }
  ],
  pageBookIndex: {
    data: {},
    included: [
      {
        type: 'resource'
      },
      {
        type: 'attachment',
        attributes: {
          file: 'https://cru.org/assets/file-name-1.png',
          'file-file-name': 'file-name-1.png'
        },
        relationships: {
          translations: {
            data: []
          }
        }
      },
      {
        type: 'attachment',
        attributes: {
          file: 'https://cru.org/assets/file-name-2.png',
          'file-file-name': 'file-name-2.png'
        }
      }
    ]
  },
  pageBookTranslations: [
    {
      type: 'language',
      attributes: {
        code: 'de',
        direction: 'ltr',
        name: 'German'
      },
      relationships: {
        language: {
          data: {
            id: '1111'
          }
        }
      },
      id: '1'
    },
    {
      type: 'language',
      attributes: {
        code: 'en',
        direction: 'ltr',
        name: 'English'
      },
      relationships: {
        language: {
          data: {
            id: '2222'
          }
        }
      },
      id: '4'
    }
  ],
  languageGerman: {
    id: '1111',
    type: 'translation',
    relationships: {
      translations: {
        data: [
          {
            id: '1',
            type: 'language'
          }
        ]
      }
    },
    attributes: {
      code: 'de',
      direction: 'ltr',
      name: 'German'
    }
  },
  languageEnglish: {
    id: '2222',
    type: 'translation',
    relationships: {
      translations: {
        data: [
          {
            id: '2',
            type: 'language'
          }
        ]
      }
    },
    attributes: {
      code: 'en',
      direction: 'ltr',
      name: 'English'
    }
  }
};

export const mockSpacer = (height = 100): Spacer => {
  return {
    height,
    mode: {
      name: 'FIXED',
      ordinal: 0
    },
    ...standardTypeValues()
  };
};
