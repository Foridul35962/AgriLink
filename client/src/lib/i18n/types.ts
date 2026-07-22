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
  addProduct: {
    badge: string;
    title: string;
    subtitle: string;
    fields: {
      name: { label: string; placeholder: string };
      category: { label: string; placeholder: string };
      quantity: { label: string; placeholder: string };
      unit: { label: string };
      pricePerUnit: { label: string; placeholder: string };
      district: { label: string; placeholder: string };
      harvestDate: { label: string };
      description: { label: string; placeholder: string; charsRemaining: string };
      image: {
        label: string;
        dragText: string;
        browseText: string;
        requirements: string;
        change: string;
        remove: string;
      };
    };
    categories: string[];
    units: { kg: string; mon: string; ton: string; piece: string };
    errors: {
      nameRequired: string;
      categoryRequired: string;
      quantityRequired: string;
      quantityMin: string;
      priceRequired: string;
      priceMin: string;
      districtRequired: string;
      districtInvalid: string;
      harvestDateRequired: string;
      harvestDateInvalid: string;
      unitRequired: string;
      descriptionMax: string;
      imageRequired: string;
    };
    submitButton: string;
    submittingButton: string;
    serverError: string;
  };
}
