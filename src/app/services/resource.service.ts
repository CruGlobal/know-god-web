import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APIURL } from '../api/url';
import { CommonService } from './common.service';
import { ResourceType } from './xml-parser-service/xml-parser.service';

export interface Resource {
  imgUrl: string;
  resourceName: string;
  id: string;
  abbreviation: string;
  tagline: string | null;
  resourceType: ResourceType;
}

export interface DashboardData {
  tools: Resource[];
  lessons: Resource[];
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private readonly resourceTypes = [
    ResourceType.Tract,
    ResourceType.CYOA,
    ResourceType.Lesson
  ];

  constructor(readonly commonService: CommonService) {}

  getDashboardData(languageId: number): Observable<DashboardData> {
    const booksUrl =
      APIURL.GET_ALL_BOOKS +
      '?include=attachments,latest-translations,metatool';

    return this.commonService
      .getBooks(booksUrl)
      .pipe(map((booksData) => this.processBookData(booksData, languageId)));
  }

  private processBookData(booksData: any, languageId: number): DashboardData {
    const attachments = booksData.included.filter(
      (included: any) => included.type === 'attachment'
    );

    const translations = booksData.included.filter(
      (included: any) =>
        included.type === 'translation' &&
        Number(included.relationships.language.data.id) === languageId
    );

    const tools: Resource[] = [];
    const lessons: Resource[] = [];

    booksData.data
      .sort(
        (o1: any, o2: any) =>
          (o1.attributes['attr-default-order'] || 0) -
          (o2.attributes['attr-default-order'] || 0)
      )
      .forEach((resource: any) => {
        const { id: resourceId, attributes, relationships } = resource;
        const resourceType = attributes['resource-type'] as ResourceType;

        if (attributes['attr-hidden']) {
          return;
        }
        if (!this.resourceTypes.includes(resourceType)) {
          return;
        }

        if (relationships?.metatool?.data) {
          const metaToolId = relationships.metatool.data.id;
          const metaTool =
            booksData.data.find((tool: any) => tool.id === metaToolId) ||
            booksData.included.find(
              (tool: any) => tool.type === 'resource' && tool.id === metaToolId
            );

          const defaultVariant =
            metaTool?.relationships['default-variant'] || null;
          if (defaultVariant != null && defaultVariant.data.id !== resourceId) {
            return;
          }
        }

        const translation = translations.find(
          (x: any) => x.relationships.resource.data.id === resourceId
        );

        if (translation?.attributes) {
          const resourceName = translation.attributes['translated-name'];
          const tagline = translation.attributes['translated-tagline'];
          const imgUrl = attachments.find(
            (x: any) => x.id === attributes['attr-banner']
          )?.attributes.file;

          const resourceData: Resource = {
            imgUrl,
            resourceName,
            id: resourceId,
            abbreviation: attributes.abbreviation,
            tagline,
            resourceType
          };

          if (
            resourceType === ResourceType.CYOA ||
            resourceType === ResourceType.Tract
          ) {
            tools.push(resourceData);
          } else if (resourceType === ResourceType.Lesson) {
            // Lessons do not have meaningful taglines
            const lessonData = { ...resourceData, tagline: null };
            lessons.push(lessonData);
          }
        } else {
          console.log('MISSING TRANSLATION', resource, translation);
        }
      });

    return { tools, lessons };
  }
}
