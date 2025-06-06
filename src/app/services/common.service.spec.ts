import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { CommonService } from './common.service';

describe('CommonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommonService],
      imports: [HttpClientModule]
    });
  });

  it('should be created', inject([CommonService], (service: CommonService) => {
    expect(service).toBeTruthy();
  }));
});
