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
  adminMemberRequests: {
    header: {
      title: string;
      subtitle: string;
    };
    filter: {
      allRoles: string;
      farmer: string;
      aratdar: string;
      retailer: string;
    };
    stats: {
      showing: string;
      of: string;
      pendingRequests: string;
      filterLabel: string;
    };
    emptyState: {
      title: string;
      subtitle: string;
    };
    table: {
      memberName: string;
      role: string;
      contactInfo: string;
      district: string;
      actions: string;
    };
    roles: {
      farmer: string;
      aratdar: string;
      retailer: string;
    };
    actions: {
      accept: string;
      reject: string;
    };
    pagination: {
      page: string;
      of: string;
    };
  };
  myProducts: {
    title: string;
    subtitle: string;
    allCategories: string;
    allStatuses: string;
    showing: string;
    of: string;
    products: string;
    noProductsFound: string;
    noProductsDesc: string;
    quantity: string;
    pricePer: string;
    totalValue: string;
    page: string;
    categories: Record<string, string>;
    status: {
      available: string;
      sold: string;
      expired: string;
    };
  };
  productDetail: {
    loading: string;
    edit: string;
    delete: string;
    bidsLocked: string;
    quantity: string;
    pricePerUnit: string;
    harvestDate: string;
    description: string;
    farmerInfo: string;
    liveAuction: string;
    startPrice: string;
    highestBid: string;
    topBids: string;
    bidsCount: string;
    noBids: string;
    winner: string;
    deleteModalTitle: string;
    deleteModalDesc: string;
    cancel: string;
    confirmDelete: string;
    deleting: string;
    placeBid: string;
    enterBidAmount: string;
    bidAmountPlaceholder: string;
    submitBid: string;
    submitting: string;
    selectWinner: string;
    selecting: string;
    bidModalTitle: string;
    auctionEnded: string;
    auctionEndTime: string,
    locale: string
    orderLoading: string
    orderNow: string
  };
  editProduct: {
    badge: string;
    title: string;
    subtitle: string;
    noChanges: string;
    updateSuccess: string;
    updateError: string;
    updating: string;
    saveChanges: string;
    fetchError: string;
  };
  adminReports: {
    badge: string;
    title: string;
    subtitle: string;
    table: {
      id: string;
      topic: string;
      action: string;
      viewDetails: string;
      emptyState: string;
    };
    emptyState: {
      title: string;
      description: string;
      refresh: string;
    };
    pagination: {
      showing: string;
      of: string;
      reports: string;
      previous: string;
      next: string;
      page: string;
    };
  };
  createReport: {
    badge: string;
    title: string;
    subtitle: string;
    fields: {
      topic: {
        label: string;
        placeholder: string;
      };
      description: {
        label: string;
        placeholder: string;
        charsRemaining: string;
      };
      reportedUser: {
        label: string;
      };
    };
    buttons: {
      submit: string;
      submitting: string;
      cancel: string;
    };
    messages: {
      success: string;
      error: string;
      topicRequired: string;
      topicLength: string;
      descriptionRequired: string;
      descriptionLength: string;
    },
  };
  adminReport: {
    backToDashboard: string;
    reviewed: string;
    pendingReview: string;
    reportId: string;
    description: string;
    submittedOn: string;
    reportedTarget: string;
    reporter: string;
    removeReportedUser: string;
    removeReporter: string;
    adminReviewActions: string;
    adminActionsDesc: string;
    sendWarning: string;
    markAsDone: string;
    alreadyReviewed: string;
    reportedUserHistory: string;
    reporterHistory: string;
    noOffenses: string;
    noSubmissions: string;
    resolved: string;
    pending: string;
    sendWarningTitle: string;
    sendWarningDesc: string;
    sendWarningSuffix: string;
    cancel: string;
    confirmAndSend: string;
    removeUserTitle: string;
    removeUserDesc: string;
    removeUserSuffix: string;
    reasonLabel: string;
    reasonPlaceholder: string;
    confirmRemoval: string;
    unknownUser: string;
    unknownReporter: string;
    reporterRole: string;
    reportedUserRole: string;
    loadingDetails: string;
  };
  productsPage: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    categoryLabel: string;
    districtLabel: string;
    allCategories: string;
    allDistricts: string;
    resetFilters: string;
    noProducts: string;
    pricePerUnit: string;
    availableQty: string;
    previous: string;
    next: string;
    pageLabel: string;
  };
  aratdarOrders: {
    title: string;
    subtitle: string;
    orderId: string;
    product: string;
    quantity: string;
    totalAmount: string;
    status: string;
    date: string;
    noOrders: string;
    noOrdersSub: string;
    viewDetails: string;
    currency: string;
    page: string;
    of: string;
    previous: string;
    next: string;
  };
  aratdarOrderDetails: {
    back: string;
    title: string;
    orderInfo: string;
    quantity: string;
    totalAmount: string;
    currency: string;
    sellerInfo: string;
    sellerName: string;
    phoneNumber: string;
    email: string;
    notProvided: string;
    notFound: string;
    notFoundSub: string;
  };
  farmerReceiveOrders: {
    title: string;
    subtitle: string;
    ledgerEntries: string;
    placed: string;
    totalAmount: string;
    currency: string;
    noOrders: string;
    noOrdersSub: string;
    page: string;
    of: string;
    previous: string;
    next: string;
  };
  farmerReceiveOrderDetails: {
    back: string;
    title: string;
    orderInfo: string;
    quantity: string;
    totalAmount: string;
    currency: string;
    buyerInfo: string;
    buyerName: string;
    phoneNumber: string;
    email: string;
    district: string;
    updateStatus: string;
    statusUpdatedSuccess: string;
    updatingStatus: string;
    notProvided: string;
    notFound: string;
    notFoundSub: string;
    statusOptions: {
      PROCESSING: string;
      SHIPPED: string;
      DELIVERED: string;
    };
  };
  addCropPage: {
    eyebrow: string;
    pageTitle: string;
    step1Title: string;
    step1Sub: string;
    step2Title: string;
    step2Sub: string;
    addCropHeading: string;
    addRecHeading: string;
    identitySection: string;
    cropNameEn: string;
    cropNameBn: string;
    category: string;
    selectCategory: string;
    cropImage: string;
    chooseImage: string;
    changeImage: string;
    description: string;
    descriptionPlaceholder: string;
    cultivationSection: string;
    waterRequirement: string;
    suitableSoil: string;
    cultivationDuration: string;
    cultivationTips: string;
    cultivationTipsPlaceholder: string;
    weatherRequirement: string;
    minTemp: string;
    maxTemp: string;
    maxHumidity: string;
    maxRainProb: string;
    saveAndContinue: string;
    saving: string;
    skipStep: string;
    suitableDistricts: string;
    plantingMonths: string;
    season: string;
    selectSeason: string;
    reason: string;
    reasonPlaceholder: string;
    tips: string;
    addTip: string;
    recNote: string;
    skip: string;
    submitRec: string;
    updateRec: string;
    update: string;
    submitting: string;
    validation: {
      nameRequired: string;
      banglaNameRequired: string;
      categoryRequired: string;
      imageRequired: string;
      minTempRequired: string;
      maxTempRequired: string;
      districtRequired: string;
      monthRequired: string;
    };
  };
  cropDetailsPage: {
    loading: string
    notFoundTitle: string
    notFoundDesc: string
    backButton: string
    editCrop: string
    addRecommendation: string
    editRecommendation: string
    category: string
    description: string
    waterRequirement: string
    water: {
      low: string
      medium: string
      high: string
    }
    cultivationDuration: string
    days: string
    suitableSoil: string
    cultivationTips: string
    weatherRequirement: string
    temperature: string
    humidity: string
    rainProbability: string
    rainfall: string
    recommendationTitle: string
    noRecommendationTitle: string
    noRecommendationDesc: string
    districts: string
    plantingMonths: string
    season: string
    reason: string
    tips: string
    seasons: {
      "kharif-1": string
      "kharif-2": string
      rabi: string
      all: string
    }
    categories: {
      cereal: string
      vegetable: string
      fruit: string
      pulse: string
      oilseed: string
      spice: string
      "cash-crop": string
      other: string
    }
  };
  cropList: {
    title: string;
    subtitle: string;

    loading: string;
    noCrops: string;
    noCropsDescription: string;

    category: string;
    waterRequirement: string;
    suitableSoil: string;

    page: string;
    of: string;
    prev: string;
    next: string;

    searchPlaceholder: string;
    allCategories: string;
    searchBtn: string;
    clearFilters: string;

    showingResults: string;
    cropsFound: string;

    categories: {
      cereal: string;
      vegetable: string;
      fruit: string;
      pulse: string;
    };

    waterLevels: {
      low: string;
      medium: string;
      high: string;
    };
  };
}
