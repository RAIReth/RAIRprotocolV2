import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';
import type { HeaderData } from './types/navigation';

export const headerData: HeaderData = {
  links: [],
  actions: [{ text: 'GitHub', href: 'https://github.com/rairprotocol', target: '_blank' }],
}; 