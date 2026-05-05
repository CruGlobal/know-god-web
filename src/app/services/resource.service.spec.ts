import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { mockBooksData } from '../_tests/mocks';
import { ResourceService } from './resource.service';

describe('ResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResourceService],
      imports: [HttpClientModule]
    });
  });

  it('should be created', inject(
    [ResourceService],
    (service: ResourceService) => {
      expect(service).toBeTruthy();
    }
  ));

  describe('processBookData', () => {
    it('should process book data correctly and exclude hidden lessons from languagesWithLessons', inject(
      [ResourceService],
      (service: ResourceService) => {
        const result = service['processBookData'](mockBooksData, 1);

        expect(result.tools.length).toBe(0);
        expect(result.lessons.length).toBe(1);
        expect(result.languagesWithLessons).toHaveSize(1);
        expect(result.languagesWithLessons.has('1')).toBeTrue();
        expect(result.languagesWithLessons.has('2')).toBeFalse();
        expect(result.languagesWithLessons.has('3')).toBeFalse();
      }
    ));
  });
});
