export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Owner' | 'Tenant';
}

export interface Flat {
  id: number;
  address: string;
  city: string;
  description: string;
  rentPrice: number;
  rooms: number;
  bathrooms?: number;
  images: string[];
  ownerId: string;
  ownerName: string;
  createdAt: string;
  isAvailable: boolean;
}

export interface Booking {
  id: number;
  flatId: number;
  flatAddress: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  paymentReference: string;
  createdAt: string;
}

export interface Message {
  id: number;
  flatId?: number;
  bookingId?: number;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  body: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Owner' | 'Tenant';
}
