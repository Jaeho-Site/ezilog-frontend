import { Metadata } from 'next';
import { siteConfig, getImageUrl } from './config';
import {
  OpenGraphParams,
  TwitterCardParams,
  RobotsParams,
  MetadataResult,
} from './types';

export function buildOpenGraph(params: OpenGraphParams): Metadata['openGraph'] {
  const {
    title,
    description,
    url,
    type,
    images,
    publishedTime,
    authors,
    tags,
  } = params;

  const ogImages = images || [
    {
      url: getImageUrl(siteConfig.defaultImage),
      width: 1200,
      height: 630,
      alt: title,
    },
  ];

  const baseOg = {
    title,
    description,
    url,
    siteName: siteConfig.name,
    type,
    locale: siteConfig.locale,
    images: ogImages,
  };

  if (type === 'article' && (publishedTime || authors || tags)) {
    return {
      ...baseOg,
      ...(publishedTime && { publishedTime }),
      ...(authors && { authors }),
      ...(tags && { tags }),
    };
  }

  return baseOg;
}

export function buildTwitterCard(params: TwitterCardParams): Metadata['twitter'] {
  const { card, title, description, images, creator } = params;

  return {
    card,
    title,
    description,
    ...(images && { images }),
    creator: creator || siteConfig.author.twitter,
  };
}

export function buildRobots(params?: RobotsParams): Metadata['robots'] {
  const index = params?.index ?? siteConfig.robots.index;
  const follow = params?.follow ?? siteConfig.robots.follow;

  return {
    index,
    follow,
    googleBot: {
      index,
      follow,
    },
  };
}

export function buildBaseMetadata(params: {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl: string;
}): Metadata {
  const { title, description, keywords, canonicalUrl } = params;

  return {
    title,
    description,
    ...(keywords && { keywords }),
    authors: [{ name: siteConfig.author.name }],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
