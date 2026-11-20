import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ManifestParser,
  ParserConfig,
  PullParserFactory,
  godToolsParser
} from './xml-parser.service';

const origin = 'https://example.com/files/';
const manifestUrl = `${origin}manifest.xml`;
const serverError = { status: 500, statusText: 'Server Error' };

describe('PullParserFactory', () => {
  let factory: PullParserFactory;
  let httpMock: HttpTestingController;

  // The parser requests files asynchronously, so wait for the request to show up.
  const waitForRequest = async (url: string) => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const [request] = httpMock.match(url);
      if (request) {
        return request;
      }
      await new Promise((resolve) => setTimeout(resolve));
    }
    throw new Error(`No request made to ${url}`);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    factory = TestBed.inject(PullParserFactory);
    httpMock = TestBed.inject(HttpTestingController);
    factory.setOrigin(origin);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('readFile() should resolve with the decoded file text', async () => {
    const result = factory.readFile('manifest.xml');

    httpMock
      .expectOne(manifestUrl)
      .flush(new TextEncoder().encode('<manifest />').buffer);

    await expectAsync(result).toBeResolvedTo('<manifest />');
  });

  it('readFile() should reject when the request fails', async () => {
    const result = factory.readFile('manifest.xml');

    httpMock.expectOne(manifestUrl).flush(null, serverError);

    await expectAsync(result).toBeRejected();
  });

  it('parseManifest() should finish with a ParserError when the manifest request fails', async () => {
    const parser = new ManifestParser(
      factory,
      ParserConfig.createParserConfig()
    );
    const result = parser.parseManifest(
      'manifest.xml',
      new AbortController().signal
    );

    (await waitForRequest(manifestUrl)).flush(null, serverError);

    expect(await result).toBeInstanceOf(
      godToolsParser.ParserResult.ParserError
    );
  });
});
