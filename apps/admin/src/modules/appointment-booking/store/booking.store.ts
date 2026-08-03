import { create } from 'zustand';

export type BookingStep = 
  | 'idle'
  | 'identity'
  | 'services'
  | 'requirements'
  | 'schedule'
  | 'confirm'
  | 'submitting'
  | 'success';

export interface BookingServiceItem {
  id: string; // unique local id for the cart item
  serviceId: string;
  name: string;
  price: number;
  duration: number; // in minutes
  employeeId?: string;
  employeeName?: string;
  startTime?: string; // ISO string
  endTime?: string; // ISO string
}

interface BookingState {
  isOpen: boolean;
  step: BookingStep;
  
  // Context
  customerId: string | null;
  customer: any | null; // Will type properly later
  insights: any | null; // CustomerInsight response
  
  // Selection
  cart: BookingServiceItem[];
  selectedDate: Date | null;
  selectedBranchId: string | null;
  
  // Backend Draft
  draftId: string | null;
  missingRequirements: any | null;
  
  // Actions
  openWorkspace: () => void;
  closeWorkspace: () => void;
  setStep: (step: BookingStep) => void;
  setCustomer: (customer: any, insights: any) => void;
  addServiceToCart: (service: Omit<BookingServiceItem, 'id'>) => void;
  removeServiceFromCart: (id: string) => void;
  updateCartItem: (id: string, updates: Partial<BookingServiceItem>) => void;
  setSelectedDate: (date: Date) => void;
  setDraftId: (id: string) => void;
  setMissingRequirements: (reqs: any) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  isOpen: false,
  step: 'idle',
  
  customerId: null,
  customer: null,
  insights: null,
  
  cart: [],
  selectedDate: new Date(),
  selectedBranchId: null, // Should default to tenant branch later
  
  draftId: null,
  missingRequirements: null,
  
  openWorkspace: () => set({ isOpen: true, step: 'identity' }),
  closeWorkspace: () => set({ isOpen: false }),
  setStep: (step) => set({ step }),
  
  setCustomer: (customer, insights) => set({ 
    customerId: customer?.id || null, 
    customer, 
    insights 
  }),
  
  addServiceToCart: (service) => set((state) => ({
    cart: [...state.cart, { ...service, id: Math.random().toString(36).substring(7) }]
  })),
  
  removeServiceFromCart: (id) => set((state) => ({
    cart: state.cart.filter(item => item.id !== id)
  })),
  
  updateCartItem: (id, updates) => set((state) => ({
    cart: state.cart.map(item => item.id === id ? { ...item, ...updates } : item)
  })),
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  setDraftId: (id) => set({ draftId: id }),
  setMissingRequirements: (reqs) => set({ missingRequirements: reqs }),
  
  reset: () => set({
    step: 'identity',
    customerId: null,
    customer: null,
    insights: null,
    cart: [],
    draftId: null,
    missingRequirements: null,
  })
}));
