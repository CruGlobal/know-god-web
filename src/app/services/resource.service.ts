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

interface JsonApiResource {
  type: string;
  id: string;
  attributes: { [key: string]: unknown };
  relationships: {
    [key: string]: {
      data:
        | { type: string; id: string }
        | { type: string; id: string }[]
        | null;
    };
  };
}

interface JsonApiResponse {
  data: JsonApiResource[];
  included: JsonApiResource[];
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
      .pipe(
        map((booksData: JsonApiResponse) =>
          this.processBookData(booksData, languageId)
        )
      );
  }

  private processBookData(
    booksData: JsonApiResponse,
    languageId: number
  ): DashboardData {
    const attachments = booksData.included.filter(
      (included: JsonApiResource) => included.type === 'attachment'
    );

    const translations = booksData.included.filter(
      (included: JsonApiResource) =>
        included.type === 'translation' &&
        Number((included.relationships.language.data as { id: string }).id) ===
          languageId
    );

    const tools: Resource[] = [];
    const lessons: Resource[] = [];

    booksData.data
      .sort(
        (o1: JsonApiResource, o2: JsonApiResource) =>
          (o1.attributes['attr-default-order'] as number) -
          (o2.attributes['attr-default-order'] as number)
      )
      .forEach((resource: JsonApiResource) => {
        const { id: resourceId, attributes, relationships } = resource;
        const resourceType = attributes['resource-type'] as ResourceType;

        if (attributes['attr-hidden']) {
          return;
        }
        if (!this.resourceTypes.includes(resourceType)) {
          return;
        }

        if (relationships?.metatool?.data) {
          const metaToolId = (relationships.metatool.data as { id: string }).id;
          const metaTool =
            booksData.data.find(
              (tool: JsonApiResource) => tool.id === metaToolId
            ) ||
            booksData.included.find(
              (tool: JsonApiResource) =>
                tool.type === 'resource' && tool.id === metaToolId
            );

          const defaultVariant =
            metaTool?.relationships['default-variant'] || null;
          if (
            defaultVariant != null &&
            (defaultVariant.data as { id: string }).id !== resourceId
          ) {
            return;
          }
        }

        const translation = translations.find(
          (x: JsonApiResource) =>
            (x.relationships.resource.data as { id: string }).id === resourceId
        );

        if (translation?.attributes) {
          const resourceName = translation.attributes[
            'translated-name'
          ] as string;
          const tagline = translation.attributes[
            'translated-tagline'
          ] as string;
          const imgUrl = attachments.find(
            (x: JsonApiResource) =>
              x.id === (attributes['attr-banner'] as string)
          )?.attributes.file as string;

          const resourceData: Resource = {
            imgUrl,
            resourceName,
            id: resourceId,
            abbreviation: attributes.abbreviation as string,
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
