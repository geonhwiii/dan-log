import type { Site, Page, Links, Socials } from '@types';

// Global
export const SITE: Site = {
  TITLE: '단로그',
  DESCRIPTION: '프론트엔드 개발자 Dan의 개발 일상 블로그입니다.',
  AUTHOR: 'Dan',
};

// Work Page
export const WORK: Page = {
  TITLE: 'Work',
  DESCRIPTION: 'Places I have worked.',
};

// Blog Page
export const BLOG: Page = {
  TITLE: 'Blog',
  DESCRIPTION: 'Writing on topics I am passionate about.',
};

// Search Page
export const SEARCH: Page = {
  TITLE: 'Search',
  DESCRIPTION: 'Search all posts and projects by keyword.',
};

// Links
export const LINKS: Links = [
  {
    TEXT: 'Home',
    HREF: '/',
  },
  {
    TEXT: 'Work',
    HREF: '/work',
  },
  {
    TEXT: 'Blog',
    HREF: '/blog',
  },
];

// Socials
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
  // {
  //   NAME: 'Twitter',
  //   ICON: 'twitter-x',
  //   TEXT: 'geonhwiii',
  //   HREF: 'https://twitter.com/geonhwiii',
  // },
];
