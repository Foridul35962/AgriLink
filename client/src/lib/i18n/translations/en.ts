import { CATEGORY_VALUES } from "@/constants/constantValues";
import type { AppTranslations } from "../types";

const en: AppTranslations = {
  nav: {
    home: "Home",
    features: "Features",
    howItWorks: "How it works",
    whoItsFor: "Who it's for",
    contact: "Contact",
    login: "Log in",
    getStarted: "Get started",
  },
  languageSwitcher: {
    label: "Language",
    english: "English",
    bangla: "বাংলা",
  },
  hero: {
    badge: "Connecting every link of the agri chain",
    titleLine: "From the field to the market,",
    titleHighlight: "grown together.",
    subtitle:
      "AgriLink connects farmers, aratdars and retailers on one platform — fair prices, fewer middlemen, faster deliveries.",
    ctaPrimary: "Create free account",
    ctaSecondary: "See how it works",
    roles: {
      farmer: "Farmers",
      aratdar: "Aratdars",
      retailer: "Retailers",
    },
  },
  stats: {
    items: [
      { value: "12,000+", label: "Registered farmers" },
      { value: "64", label: "Districts covered" },
      { value: "50,000+", label: "Tons traded" },
      { value: "8,500+", label: "Direct connections made" },
    ],
  },
  features: {
    sectionLabel: "Why AgriLink",
    title: "Everything the agri chain needs, in one place",
    subtitle:
      "Built for the realities of farming and trade in Bangladesh — simple, transparent, and fair for everyone involved.",
    items: [
      {
        title: "Real-time market prices",
        description:
          "See up-to-date crop prices across every district before you buy or sell.",
      },
      {
        title: "Direct trade, less waste",
        description:
          "Connect farmers straight to buyers — fewer middlemen, fresher produce, better margins.",
      },
      {
        title: "Verified accounts",
        description:
          "Every farmer, aratdar, and retailer is verified so you always know who you're trading with.",
      },
      {
        title: "Secure payments",
        description:
          "Pay and get paid safely with transaction protection built into every order.",
      },
      {
        title: "Direct messaging",
        description:
          "Negotiate quantities, prices, and delivery details directly in the app.",
      },
      {
        title: "Order tracking",
        description:
          "Track every order from harvest to delivery, with status updates at each step.",
      },
    ],
  },
  howItWorks: {
    sectionLabel: "How it works",
    title: "Four steps from harvest to hand",
    stepLabel: "STEP",
    steps: [
      {
        title: "Create your account",
        description:
          "Sign up in minutes and tell us whether you're a farmer, aratdar or retailer.",
      },
      {
        title: "List or browse",
        description:
          "Farmers list their harvest, buyers browse listings by crop, price, and district.",
      },
      {
        title: "Connect & agree",
        description:
          "Message directly, agree on quantity and price, and confirm the order.",
      },
      {
        title: "Deliver & get paid",
        description:
          "Track delivery in real time and receive secure payment once it's complete.",
      },
    ],
  },
  roles: {
    sectionLabel: "Who it's for",
    title: "Built for every link in the chain",
    items: [
      {
        title: "Farmers",
        description: "Sell your harvest directly and get fair, transparent prices.",
        points: ["List crops in seconds", "See live market prices", "Get paid securely"],
      },
      {
        title: "Aratdars",
        description: "Source produce reliably and manage bulk trade with ease.",
        points: [
          "Bulk order management",
          "Verified farmer network",
          "Faster settlements",
        ],
      },
      {
        title: "Retailers",
        description: "Stock fresh produce straight from source, at better margins.",
        points: ["Direct sourcing", "Consistent supply", "Order tracking"],
      },
    ],
  },
  testimonials: {
    sectionLabel: "Trusted across the chain",
    title: "What our community is saying",
    items: [
      {
        quote:
          "AgriLink helped me sell my rice harvest directly to an aratdar in Dhaka. No middleman, and I got a much better price than before.",
        name: "Abdul Karim",
        role: "Farmer, Bogura",
      },
      {
        quote:
          "Sourcing vegetables used to take days of phone calls. Now I browse listings and confirm orders in the same afternoon.",
        name: "Salma Begum",
        role: "Retailer, Chattogram",
      },
      {
        quote:
          "As an aratdar, tracking who I'm buying from and settling payments used to be messy. This platform made it simple.",
        name: "Mizanur Rahman",
        role: "Aratdar, Rangpur",
      },
    ],
  },
  cta: {
    title: "Ready to grow with AgriLink?",
    subtitle:
      "Join thousands of farmers, aratdars and retailers already trading smarter, together.",
    button: "Create your free account",
  },
  footer: {
    description:
      "Connecting farmers, aratdars and retailers across Bangladesh — fair prices, fewer middlemen.",
    email: "support@agrilink.com",
    phone: "+880 1XXX-XXXXXX",
    sections: {
      platform: {
        title: "Platform",
        links: [
          { label: "Features", href: "#features" },
          { label: "How it works", href: "#how-it-works" },
          { label: "Who it's for", href: "#roles" },
        ],
      },
      company: {
        title: "Company",
        links: [
          { label: "About us", href: "#" },
          { label: "Contact", href: "#contact" },
          { label: "Careers", href: "#" },
        ],
      },
      legal: {
        title: "Legal",
        links: [
          { label: "Privacy policy", href: "#" },
          { label: "Terms of service", href: "#" },
        ],
      },
    },
    copyright: "All rights reserved.",
  },
  addProduct: {
    badge: "List a new product",
    title: "Add your product",
    subtitle:
      "Fill in the details below so buyers can find and order your product.",
    fields: {
      name: { label: "Product name", placeholder: "e.g. Premium Basmati Rice" },
      category: { label: "Category", placeholder: "Select category" },
      quantity: { label: "Quantity", placeholder: "e.g. 500" },
      unit: { label: "Unit" },
      pricePerUnit: { label: "Price per unit (৳)", placeholder: "e.g. 45.50" },
      district: { label: "District", placeholder: "Select district" },
      harvestDate: { label: "Harvest date" },
      description: {
        label: "Description (optional)",
        placeholder: "Tell buyers more about quality, variety, storage, etc.",
        charsRemaining: "characters remaining",
      },
      image: {
        label: "Product image",
        dragText: "Drag & drop an image here, or",
        browseText: "browse",
        requirements: "PNG or JPG, up to 5MB",
        change: "Change image",
        remove: "Remove",
      },
    },
    categories: CATEGORY_VALUES,
    units: { kg: "Kilogram (kg)", mon: "Mon", ton: "Ton", piece: "Piece" },
    errors: {
      nameRequired: "Product name is required",
      categoryRequired: "Category is required",
      quantityRequired: "Quantity is required",
      quantityMin: "Quantity must be greater than 0",
      priceRequired: "Price is required",
      priceMin: "Price must be greater than 0",
      districtRequired: "District is required",
      districtInvalid: "Invalid district",
      harvestDateRequired: "Harvest date is required",
      harvestDateInvalid: "Harvest date must be a valid date",
      unitRequired: "Unit is required",
      descriptionMax: "Description must be under 300 characters",
      imageRequired: "Product image is required",
    },
    submitButton: "Add product",
    submittingButton: "Adding product...",
    serverError: "Something went wrong. Please try again.",

  }
};

export default en;
