export interface AppTranslations {
  nav: {
    home: string;
    features: string;
    howItWorks: string;
    whoItsFor: string;
    contact: string;
    login: string;
    getStarted: string;
  };
  languageSwitcher: {
    label: string;
    english: string;
    bangla: string;
  };
  hero: {
    badge: string;
    titleLine: string;
    titleHighlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    roles: {
      farmer: string;
      aratdar: string;
      retailer: string;
    };
  };
  stats: {
    items: { value: string; label: string }[];
  };
  features: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  howItWorks: {
    sectionLabel: string;
    title: string;
    stepLabel: string;
    steps: { title: string; description: string }[];
  };
  roles: {
    sectionLabel: string;
    title: string;
    items: { title: string; description: string; points: string[] }[];
  };
  testimonials: {
    sectionLabel: string;
    title: string;
    items: { quote: string; name: string; role: string }[];
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    description: string;
    email: string;
    phone: string;
    sections: {
      platform: { title: string; links: { label: string; href: string }[] };
      company: { title: string; links: { label: string; href: string }[] };
      legal: { title: string; links: { label: string; href: string }[] };
    };
    copyright: string;
  };
}
