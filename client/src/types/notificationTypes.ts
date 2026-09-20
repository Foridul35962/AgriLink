export interface NotificationSender {
  _id: string;
  name: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: NotificationSender | null;
  type: string;
  title: string;
  message: string;
  relatedId: string | null;
  isReaded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetAllNotificationDataType {
  notifications: Notification[];
  pagination: NotificationPagination;
}