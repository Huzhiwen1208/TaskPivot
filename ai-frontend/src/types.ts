export interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  categoryId: string;
  tagIds: string[];
  readTime: number;
  featured?: boolean;
  cover: 'garden' | 'code' | 'mountain' | 'notes' | 'desk' | 'light';
  markdown: string;
}

export interface TaxonomyItem { id: string; name: string }
export interface ArticleAssignment { categoryId: string; tagIds: string[] }
export interface TaxonomyState {
  version: 1;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
  assignments: Record<string, ArticleAssignment>;
}

export interface BlogComment {
  id: string;
  articleId: string;
  author: string;
  content: string;
  createdAt: string;
}

