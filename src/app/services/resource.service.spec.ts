import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
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
        const mockBooksData = {
          data: [
            {
              id: '1',
              attributes: {
                'resource-type': 'lesson',
                'attr-hidden': false,
                abbreviation: 'lesson1'
              }
            },
            {
              id: '2',
              attributes: {
                'resource-type': 'tract',
                'attr-hidden': false,
                abbreviation: 'tract1'
              }
            },
            {
              id: '3',
              attributes: {
                'resource-type': 'lesson',
                'attr-hidden': true,
                abbreviation: 'hidden-lesson'
              }
            }
          ],
          included: [
            {
              type: 'translation',
              id: 't1',
              relationships: {
                resource: { data: { id: '1' } },
                language: { data: { id: '1' } }
              },
              attributes: {
                'translated-name': 'Lesson 1',
                'translated-tagline': 'tagline'
              }
            },
            {
              type: 'translation',
              id: 't2',
              relationships: {
                resource: { data: { id: '2' } },
                language: { data: { id: '2' } }
              },
              attributes: {
                'translated-name': 'Tract 1',
                'translated-tagline': 'tagline'
              }
            },
            {
              type: 'translation',
              id: 't3',
              relationships: {
                resource: { data: { id: '3' } },
                language: { data: { id: '3' } }
              },
              attributes: {
                'translated-name': 'Hidden Lesson',
                'translated-tagline': 'tagline'
              }
            }
          ]
        };

        const result = service['processBookData'](mockBooksData, 1);

        expect(result.tools.length).toBe(0);
        expect(result.lessons.length).toBe(1);
        expect(result.languagesWithLessons.size).toBe(1);
        expect(result.languagesWithLessons.has('1')).toBeTrue();
        expect(result.languagesWithLessons.has('2')).toBeFalse();
        expect(result.languagesWithLessons.has('3')).toBeFalse();
      }
    ));
  });
});
