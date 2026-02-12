import { API_BASE_URL } from '@/constants/api';

/**
 * Converts a relative image URL to a full URL
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns Full URL to the image
 */
export const getFullImageUrl = (imageUrl?: string | null): string | null => {
    if (!imageUrl) return null;

    // If already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Construct full URL from relative path
    return `${API_BASE_URL}${imageUrl}`;
};
