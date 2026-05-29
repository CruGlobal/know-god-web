import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsService],
      imports: [RouterTestingModule]
    });
  });

  afterEach(() => {
    delete window.isEmbedded;
    delete window.embeddingMinistry;
    delete window.embeddingReferrer;
  });

  it('should be created', inject(
    [AnalyticsService],
    (service: AnalyticsService) => {
      expect(service).toBeTruthy();
    }
  ));

  describe('setDigitalData', () => {
    it('should include ministry when embeddingMinistry is set', inject(
      [AnalyticsService],
      (service: AnalyticsService) => {
        window.isEmbedded = true;
        window.embeddingMinistry = 'campus-crusade';
        window.embeddingReferrer = 'https://example.org';

        service.setDigitalData('kgp', 'en', '1');

        expect(window.digitalData.page.pageInfo.ministry).toBe(
          'campus-crusade'
        );
        expect(window.digitalData.page.pageInfo.embeddingReferrer).toBe(
          'https://example.org'
        );
        expect(window.digitalData.page.pageInfo.embedded).toBe('embed');
      }
    ));

    it('should set ministry to empty string when embeddingMinistry is not set', inject(
      [AnalyticsService],
      (service: AnalyticsService) => {
        service.setDigitalData('kgp', 'en', '1');

        expect(window.digitalData.page.pageInfo.ministry).toBe('');
        expect(window.digitalData.page.pageInfo.embeddingReferrer).toBe('');
      }
    ));

    it('should set ministry to empty string when embeddingMinistry is empty', inject(
      [AnalyticsService],
      (service: AnalyticsService) => {
        window.isEmbedded = true;
        window.embeddingMinistry = '';
        window.embeddingReferrer = '';

        service.setDigitalData('kgp', 'en', '1');

        expect(window.digitalData.page.pageInfo.ministry).toBe('');
        expect(window.digitalData.page.pageInfo.embeddingReferrer).toBe('');
        expect(window.digitalData.page.pageInfo.embedded).toBe('embed');
      }
    ));

    it('should set embedded to empty string when not embedded', inject(
      [AnalyticsService],
      (service: AnalyticsService) => {
        service.setDigitalData('kgp', 'en', '1');

        expect(window.digitalData.page.pageInfo.embedded).toBe('');
      }
    ));
  });
});
