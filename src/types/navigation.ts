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

export type FooterLink = {
  text: string;
  href: string;
  ariaLabel?: string;
  icon?: string;
};

export type FooterLinks = {
  title?: string;
  links: Array<FooterLink>;
};

export type FooterData = {
  links: Array<FooterLinks>;
  secondaryLinks: Array<FooterLink>;
  socialLinks: Array<FooterLink>;
  footNote?: string;
  theme?: string;
}; 