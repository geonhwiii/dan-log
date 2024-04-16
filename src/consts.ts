import type { Site, Page, Links, Socials } from '@types';

// Global
export const SITE: Site = {
  TITLE: '단로그',
  DESCRIPTION: '프론트엔드 개발자 Dan의 개발 일상 블로그입니다.',
  AUTHOR: 'Dan',
};

// Work Page
export const WORK: Page = {
  TITLE: '프로필',
  DESCRIPTION: '프로필 및 경력',
};

// Blog Page
export const BLOG: Page = {
  TITLE: '블로그',
  DESCRIPTION: '단의 블로그 글 목록',
};

// Search Page
export const SEARCH: Page = {
  TITLE: '검색',
  DESCRIPTION: '단로그의 글 목록 검색',
};

// Links
export const LINKS: Links = [
  {
    TEXT: '홈',
    HREF: '/',
  },
  {
    TEXT: '블로그',
    HREF: '/blog',
  },
  {
    TEXT: '프로필',
    HREF: '/work',
  },
];

export const SOCIALS: Socials = [
  {
    NAME: 'Email',
    ICON: 'email',
    TEXT: 'gunw.dan@gmail.com',
    HREF: 'mailto:gunw.dan@gmail.com',
  },
  {
    NAME: 'Github',
    ICON: 'github',
    TEXT: 'geonhwiii',
    HREF: 'https://github.com/geonhwiii',
  },
  {
    NAME: 'LinkedIn',
    ICON: 'linkedin',
    TEXT: 'gunwww',
    HREF: 'https://www.linkedin.com/in/gunwww/',
  },
];
