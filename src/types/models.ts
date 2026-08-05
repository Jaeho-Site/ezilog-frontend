export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface FormattedImage {
  url: string;
  alt: string;
}

export interface Post {
  id: number;
  title: string;
  description: string;
  slug: string;
  coverImage: FormattedImage | null;
  publishedDate: string;
  category: Category;
  tags: Tag[];
}

export interface RelatedPost {
  slug: string;
  title: string;
  description: string;
}
