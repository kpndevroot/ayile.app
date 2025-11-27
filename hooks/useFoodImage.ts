import { useState, useEffect } from 'react';
import { UNSPLASH_ACCESS_KEY, UNSPLASH_API_URL } from '@/constants/api';

interface UseFoodImageReturn {
  imageUrl: string | null;
  isLoading: boolean;
  error: boolean;
}

/**
 * Hook to fetch food images from Unsplash
 * Uses menu item name or category as search keyword
 */
export function useFoodImage(
  menuItemName: string,
  category?: string,
  existingImageUrl?: string
): UseFoodImageReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(existingImageUrl || null);
  const [isLoading, setIsLoading] = useState(!existingImageUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If there's an existing image URL, use it
    if (existingImageUrl) {
      setImageUrl(existingImageUrl);
      setIsLoading(false);
      setError(false);
      return;
    }

    // Generate search keyword from menu item name or category
    const getSearchKeyword = (): string => {
      // Try to extract meaningful keywords from the name
      const name = menuItemName.toLowerCase();
      
      // Common food keywords mapping
      const foodKeywords: { [key: string]: string } = {
        burger: 'burger',
        hamburger: 'burger',
        pizza: 'pizza',
        pasta: 'pasta',
        spaghetti: 'pasta',
        salad: 'salad',
        dessert: 'dessert',
        cake: 'dessert',
        ice: 'ice cream',
        cream: 'ice cream',
        soup: 'soup',
        sandwich: 'sandwich',
        wrap: 'wrap',
        taco: 'taco',
        burrito: 'burrito',
        sushi: 'sushi',
        rice: 'rice dish',
        chicken: 'chicken dish',
        fish: 'fish dish',
        steak: 'steak',
        coffee: 'coffee',
        tea: 'tea',
        juice: 'juice',
        drink: 'beverage',
        smoothie: 'smoothie',
        appetizer: 'appetizer',
        starter: 'appetizer',
        main: 'main course',
        entree: 'main course',
      };

      // Check if name contains any food keywords
      for (const [key, value] of Object.entries(foodKeywords)) {
        if (name.includes(key)) {
          return value;
        }
      }

      // Use category if available
      if (category) {
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('appetizer') || categoryLower.includes('starter')) {
          return 'appetizer food';
        }
        if (categoryLower.includes('main') || categoryLower.includes('entree')) {
          return 'main course food';
        }
        if (categoryLower.includes('dessert') || categoryLower.includes('sweet')) {
          return 'dessert food';
        }
        if (categoryLower.includes('drink') || categoryLower.includes('beverage')) {
          return 'beverage drink';
        }
        if (categoryLower.includes('salad')) {
          return 'salad';
        }
        if (categoryLower.includes('pizza')) {
          return 'pizza';
        }
        if (categoryLower.includes('burger')) {
          return 'burger';
        }
        if (categoryLower.includes('pasta')) {
          return 'pasta';
        }
      }

      // Fallback: use first word of menu item name
      const firstWord = name.split(' ')[0];
      return firstWord || 'food';
    };

    const fetchImage = async () => {
      setIsLoading(true);
      setError(false);

      try {
        const keyword = getSearchKeyword();
        
        let imageUrlToUse: string;

        // If API key is provided, use official Unsplash API for better results
        if (UNSPLASH_ACCESS_KEY) {
          try {
            // Use Unsplash Search API to get relevant food images
            const searchUrl = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(keyword + ' food')}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
            
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            if (response.ok && data.results && data.results.length > 0) {
              // Use the first result's regular size URL
              imageUrlToUse = data.results[0].urls.regular;
            } else {
              // Fallback to source.unsplash.com if API call fails
              imageUrlToUse = `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword + ' food')}`;
            }
          } catch (apiError) {
            console.warn('Unsplash API error, using fallback:', apiError);
            // Fallback to source.unsplash.com if API call fails
            imageUrlToUse = `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword + ' food')}`;
          }
        } else {
          // No API key - use Unsplash Source API (deprecated but still works)
          // Note: This is less reliable and may have rate limits
          imageUrlToUse = `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword + ' food')}`;
        }
        
        // Set the image URL - FoodImage component will handle loading/error states
        setImageUrl(imageUrlToUse);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching food image:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [menuItemName, category, existingImageUrl]);

  return { imageUrl, isLoading, error };
}

