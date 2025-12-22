import { OrderStatus } from '@/types';

/**
 * Get the badge color for an order status
 * @param status - The order status
 * @returns Hex color code for the status badge
 */
export const getStatusBadgeColor = (status: OrderStatus): string => {
  switch (status) {
    case 'DELIVERED':
      return '#10B981';
    case 'CANCELLED':
      return '#EF4444';
    case 'READY':
      return '#3B82F6';
    case 'PREPARING':
      return '#F59E0B';
    case 'CONFIRMED':
      return '#8B5CF6';
    case 'PENDING':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};

/**
 * Get the human-readable label for an order status
 * @param status - The order status
 * @returns Formatted status label
 */
export const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'PREPARING':
      return 'Preparing';
    case 'READY':
      return 'Ready';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};
