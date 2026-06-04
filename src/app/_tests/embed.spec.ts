describe('embed.js', () => {
  let knowGodEmbed: HTMLDivElement;
  let embedScriptSource: string;
  let messageHandlers: EventListener[];

  const runEmbedScript = () => {
    const script = document.createElement('script');
    script.text = embedScriptSource.replace(
      '{appDomain}',
      'https://knowgod.com'
    );
    document.head.appendChild(script);

    if (typeof window.onload === 'function') {
      window.onload(new Event('load'));
    }

    script.remove();
  };

  beforeAll(async () => {
    embedScriptSource = await fetch('/embed/embed.js').then((r) => r.text());
  });

  beforeEach(() => {
    knowGodEmbed = document.createElement('div');
    knowGodEmbed.id = 'knowGodEmbed';
    knowGodEmbed.setAttribute('data-book', 'kgp-us');
    knowGodEmbed.setAttribute('data-lang', 'en');
    document.body.appendChild(knowGodEmbed);

    messageHandlers = [];
    const nativeAddEventListener = window.addEventListener.bind(window);
    spyOn(window, 'addEventListener').and.callFake(
      (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ) => {
        if (type === 'message' && typeof listener === 'function') {
          messageHandlers.push(listener);
        }

        nativeAddEventListener(type, listener, options);
      }
    );
  });

  afterEach(() => {
    for (const handler of messageHandlers) {
      window.removeEventListener('message', handler);
    }

    window.onload = null;
    knowGodEmbed.remove();
  });

  it('creates iframe with ministry when data-ministry is present', () => {
    knowGodEmbed.setAttribute('data-ministry', 'campus-crusade');

    runEmbedScript();

    const iframe = knowGodEmbed.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toBe(
      'https://knowgod.com/#/en/kgp-us?embedded=true&ministry=campus-crusade'
    );
  });

  it('omits ministry query param when data-ministry is missing', () => {
    runEmbedScript();

    const iframe = knowGodEmbed.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBe(
      'https://knowgod.com/#/en/kgp-us?embedded=true'
    );
  });

  it('URL-encodes ministry value from embed element attribute', () => {
    knowGodEmbed.setAttribute(
      'data-ministry',
      'ministry with spaces & symbols'
    );

    runEmbedScript();

    const iframe = knowGodEmbed.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBe(
      'https://knowgod.com/#/en/kgp-us?embedded=true&ministry=ministry%20with%20spaces%20%26%20symbols'
    );
  });

  it('updates iframe height when message payload is numeric', () => {
    runEmbedScript();

    const iframe = knowGodEmbed.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe).not.toBeNull();

    window.dispatchEvent(new MessageEvent('message', { data: 520 }));
    expect(iframe.style.height).toBe('520px');
  });

  it('does not initialize when knowGodEmbed element is missing', () => {
    knowGodEmbed.remove();
    const logSpy = spyOn(console, 'log');

    runEmbedScript();

    expect(logSpy).toHaveBeenCalledWith('Know God element not found.');
  });
});
