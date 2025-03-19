import { api } from './api';

// Get all inventory items
export const getAllInventory = async () => {
  try {
    const response = await api.get('/inventory');
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

// Get a single inventory item by ID
export const getInventoryById = async (id) => {
  try {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventory item ${id}:`, error);
    throw error;
  }
};

// Create a new inventory item
export const createInventory = async (inventoryData) => {
  try {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

// Update an existing inventory item
export const updateInventory = async (id, inventoryData) => {
  try {
    const response = await api.put(`/inventory/${id}`, inventoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating inventory item ${id}:`, error);
    throw error;
  }
};

// Delete an inventory item
export const deleteInventory = async (id) => {
  try {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting inventory item ${id}:`, error);
    throw error;
  }
};

// Get inventory gap analysis
export const getGapAnalysis = async () => {
  try {
    const response = await api.get('/inventory/gap-analysis');
    return response.data;
  } catch (error) {
    console.error('Error fetching gap analysis:', error);
    // Return a default empty structure instead of throwing the error
    return {
      summary: {
        totalCategories: 0,
        highImpactGaps: 0,
        averageGap: 0,
        totalGap: 0
      },
      categories: []
    };
  }
};

// Get inventory shortages
export const getInventoryShortages = async (category) => {
  try {
    const url = category 
      ? `/inventory/shortages?category=${encodeURIComponent(category)}`
      : '/inventory/shortages';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory shortages:', error);
    throw error;
  }
};
