export type Link = {
  text: string;
  href?: string;
  links?: Link[];
};

export type Action = {
  text: string;
  href: string;
  target?: string;
};

export type HeaderData = {
  links: Link[];
  actions: Action[];
}; 