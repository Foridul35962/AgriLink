export interface createReportType {
    reportedUserId: string
    topic: string
    description: string
}

// ======================
// createReports
// ======================

export interface CreateReportResponse {
  _id: string;
  reporterId: string;
  reportedUserId: string;
  topic: string;
  description: string;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ======================
// viewAllReports
// ======================

export interface ViewAllReportsResponse {
  reports: {
    _id: string;
    topic: string;
  }[];

  pagination: {
    page: number;
    limit: number;
    totalReports: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ======================
// viewReportById
// ======================

export interface ViewReportByIdResponse {
  report: {
    _id: string;
    reporterId: {
      _id: string;
      name: string;
      email?: string;
      phoneNumber?: string;
    };

    reportedUserId: {
      _id: string;
      name: string;
      email?: string;
      phoneNumber?: string;
    };

    topic: string;
    description: string;
    isReviewed: boolean;
    createdAt: string;
    updatedAt: string;
  };

  reporterHistory: {
    _id: string;
    topic: string;
    isReviewed: boolean;
    createdAt: string;
  }[];

  reportedUserHistory: {
    _id: string;
    topic: string;
    isReviewed: boolean;
    createdAt: string;
  }[];
}