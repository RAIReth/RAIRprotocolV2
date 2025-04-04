import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';
import type { HeaderData, FooterData } from './types/navigation';

export const headerData: HeaderData = {
  links: [],
  actions: [{ text: 'GitHub', href: 'https://github.com/rairprotocol', target: '_blank' }],
};

export const footerData: FooterData = {
  links: [
    {
      title: 'Product',
      links: [
        { text: 'Features', href: '#' },
        { text: 'Documentation', href: '#' },
        { text: 'Pricing', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '#' },
        { text: 'Blog', href: '#' },
        { text: 'Careers', href: '#' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms of Service', href: '#' },
    { text: 'Privacy Policy', href: '#' },
  ],
  socialLinks: [
    { text: 'Twitter', href: 'https://twitter.com/rairprotocol', icon: 'tabler:brand-twitter' },
    { text: 'GitHub', href: 'https://github.com/rairprotocol', icon: 'tabler:brand-github' },
  ],
  footNote: '© 2023 RAIRprotocol. All rights reserved.',
}; 