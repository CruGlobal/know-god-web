import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsService],
      imports: [RouterTestingModule],
    });
  });

  it('should be created', inject(
    [AnalyticsService],
    (service: AnalyticsService) => {
      expect(service).toBeTruthy();
    },
  ));
});
