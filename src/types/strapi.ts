// Strapi API 응답 구조 타입

export interface StrapiResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
    start?: number;
    limit?: number;
  };
}

export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

export interface StrapiMediaAttributes {
  name: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  mime?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StrapiMedia {
  data: {
    id: number;
    attributes: StrapiMediaAttributes;
  } | null;
}

export interface StrapiRelation<T> {
  data: T | null;
}

export interface StrapiRelationArray<T> {
  data: T[];
}
