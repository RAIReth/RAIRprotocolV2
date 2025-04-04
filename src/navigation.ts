import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';
import type { HeaderData } from './types/navigation';

export const headerData: HeaderData = {
  links: [
    {
      text: 'Platform',
      links: [
        { text: 'Github', href: 'https://github.com/rairprotocol' },
        { text: 'API Reference', href: 'https://docs.rairprotocol.org/rairprotocol/codebase/rair-api' },
        { text: 'Smart Contracts', href: 'https://docs.rairprotocol.org/rairprotocol/codebase/rairdapp/rairsolidity' },
        { text: 'Whitepaper', href: 'https://docs.rairprotocol.org/rairprotocol/whitepaper' },
        { text: 'Tokenomics', href: 'https://docs.rairprotocol.org/rairprotocol/tokenomics/mechanics' },
      ],
    },
    {
      text: 'Support',
      links: [
        { text: 'Docs', href: 'https://docs.rairprotocol.org' },
        { text: 'Community Forum', href: 'https://discord.com/login?redirect_to=%2Fchannels%2F940249331766788168%2F973582780485234798' },
        { text: 'Status', href: 'https://twitter.com/rairprotocol' },
      ],
    },
    {
      text: 'Legal',
      links: [
        { text: 'Terms', href: getPermalink('/terms') },
        { text: 'Privacy Policy', href: getPermalink('/privacy') },
      ],
    },
    {
      text: 'Apply',
      href: 'https://calendly.com/rairprotocol',
    },
  ],
  actions: [{ text: 'Demo', href: 'https://devdapp.com', target: '_blank' }],
}; 