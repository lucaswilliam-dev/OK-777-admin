import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from "react";
import apiService, { getImageURL } from "../services/api";

// Create the App Context
const AppContext = createContext(null);

// Helper functions for localStorage
const STORAGE_KEY_SELECTED_GAMES = 'gameManager_selectedGames';
const STORAGE_KEY_SELECTED_KEYS = 'gameManager_selectedKeys';

const loadSelectedGamesFromStorage = () => {
  try {
    const storedGames = localStorage.getItem(STORAGE_KEY_SELECTED_GAMES);
    const storedKeys = localStorage.getItem(STORAGE_KEY_SELECTED_KEYS);
    
    if (storedGames && storedKeys) {
      return {
        games: JSON.parse(storedGames),
        keys: JSON.parse(storedKeys),
      };
    }
  } catch (error) {
    console.error('Error loading selected games from localStorage:', error);
  }
  return { games: [], keys: [] };
};

const saveSelectedGamesToStorage = (games, keys) => {
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED_GAMES, JSON.stringify(games));
    localStorage.setItem(STORAGE_KEY_SELECTED_KEYS, JSON.stringify(keys));
  } catch (error) {
    console.error('Error saving selected games to localStorage:', error);
  }
};

// Load initial selected games from localStorage
const initialSelectedGames = loadSelectedGamesFromStorage();

// Initial state
const initialState = {
  // Navigation/Sidebar
  sidebar: {
    selectedKey: "game-category",
    isMenuExpanded: true,
  },

  // Game Category
  gameCategory: {
    dataSource: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
    },
    modals: {
      isAddEditModalOpen: false,
      isDeleteModalOpen: false,
      editingItem: null,
      itemToDelete: null,
    },
  },

  // Game Provider
  gameProvider: {
    dataSource: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
    },
    modals: {
      isAddEditModalOpen: false,
      isDeleteModalOpen: false,
      editingItem: null,
      itemToDelete: null,
    },
  },

  // Game Manager
  gameManager: {
    dataSource: [], // Initialize empty - will be loaded from API
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      pageSize: 21,
      totalItems: 0, // Will be set from API
    },
    modals: {
      isAddEditModalOpen: false,
      isDeleteModalOpen: false,
      editingItem: null,
      itemToDelete: null,
    },
    // Track which games are added to gameManager (using game keys as array)
    selectedGameKeys: [],
    // Store the actual game data for persistence
    _persistedGames: [],
  },

  // Game Store
  gameStore: {
    dataSource: [],
    loading: false,
    error: null,
    lastUpdated: null,
    lastPing: null,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
    },
    modals: {
      isAddEditModalOpen: false,
      isDeleteModalOpen: false,
      isUpdateModalOpen: false,
      isPingModalOpen: false,
      isAddModalOpen: false,
      isMoveModalOpen: false,
      editingItem: null,
      itemToDelete: null,
    },
  },

  // Game Tags
  gameTags: {
    dataSource: [
      {
        key: "1",
        id: 23,
        name: "Hot",
        icon: "HOT",
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "2",
        id: 25,
        name: "New",
        icon: "NEW",
        state: true,
        createTime: "2021-02-28 10:30",
      },
    ],
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalItems: 2,
    },
    modals: {
      isAddEditModalOpen: false,
      isDeleteModalOpen: false,
      editingItem: null,
      itemToDelete: null,
    },
  },

  // Shared dropdown data cache (categories and providers)
  dropdowns: {
    categories: [],
    providers: [],
    loading: false,
    lastFetched: null,
  },
  gameFilters: {
    categories: [],
    providers: [],
    loading: false,
    lastFetched: null,
  },
};

// Context Provider Component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  // Use ref to track current state for synchronous access in callbacks
  const stateRef = useRef(state);
  const gameManagerFiltersRef = useRef({
    search: undefined,
    categoryId: undefined,
    providerId: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  });
  
  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Sidebar actions
  const setSelectedKey = useCallback((key) => {
    setState((prev) => ({
      ...prev,
      sidebar: {
        ...prev.sidebar,
        selectedKey: key,
      },
    }));
  }, []);

  const toggleMenuExpanded = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sidebar: {
        ...prev.sidebar,
        isMenuExpanded: !prev.sidebar.isMenuExpanded,
      },
    }));
  }, []);

  // Game Category actions
  const updateGameCategoryDataSource = useCallback((dataSource) => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        dataSource,
      },
    }));
  }, []);

  const updateGameCategoryItem = useCallback(async (key, updates) => {
    try {
      const item = stateRef.current.gameCategory.dataSource.find((item) => item.key === key);
      if (!item || !item.id) {
        throw new Error('Category not found');
      }

      // Call API to update category
      const response = await apiService.updateGameCategory(item.id, updates.name, updates.icon);
      
      if (response.success && response.data) {
        // Update local state with API response
        setState((prev) => ({
          ...prev,
          gameCategory: {
            ...prev.gameCategory,
            dataSource: prev.gameCategory.dataSource.map((item) =>
              item.key === key
                ? {
                    ...item,
                    name: response.data.name,
                    icon: response.data.icon || "",
                    createTime: response.data.updatedAt
                      ? new Date(response.data.updatedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        }).replace(',', '')
                      : item.createTime,
                  }
                : item
            ),
          },
          // Update dropdown cache immediately
          dropdowns: {
            ...prev.dropdowns,
            categories: prev.dropdowns.categories.map((cat) =>
              cat.id === response.data.id ? response.data : cat
            ),
          },
        }));
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating game category:', error);
      return { success: false, error: error.message || 'Failed to update category' };
    }
  }, []);

  const addGameCategoryItem = useCallback(async (newItem) => {
    try {
      // Call API to create category
      const response = await apiService.createGameCategory(newItem.name, newItem.icon);
      
      if (response.success && response.data) {
        // Transform API response to match table format
        const transformedCategory = {
          key: response.data.id.toString(),
          id: response.data.id,
          name: response.data.name,
          icon: response.data.icon || "",
          state: true,
          createTime: response.data.createdAt
            ? new Date(response.data.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).replace(',', '')
            : new Date().toLocaleString(),
        };

        // Update local state with API response
        setState((prev) => ({
          ...prev,
          gameCategory: {
            ...prev.gameCategory,
            dataSource: [...prev.gameCategory.dataSource, transformedCategory],
            pagination: {
              ...prev.gameCategory.pagination,
              totalItems: prev.gameCategory.pagination.totalItems + 1,
            },
          },
          // Update dropdown cache immediately
          dropdowns: {
            ...prev.dropdowns,
            categories: [...prev.dropdowns.categories, response.data],
          },
        }));
        return { success: true, data: transformedCategory };
      } else {
        throw new Error(response.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating game category:', error);
      return { success: false, error: error.message || 'Failed to create category' };
    }
  }, []);

  const deleteGameCategoryItem = useCallback((key) => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        dataSource: prev.gameCategory.dataSource.filter(
          (item) => item.key !== key
        ),
        pagination: {
          ...prev.gameCategory.pagination,
          totalItems: prev.gameCategory.pagination.totalItems - 1,
        },
      },
    }));
  }, []);

  const setGameCategoryPagination = useCallback((pagination) => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        pagination: {
          ...prev.gameCategory.pagination,
          ...pagination,
        },
      },
    }));
  }, []);

  const setGameCategoryCurrentPage = useCallback((currentPage) => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        pagination: {
          ...prev.gameCategory.pagination,
          currentPage,
        },
      },
    }));
  }, []);

  const openGameCategoryAddEditModal = useCallback((editingItem = null) => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        modals: {
          ...prev.gameCategory.modals,
          isAddEditModalOpen: true,
          editingItem,
        },
      },
    }));
  }, []);

  const closeGameCategoryAddEditModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        modals: {
          ...prev.gameCategory.modals,
          isAddEditModalOpen: false,
          editingItem: null,
        },
      },
    }));
  }, []);

  const openGameCategoryDeleteModal = useCallback((itemToDelete = null) => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        modals: {
          ...prev.gameCategory.modals,
          isDeleteModalOpen: true,
          itemToDelete,
        },
      },
    }));
  }, []);

  const closeGameCategoryDeleteModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        modals: {
          ...prev.gameCategory.modals,
          isDeleteModalOpen: false,
          itemToDelete: null,
        },
      },
    }));
  }, []);

  const confirmDeleteGameCategoryItem = useCallback(async () => {
    try {
      const itemToDelete = stateRef.current.gameCategory.modals.itemToDelete;
      if (!itemToDelete || !itemToDelete.id) {
        throw new Error('Category not found');
      }

      // Call API to delete category
      const response = await apiService.deleteGameCategory(itemToDelete.id);
      
      if (response.success) {
        // Update local state after successful deletion
        setState((prev) => ({
          ...prev,
          gameCategory: {
            ...prev.gameCategory,
            dataSource: prev.gameCategory.dataSource.filter(
              (item) => item.key !== itemToDelete.key
            ),
            pagination: {
              ...prev.gameCategory.pagination,
              totalItems: prev.gameCategory.pagination.totalItems - 1,
            },
            modals: {
              ...prev.gameCategory.modals,
              isDeleteModalOpen: false,
              itemToDelete: null,
            },
          },
          // Update dropdown cache immediately
          dropdowns: {
            ...prev.dropdowns,
            categories: prev.dropdowns.categories.filter(
              (cat) => cat.id !== itemToDelete.id
            ),
          },
        }));
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting game category:', error);
      return { success: false, error: error.message || 'Failed to delete category' };
    }
  }, []);

  // Fetch game categories from database
  const fetchGameCategories = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await apiService.getGameCategories();
      
      if (response.success && response.data) {
        // Transform database response to match table format
        const transformedCategories = response.data.map((category) => ({
          key: category.id.toString(),
          id: category.id,
          name: category.name,
          icon: category.icon || "",
          state: true, // Default state, can be updated if needed
          createTime: category.createdAt 
            ? new Date(category.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).replace(',', '')
            : new Date().toLocaleString(),
        }));

        setState((prev) => ({
          ...prev,
          gameCategory: {
            ...prev.gameCategory,
            dataSource: transformedCategories,
            loading: false,
            error: null,
            pagination: {
              ...prev.gameCategory.pagination,
              totalItems: transformedCategories.length,
            },
          },
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching game categories:', error);
      setState((prev) => ({
        ...prev,
        gameCategory: {
          ...prev.gameCategory,
          loading: false,
          error: error.message || 'Failed to fetch game categories',
        },
      }));
    }
  }, []);

  // Game Provider actions
  const updateGameProviderItem = useCallback(async (key, updates) => {
    try {
      const item = stateRef.current.gameProvider.dataSource.find((item) => item.key === key);
      if (!item || !item.id) {
        throw new Error('Product not found');
      }

      // Prepare product data for API
      // Use new image if provided, otherwise keep existing cover
      const imageToUse = updates.image !== undefined ? updates.image : (item.cover || null);
      
      const productData = {
        name: updates.name || item.name || '',
        provider: updates.provider || item.provider || '',
        currency: updates.currency || item.currency || 'USD',
        status: updates.status || item.status || 'active',
        providerId: updates.providerId || item.providerId || 0,
        code: updates.code || item.code || 0,
        gameType: updates.gameType || item.gameType || '',
        title: updates.title || item.title || updates.name || item.name || '',
        enabled: updates.enabled !== undefined ? updates.enabled : (item.state !== undefined ? item.state : true),
        image: imageToUse,
      };

      // Call API to update product
      const response = await apiService.updateProduct(item.id, productData);
      
      if (response.success && response.data) {
        // Transform updated product to match table format
        const updatedProduct = response.data;
        const transformedItem = {
          key: updatedProduct.id.toString(),
          id: updatedProduct.id,
          name: updatedProduct.provider || updatedProduct.name || `Product ${updatedProduct.code}`,
          cover: updatedProduct.image || "/cat.jpg",
          sort: item.sort || 0,
          state: updatedProduct.enabled !== undefined ? updatedProduct.enabled : true,
          createTime: updatedProduct.updatedAt 
            ? new Date(updatedProduct.updatedAt).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).replace(',', '')
            : item.createTime,
          code: updatedProduct.code,
          provider: updatedProduct.provider,
          currency: updatedProduct.currency,
          status: updatedProduct.status,
          gameType: updatedProduct.gameType,
          title: updatedProduct.title,
        };

        // Update local state with API response
        setState((prev) => ({
          ...prev,
          gameProvider: {
            ...prev.gameProvider,
            dataSource: prev.gameProvider.dataSource.map((item) =>
              item.key === key ? transformedItem : item
            ),
          },
        }));
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating game provider:', error);
      return { success: false, error: error.message || 'Failed to update product' };
    }
  }, []);

  const addGameProviderItem = useCallback(async (newItem) => {
    try {
      // Prepare product data for API
      // Generate a unique code if not provided (use max from current dataSource + 1)
      // Note: In a real scenario, you might want to fetch all products to get the true max
      const currentCodes = stateRef.current.gameProvider.dataSource.map(p => p.code || 0);
      const maxCode = currentCodes.length > 0 ? Math.max(...currentCodes, 0) : 0;
      const productData = {
        name: newItem.name || '',
        provider: newItem.provider || newItem.name || '',
        currency: newItem.currency || 'USD',
        status: newItem.status || 'active',
        providerId: newItem.providerId || 0,
        code: newItem.code || (maxCode + 1),
        gameType: newItem.gameType || '',
        title: newItem.title || newItem.name || '',
        enabled: newItem.enabled !== undefined ? newItem.enabled : (newItem.state !== undefined ? newItem.state : true),
        image: newItem.image || null,
      };

      // Call API to create product
      const response = await apiService.createProduct(productData);
      
      if (response.success && response.data) {
        // Transform created product to match table format
        const createdProduct = response.data;
        const transformedItem = {
          key: createdProduct.id.toString(),
          id: createdProduct.id,
          name: createdProduct.provider || createdProduct.name || `Product ${createdProduct.code}`,
          cover: createdProduct.image || "/cat.jpg",
          sort: stateRef.current.gameProvider.dataSource.length + 1,
          state: createdProduct.enabled !== undefined ? createdProduct.enabled : true,
          createTime: createdProduct.createdAt 
            ? new Date(createdProduct.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).replace(',', '')
            : new Date().toLocaleString(),
          code: createdProduct.code,
          provider: createdProduct.provider,
          currency: createdProduct.currency,
          status: createdProduct.status,
          gameType: createdProduct.gameType,
          title: createdProduct.title,
        };

        // Update local state with API response
        setState((prev) => ({
          ...prev,
          gameProvider: {
            ...prev.gameProvider,
            dataSource: [...prev.gameProvider.dataSource, transformedItem],
            pagination: {
              ...prev.gameProvider.pagination,
              totalItems: prev.gameProvider.pagination.totalItems + 1,
            },
          },
        }));
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error adding game provider:', error);
      return { success: false, error: error.message || 'Failed to create product' };
    }
  }, []);

  const setGameProviderCurrentPage = useCallback((currentPage) => {
    setState((prev) => ({
      ...prev,
      gameProvider: {
        ...prev.gameProvider,
        pagination: {
          ...prev.gameProvider.pagination,
          currentPage,
        },
      },
    }));
  }, []);

  const openGameProviderAddEditModal = useCallback((editingItem = null) => {
    setState((prev) => ({
      ...prev,
      gameProvider: {
        ...prev.gameProvider,
        modals: {
          ...prev.gameProvider.modals,
          isAddEditModalOpen: true,
          editingItem,
        },
      },
    }));
  }, []);

  const closeGameProviderAddEditModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gameProvider: {
        ...prev.gameProvider,
        modals: {
          ...prev.gameProvider.modals,
          isAddEditModalOpen: false,
          editingItem: null,
        },
      },
    }));
  }, []);

  const openGameProviderDeleteModal = useCallback((itemToDelete = null) => {
    setState((prev) => ({
      ...prev,
      gameProvider: {
        ...prev.gameProvider,
        modals: {
          ...prev.gameProvider.modals,
          isDeleteModalOpen: true,
          itemToDelete,
        },
      },
    }));
  }, []);

  const closeGameProviderDeleteModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gameProvider: {
        ...prev.gameProvider,
        modals: {
          ...prev.gameProvider.modals,
          isDeleteModalOpen: false,
          itemToDelete: null,
        },
      },
    }));
  }, []);

  const confirmDeleteGameProviderItem = useCallback(async () => {
    try {
      const itemToDelete = stateRef.current.gameProvider.modals.itemToDelete;
      if (!itemToDelete || !itemToDelete.id) {
        throw new Error('Product not found');
      }

      // Call API to delete product
      const response = await apiService.deleteProduct(itemToDelete.id);
      
      if (response.success) {
        // Update local state
        setState((prev) => {
          return {
            ...prev,
            gameProvider: {
              ...prev.gameProvider,
              dataSource: prev.gameProvider.dataSource.filter(
                (item) => item.key !== itemToDelete.key
              ),
              pagination: {
                ...prev.gameProvider.pagination,
                totalItems: prev.gameProvider.pagination.totalItems - 1,
              },
              modals: {
                ...prev.gameProvider.modals,
                isDeleteModalOpen: false,
                itemToDelete: null,
              },
            },
          };
        });
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting game provider:', error);
      // Close modal even on error
      setState((prev) => ({
        ...prev,
        gameProvider: {
          ...prev.gameProvider,
          modals: {
            ...prev.gameProvider.modals,
            isDeleteModalOpen: false,
            itemToDelete: null,
          },
        },
      }));
      return { success: false, error: error.message || 'Failed to delete product' };
    }
  }, []);

  // Fetch game providers (products) from database
  // Fetch and cache dropdown data (categories and providers)
  const fetchDropdownData = useCallback(async (forceRefresh = false) => {
    // Check if data is already cached and not stale (cache for 5 minutes)
    const cacheAge = stateRef.current.dropdowns.lastFetched 
      ? Date.now() - stateRef.current.dropdowns.lastFetched 
      : Infinity;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    if (!forceRefresh && 
        stateRef.current.dropdowns.categories.length > 0 && 
        stateRef.current.dropdowns.providers.length > 0 &&
        cacheAge < CACHE_DURATION) {
      // Data is cached and fresh, no need to fetch
      return {
        success: true,
        categories: stateRef.current.dropdowns.categories,
        providers: stateRef.current.dropdowns.providers,
      };
    }

    setState((prev) => ({
      ...prev,
      dropdowns: {
        ...prev.dropdowns,
        loading: true,
      },
    }));

    try {
      const [categoriesResponse, providersResponse] = await Promise.all([
        apiService.getGameCategories(),
        apiService.getProviders(),
      ]);

      const categories = categoriesResponse.success && categoriesResponse.data
        ? categoriesResponse.data
        : [];
      const providers = providersResponse.success && providersResponse.data
        ? providersResponse.data
        : [];

      setState((prev) => ({
        ...prev,
        dropdowns: {
          categories,
          providers,
          loading: false,
          lastFetched: Date.now(),
        },
      }));

      return {
        success: true,
        categories,
        providers,
      };
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      setState((prev) => ({
        ...prev,
        dropdowns: {
          ...prev.dropdowns,
          loading: false,
        },
      }));
      return {
        success: false,
        error: error.message || "Failed to fetch dropdown data",
        categories: stateRef.current.dropdowns.categories,
        providers: stateRef.current.dropdowns.providers,
      };
    }
  }, []);

  // Helper function to refresh providers in dropdown cache
  const refreshProvidersInCache = useCallback(async () => {
    try {
      const providersResponse = await apiService.getProviders();
      const providers = providersResponse.success && providersResponse.data
        ? providersResponse.data
        : [];

      setState((prev) => ({
        ...prev,
        dropdowns: {
          ...prev.dropdowns,
          providers,
          lastFetched: Date.now(),
        },
      }));
    } catch (error) {
      console.error("Error refreshing providers in cache:", error);
    }
  }, []);

  const fetchGameFilters = useCallback(async (forceRefresh = false) => {
    const cache = stateRef.current.gameFilters;
    const cacheAge = cache.lastFetched ? Date.now() - cache.lastFetched : Infinity;
    const CACHE_DURATION = 5 * 60 * 1000;

    if (
      !forceRefresh &&
      cache.providers.length > 0 &&
      cache.categories.length > 0 &&
      cacheAge < CACHE_DURATION
    ) {
      return {
        success: true,
        categories: cache.categories,
        providers: cache.providers,
      };
    }

    setState((prev) => ({
      ...prev,
      gameFilters: {
        ...prev.gameFilters,
        loading: true,
      },
    }));

    try {
      const response = await apiService.getGameFilterOptions();
      const categories =
        response.success && response.data && Array.isArray(response.data.categories)
          ? response.data.categories.filter((name) => !!name && name.trim() !== "")
          : [];
      const providers =
        response.success && response.data && Array.isArray(response.data.providers)
          ? response.data.providers.filter((name) => !!name && name.trim() !== "")
          : [];

      setState((prev) => ({
        ...prev,
        gameFilters: {
          categories,
          providers,
          loading: false,
          lastFetched: Date.now(),
        },
      }));

      return { success: true, categories, providers };
    } catch (error) {
      console.error("Error fetching game filters:", error);
      setState((prev) => ({
        ...prev,
        gameFilters: {
          ...prev.gameFilters,
          loading: false,
        },
      }));
      return {
        success: false,
        error: error.message || "Failed to fetch game filters",
        categories: cache.categories,
        providers: cache.providers,
      };
    }
  }, []);

  const fetchGameProviders = useCallback(async (page, limit) => {
    // Get current pagination values - use provided params or fall back to state
    const currentPage = page !== undefined && page !== null ? page : stateRef.current.gameProvider.pagination.currentPage;
    const pageSize = limit !== undefined && limit !== null ? limit : stateRef.current.gameProvider.pagination.pageSize;

    setState((prev) => ({
      ...prev,
      gameProvider: {
        ...prev.gameProvider,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await apiService.getProducts(currentPage, pageSize);
      
      if (response.code === 200 && response.data) {
        // Transform database products to match table format
        const transformedProducts = response.data.map((product, index) => ({
          key: product.id.toString(),
          id: product.id,
          name: product.provider || product.name || `Product ${product.code}`,
          cover: product.image || "/cat.jpg",
          sort: (currentPage - 1) * pageSize + index + 1, // Calculate sort based on pagination
          state: product.enabled !== undefined ? product.enabled : true,
          createTime: product.createdAt 
            ? new Date(product.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).replace(',', '')
            : new Date().toLocaleString(),
          // Additional fields from Product table
          code: product.code,
          provider: product.provider,
          currency: product.currency,
          status: product.status,
          gameType: product.gameType,
          title: product.title,
        }));

        // Extract pagination info from response if available
        const paginationInfo = response.pagination || {};
        const totalItems = paginationInfo.total !== undefined ? paginationInfo.total : transformedProducts.length;

        setState((prev) => ({
          ...prev,
          gameProvider: {
            ...prev.gameProvider,
            dataSource: transformedProducts,
            loading: false,
            error: null,
            pagination: {
              ...prev.gameProvider.pagination,
              totalItems: totalItems,
              currentPage: currentPage,
              pageSize: pageSize,
            },
          },
        }));
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching game providers:', error);
      setState((prev) => ({
        ...prev,
        gameProvider: {
          ...prev.gameProvider,
          loading: false,
          error: error.message || 'Failed to fetch game providers',
        },
      }));
    }
  }, []);

  // Game Store actions
  /**
   * Map backend game data to GameStore table format
   */
  const mapGameStoreData = useCallback((game) => {
    // Use backend-provided ping data if available (fallback to unknown)
    const pingMs =
      typeof game.pingMs === "number" && !Number.isNaN(game.pingMs)
        ? game.pingMs
        : null;
    const pingStatus = game.pingStatus || (typeof pingMs === "number" ? "online" : "unknown");
    
    // Get provider - backend now returns it from Game table
    const provider = game.provider || "-";
    
    // Get category - backend now returns category name from GameCategory table
    // Falls back to gameType if category name is not available
    // Ensure we use the category name (string) not the category ID (number)
    const category = game.category || game.game_type || "-";
    
    // Get game name - use game_name from backend (which comes from database gameName field)
    // The backend sends game_name which is mapped from database gameName
    const gameName = game.game_name || "-";
    
    // Get state - convert status to boolean
    // Status can be "ACTIVATED", "active", "enabled", etc.
    const state = game.status === "ACTIVATED" || 
                  game.status === "active" || 
                  game.status === "enabled" || 
                  game.status === "ACTIVE";
    
    return {
      key: game.game_code || `game-${game.product_id}-${game.game_code}`,
      id: game.id || game.product_id, // Use database game ID if available, fallback to product_id
      gameId: game.id, // Store database game ID separately
      gameCode: game.game_code,
      name: gameName, // GameName from database gameName field via backend game_name
      provider: provider, // Provider from backend Game table
      category: category, // Category name from GameCategory table (or gameType as fallback)
      state: state, // State from status
      status: game.status, // Keep original status
      pingMs: pingMs, // Use backend ping if available
      pingStatus: pingStatus, // Online/offline/unknown based on ping
      inStore: false, // Default to not in store
      gameType: game.game_type,
      productCode: game.product_code,
      imageUrl: game.image_url || "/cat.jpg", // Include image URL for easy access
      inManager: game.inManager || false, // Include inManager field from backend
      fullData: game, // Store full game data
    };
  }, []);

  /**
   * Fetch games for GameStore from backend API
   * @param {number} productCode - Product code (optional)
   * @param {number} page - Page number (optional)
   * @param {number} limit - Page size (optional)
   * @param {string} search - Search term for game name (optional)
   * @param {string} category - Category name filter (optional)
   * @param {string} provider - Provider name filter (optional)
   * @param {string} status - Status filter: "Active", "DeActive", or "All" (optional)
   */
  const fetchGamesForStore = useCallback(async (productCode, page, limit, search, category, provider, status) => {
    const currentPage = page !== undefined && page !== null ? page : stateRef.current.gameStore.pagination.currentPage;
    const pageSize = limit !== undefined && limit !== null ? limit : stateRef.current.gameStore.pagination.pageSize;

    // Set loading state
    setState((prev) => ({
      ...prev,
      gameStore: {
        ...prev.gameStore,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await apiService.getProvidedGames(productCode, currentPage, pageSize, search, category, provider, status);
      
      if (response.data && response.data.provider_games) {
        // Map games to GameStore format with random ping values
        const mappedGames = response.data.provider_games.map(mapGameStoreData);
        
        // Extract pagination info
        const paginationInfo = response.pagination || {};
        const totalItems = paginationInfo.total !== undefined ? paginationInfo.total : mappedGames.length;
        
        setState((prev) => ({
          ...prev,
          gameStore: {
            ...prev.gameStore,
            dataSource: mappedGames,
            loading: false,
            error: null,
            lastUpdated: response.lastUpdated || null,
            lastPing: response.pingCheckedAt || new Date().toISOString(),
            pagination: {
              ...prev.gameStore.pagination,
              totalItems: totalItems,
              currentPage: currentPage,
              pageSize: pageSize,
            },
          },
        }));

        return { success: true, data: mappedGames };
      } else {
        setState((prev) => ({
          ...prev,
          gameStore: {
            ...prev.gameStore,
            dataSource: [],
            loading: false,
            error: null,
            pagination: {
              ...prev.gameStore.pagination,
              totalItems: 0,
            },
          },
        }));

        return { success: true, data: [] };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load games';
      
      setState((prev) => ({
        ...prev,
        gameStore: {
          ...prev.gameStore,
          loading: false,
          error: errorMessage,
          dataSource: [],
        },
      }));

      return { success: false, error: errorMessage };
    }
  }, [mapGameStoreData]);

  const updateGameStoreDataSource = useCallback((dataSource) => {
    setState((prev) => ({
      ...prev,
      gameStore: {
        ...prev.gameStore,
        dataSource,
      },
    }));
  }, []);

  const updateGameStoreItem = useCallback((key, updates) => {
    setState((prev) => ({
      ...prev,
      gameStore: {
        ...prev.gameStore,
        dataSource: prev.gameStore.dataSource.map((item) =>
          item.key === key ? { ...item, ...updates } : item
        ),
      },
    }));
  }, []);

  const addGameStoreItem = useCallback((newItem) => {
    setState((prev) => ({
      ...prev,
      gameStore: {
        ...prev.gameStore,
        dataSource: [...prev.gameStore.dataSource, newItem],
        pagination: {
          ...prev.gameStore.pagination,
          totalItems: prev.gameStore.pagination.totalItems + 1,
        },
      },
    }));
  }, []);

  const deleteGameStoreItem = useCallback((key) => {
    setState((prev) => ({
      ...prev,
      gameStore: {
        ...prev.gameStore,
        dataSource: prev.gameStore.dataSource.filter(
          (item) => item.key !== key
        ),
        pagination: {
          ...prev.gameStore.pagination,
          totalItems: prev.gameStore.pagination.totalItems - 1,
        },
      },
    }));
  }, []);

  const setGameStorePagination = useCallback((pagination) => {
    setState((prev) => ({
      ...prev,
      gameStore: {
        ...prev.gameStore,
        pagination: {
          ...prev.gameStore.pagination,
          ...pagination,
        },
      },
    }));
  }, []);

  const setGameStoreCurrentPage = useCallback((currentPage) => {
    setState((prev) => ({
      ...prev,
      gameStore: {
        ...prev.gameStore,
        pagination: {
          ...prev.gameStore.pagination,
          currentPage,
        },
      },
    }));
  }, []);

  const openGameStoreModal = useCallback((modalType, editingItem = null, itemToDelete = null) => {
    setState((prev) => ({
      ...prev,
      gameStore: {
        ...prev.gameStore,
        modals: {
          ...prev.gameStore.modals,
          [modalType]: true,
          editingItem: editingItem || prev.gameStore.modals.editingItem,
          itemToDelete: itemToDelete || prev.gameStore.modals.itemToDelete,
        },
      },
    }));
  }, []);

  const closeGameStoreModal = useCallback((modalType) => {
    setState((prev) => ({
      ...prev,
      gameStore: {
        ...prev.gameStore,
        modals: {
          ...prev.gameStore.modals,
          [modalType]: false,
          editingItem: modalType === "isAddEditModalOpen" ? null : prev.gameStore.modals.editingItem,
          itemToDelete: modalType === "isDeleteModalOpen" ? null : prev.gameStore.modals.itemToDelete,
        },
      },
    }));
  }, []);

  // Game Tags actions
  const updateGameTagsDataSource = useCallback((dataSource) => {
    setState((prev) => ({
      ...prev,
      gameTags: {
        ...prev.gameTags,
        dataSource,
      },
    }));
  }, []);

  const updateGameTagsItem = useCallback((key, updates) => {
    setState((prev) => ({
      ...prev,
      gameTags: {
        ...prev.gameTags,
        dataSource: prev.gameTags.dataSource.map((item) =>
          item.key === key ? { ...item, ...updates } : item
        ),
      },
    }));
  }, []);

  const addGameTagsItem = useCallback((newItem) => {
    setState((prev) => ({
      ...prev,
      gameTags: {
        ...prev.gameTags,
        dataSource: [...prev.gameTags.dataSource, newItem],
        pagination: {
          ...prev.gameTags.pagination,
          totalItems: prev.gameTags.pagination.totalItems + 1,
        },
      },
    }));
  }, []);

  const deleteGameTagsItem = useCallback((key) => {
    setState((prev) => ({
      ...prev,
      gameTags: {
        ...prev.gameTags,
        dataSource: prev.gameTags.dataSource.filter(
          (item) => item.key !== key
        ),
        pagination: {
          ...prev.gameTags.pagination,
          totalItems: prev.gameTags.pagination.totalItems - 1,
        },
      },
    }));
  }, []);

  const setGameTagsPagination = useCallback((pagination) => {
    setState((prev) => ({
      ...prev,
      gameTags: {
        ...prev.gameTags,
        pagination: {
          ...prev.gameTags.pagination,
          ...pagination,
        },
      },
    }));
  }, []);

  const setGameTagsCurrentPage = useCallback((currentPage) => {
    setState((prev) => ({
      ...prev,
      gameTags: {
        ...prev.gameTags,
        pagination: {
          ...prev.gameTags.pagination,
          currentPage,
        },
      },
    }));
  }, []);

  const openGameTagsAddEditModal = useCallback((editingItem = null) => {
    setState((prev) => ({
      ...prev,
      gameTags: {
        ...prev.gameTags,
        modals: {
          ...prev.gameTags.modals,
          isAddEditModalOpen: true,
          editingItem,
        },
      },
    }));
  }, []);

  const closeGameTagsAddEditModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gameTags: {
        ...prev.gameTags,
        modals: {
          ...prev.gameTags.modals,
          isAddEditModalOpen: false,
          editingItem: null,
        },
      },
    }));
  }, []);

  const openGameTagsDeleteModal = useCallback((itemToDelete = null) => {
    setState((prev) => ({
      ...prev,
      gameTags: {
        ...prev.gameTags,
        modals: {
          ...prev.gameTags.modals,
          isDeleteModalOpen: true,
          itemToDelete,
        },
      },
    }));
  }, []);

  const closeGameTagsDeleteModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gameTags: {
        ...prev.gameTags,
        modals: {
          ...prev.gameTags.modals,
          isDeleteModalOpen: false,
          itemToDelete: null,
        },
      },
    }));
  }, []);

  const confirmDeleteGameTagsItem = useCallback(() => {
    setState((prev) => {
      const itemToDelete = prev.gameTags.modals.itemToDelete;
      if (itemToDelete) {
        return {
          ...prev,
          gameTags: {
            ...prev.gameTags,
            dataSource: prev.gameTags.dataSource.filter(
              (item) => item.key !== itemToDelete.key
            ),
            pagination: {
              ...prev.gameTags.pagination,
              totalItems: prev.gameTags.pagination.totalItems - 1,
            },
            modals: {
              ...prev.gameTags.modals,
              isDeleteModalOpen: false,
              itemToDelete: null,
            },
          },
        };
      }
      return prev;
    });
  }, []);

  // Game Manager actions
  const setGameManagerPagination = useCallback((pagination) => {
    setState((prev) => ({
      ...prev,
      gameManager: {
        ...prev.gameManager,
        pagination: {
          ...prev.gameManager.pagination,
          ...pagination,
        },
      },
    }));
  }, []);

  const setGameManagerCurrentPage = useCallback((currentPage) => {
    setState((prev) => ({
      ...prev,
      gameManager: {
        ...prev.gameManager,
        pagination: {
          ...prev.gameManager.pagination,
          currentPage,
        },
      },
    }));
  }, []);

  /**
   * Map backend game data to frontend format
   * This function processes raw backend data and converts it to the format expected by components
   */
  const mapGameData = useCallback((game) => {
    // Extract language names from lang_name (could be object or string)
    const rawGameName = game.extra_gameName || game.game_name;
    const rawLangName = game.extra_langName || game.lang_name;
    let cnName = rawGameName;
    let enName = rawGameName;
    
    if (rawLangName) {
      if (typeof rawLangName === 'object') {
        // Extract using language codes: 0 = English, 2 = Simplify Chinese
        // Fallback to old format for backward compatibility
        cnName = rawLangName['2'] || rawLangName[2] || rawLangName.zh || rawLangName.ZH || rawLangName['zh-CN'] || rawGameName;
        enName = rawLangName['0'] || rawLangName[0] || rawLangName.en || rawLangName.EN || rawLangName['en-US'] || rawGameName;
      } else if (typeof rawLangName === 'string') {
        // If it's a string, try to parse it
        try {
          const langObj = JSON.parse(rawLangName);
          // Extract using language codes: 0 = English, 2 = Simplify Chinese
          // Fallback to old format for backward compatibility
          cnName = langObj['2'] || langObj[2] || langObj.zh || langObj.ZH || langObj['zh-CN'] || rawGameName;
          enName = langObj['0'] || langObj[0] || langObj.en || langObj.EN || langObj['en-US'] || rawGameName;
        } catch (e) {
          // If parsing fails, use rawGameName for both
          cnName = rawGameName;
          enName = rawGameName;
        }
      }
    }
    
    return {
      key: game.game_code || `game-${game.product_id}-${game.game_code}`,
      id: game.id || game.product_id, // Use database game ID if available
      gameId: game.id, // Store database game ID separately
      gameCode: game.game_code,
      gameName: rawGameName,
      image: game.extra_imageUrl || game.image_url || "/cat.jpg", // Use extra_imageUrl first
      cnName: cnName,
      enName: enName,
      gameType: game.game_type,
      productCode: game.product_code,
      status: game.status,
      provider: game.extra_provider || game.provider || null, // Prefer extra_provider for display/filtering
      category: game.extra_gameType || game.category || game.game_type || null, // Prefer extra_gameType for display/filtering
      extra_provider: game.extra_provider || game.provider || null, // Include extra_provider for modal display
      extra_gameType: game.extra_gameType || game.game_type || null, // Include extra_gameType for modal display
      // Store full game data for edit modal
      fullData: game,
    };
  }, []);

  /**
   * Fetch games in manager from backend API
   * @param {number} page - Page number (default: uses current page from state)
   * @param {number} limit - Number of games per page (default: uses pageSize from state)
   * @param {string} search - Search term (optional)
   * @param {string} categoryId - Category ID filter (optional)
   * @param {string} providerId - Provider ID filter (optional)
   * @param {string} status - Status filter (optional)
   */
  const fetchGamesInManager = useCallback(async (page, limit, search, categoryId, providerId, status, startDate, endDate) => {
    const currentPage = page !== undefined && page !== null ? page : stateRef.current.gameManager.pagination.currentPage;
    const pageSize = limit !== undefined && limit !== null ? limit : stateRef.current.gameManager.pagination.pageSize;

    // Set loading state
    setState((prev) => ({
      ...prev,
      gameManager: {
        ...prev.gameManager,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await apiService.getGamesInManager(
        currentPage,
        pageSize,
        search,
        categoryId,
        providerId,
        status,
        startDate,
        endDate
      );
      
      // Process backend data
      if (response.success && response.data) {
        const mappedGames = response.data.map(mapGameData);
        
        // Extract pagination info from response
        const paginationInfo = response.meta || {};
        const totalItems = paginationInfo.total !== undefined ? paginationInfo.total : mappedGames.length;
        
        // Update selectedGameKeys based on fetched games
        const selectedKeys = mappedGames.map(game => game.key);
        
        setState((prev) => ({
          ...prev,
          gameManager: {
            ...prev.gameManager,
            dataSource: mappedGames,
            selectedGameKeys: selectedKeys,
            loading: false,
            error: null,
            pagination: {
              ...prev.gameManager.pagination,
              totalItems: totalItems,
              currentPage: currentPage,
              pageSize: pageSize,
            },
          },
        }));

        gameManagerFiltersRef.current = {
          search,
          categoryId,
          providerId,
          status,
          startDate,
          endDate,
        };

        return { success: true, data: mappedGames };
      } else {
        setState((prev) => ({
          ...prev,
          gameManager: {
            ...prev.gameManager,
            dataSource: [],
            selectedGameKeys: [],
            loading: false,
            error: null,
            pagination: {
              ...prev.gameManager.pagination,
              totalItems: 0,
            },
          },
        }));

        return { success: true, data: [] };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load games in manager';
      
      setState((prev) => ({
        ...prev,
        gameManager: {
          ...prev.gameManager,
          loading: false,
          error: errorMessage,
          dataSource: [],
          selectedGameKeys: [],
        },
      }));

      return { success: false, error: errorMessage };
    }
  }, [mapGameData]);

  /**
   * Fetch games from backend API
   * This function handles all backend communication and data processing
   * @param {number} productCode - Optional product code (if not provided, fetches all games)
   * @param {number} page - Page number (default: uses current page from state)
   * @param {number} limit - Number of games per page (default: uses pageSize from state)
   */
  const fetchGames = useCallback(async (productCode, page, limit) => {
    // Get current pagination values - use provided params or fall back to state
    const currentPage = page !== undefined && page !== null ? page : stateRef.current.gameManager.pagination.currentPage;
    const pageSize = limit !== undefined && limit !== null ? limit : stateRef.current.gameManager.pagination.pageSize;

    // Set loading state
    setState((prev) => ({
      ...prev,
      gameManager: {
        ...prev.gameManager,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await apiService.getProviderGames(productCode, currentPage, pageSize);
      
      // Process backend data
      if (response.data && response.data.provider_games) {
        const mappedGames = response.data.provider_games.map(mapGameData);
        
        // Frontend deduplication safety layer - remove duplicates by gameCode
        const uniqueGamesMap = new Map();
        for (const game of mappedGames) {
          // Use gameCode as the unique identifier (it's set in mapGameData from game.game_code)
          const gameCode = game.gameCode;
          if (gameCode && !uniqueGamesMap.has(gameCode)) {
            uniqueGamesMap.set(gameCode, game);
          }
        }
        const uniqueGames = Array.from(uniqueGamesMap.values());
        
        // Extract pagination info from response if available
        const paginationInfo = response.pagination || {};
        const totalItems = paginationInfo.total !== undefined ? paginationInfo.total : uniqueGames.length;
        
        // Always use the currentPage we requested, not the one from response
        setState((prev) => ({
          ...prev,
          gameManager: {
            ...prev.gameManager,
            dataSource: uniqueGames,
            loading: false,
            error: null,
            pagination: {
              ...prev.gameManager.pagination,
              totalItems: totalItems,
              currentPage: currentPage, // Use the page we requested
              pageSize: pageSize,
            },
          },
        }));

        return { success: true, data: uniqueGames };
      } else {
        setState((prev) => ({
          ...prev,
          gameManager: {
            ...prev.gameManager,
            dataSource: [],
            loading: false,
            error: null,
            pagination: {
              ...prev.gameManager.pagination,
              totalItems: 0,
            },
          },
        }));

        return { success: true, data: [] };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load games';
      
      setState((prev) => ({
        ...prev,
        gameManager: {
          ...prev.gameManager,
          loading: false,
          error: errorMessage,
          dataSource: [],
        },
      }));

      return { success: false, error: errorMessage };
    }
  }, [mapGameData]);

  /**
   * Update game manager data source
   */
  const updateGameManagerDataSource = useCallback((dataSource) => {
    setState((prev) => ({
      ...prev,
      gameManager: {
        ...prev.gameManager,
        dataSource,
        pagination: {
          ...prev.gameManager.pagination,
          totalItems: dataSource.length,
        },
      },
    }));
  }, []);

  /**
   * Update a single game item
   */
  const updateGameManagerItem = useCallback((key, updates) => {
    setState((prev) => ({
      ...prev,
      gameManager: {
        ...prev.gameManager,
        dataSource: prev.gameManager.dataSource.map((item) =>
          item.key === key ? { ...item, ...updates } : item
        ),
      },
    }));
  }, []);

  /**
   * Add a new game item
   */
  const addGameManagerItem = useCallback((newItem) => {
    setState((prev) => ({
      ...prev,
      gameManager: {
        ...prev.gameManager,
        dataSource: [...prev.gameManager.dataSource, newItem],
        pagination: {
          ...prev.gameManager.pagination,
          totalItems: prev.gameManager.dataSource.length + 1,
        },
      },
    }));
  }, []);

  /**
   * Delete a game item
   */
  const deleteGameManagerItem = useCallback((key) => {
    setState((prev) => {
      const newDataSource = prev.gameManager.dataSource.filter(
        (item) => item.key !== key
      );
      const newSelectedKeys = prev.gameManager.selectedGameKeys.filter(
        (gameKey) => gameKey !== key
      );

      // Save to localStorage
      saveSelectedGamesToStorage(newDataSource, newSelectedKeys);

      return {
        ...prev,
        gameManager: {
          ...prev.gameManager,
          dataSource: newDataSource,
          selectedGameKeys: newSelectedKeys,
          _persistedGames: newDataSource,
          pagination: {
            ...prev.gameManager.pagination,
            totalItems: newDataSource.length,
          },
        },
      };
    });
  }, []);

  /**
   * Add a game to gameManager from gameStore
   */
  const addGameToManager = useCallback(async (gameItem) => {
    // Get the database game ID
    const gameId = gameItem.gameId || gameItem.fullData?.id || gameItem.id;
    
    if (!gameId) {
      console.error('Cannot add game to manager: game ID not found', gameItem);
      return;
    }

    // Optimistically update the UI immediately (button state change)
    setState((prev) => {
      const updatedGameStore = prev.gameStore.dataSource.map((game) => {
        if (game.key === gameItem.key) {
          return {
            ...game,
            inManager: true,
          };
        }
        return game;
      });

      return {
        ...prev,
        gameStore: {
          ...prev.gameStore,
          dataSource: updatedGameStore,
        },
      };
    });

    try {
      // Update the game in the database
      await apiService.updateGameInManager(gameId, true);

      // Refresh the game manager list from the API to get accurate data including correct images
      const currentPage = stateRef.current.gameManager.pagination.currentPage;
      const pageSize = stateRef.current.gameManager.pagination.pageSize;
      const filters = gameManagerFiltersRef.current;
      await fetchGamesInManager(
        currentPage,
        pageSize,
        filters.search,
        filters.categoryId,
        filters.providerId,
        filters.status,
        filters.startDate,
        filters.endDate
      );
    } catch (error) {
      console.error('Failed to add game to manager:', error);
      
      // Revert the optimistic update on error
      setState((prev) => {
        const updatedGameStore = prev.gameStore.dataSource.map((game) => {
          if (game.key === gameItem.key) {
            return {
              ...game,
              inManager: false,
            };
          }
          return game;
        });

        return {
          ...prev,
          gameStore: {
            ...prev.gameStore,
            dataSource: updatedGameStore,
          },
        };
      });
      
      // You might want to show an error message to the user here
    }
  }, [fetchGamesInManager]);

  /**
   * Remove a game from gameManager
   */
  const removeGameFromManager = useCallback(async (gameKey) => {
    // Find the game in the current state to get its database ID
    const game = state.gameManager.dataSource.find(item => item.key === gameKey);
    const gameId = game?.gameId || game?.fullData?.id || game?.id;

    if (!gameId) {
      console.error('Cannot remove game from manager: game ID not found', gameKey);
      return;
    }

    // Also find the game in game store to update its button state
    const gameStoreItem = state.gameStore.dataSource.find(item => item.key === gameKey);

    // Optimistically update the UI immediately (button state change)
    if (gameStoreItem) {
      setState((prev) => {
        const updatedGameStore = prev.gameStore.dataSource.map((game) => {
          if (game.key === gameKey) {
            return {
              ...game,
              inManager: false,
            };
          }
          return game;
        });

        return {
          ...prev,
          gameStore: {
            ...prev.gameStore,
            dataSource: updatedGameStore,
          },
        };
      });
    }

    try {
      // Update the game in the database
      await apiService.updateGameInManager(gameId, false);

      // Refresh the game manager list from the API to get accurate data
      const currentPage = stateRef.current.gameManager.pagination.currentPage;
      const pageSize = stateRef.current.gameManager.pagination.pageSize;
      const filters = gameManagerFiltersRef.current;
      await fetchGamesInManager(
        currentPage,
        pageSize,
        filters.search,
        filters.categoryId,
        filters.providerId,
        filters.status,
        filters.startDate,
        filters.endDate
      );
    } catch (error) {
      console.error('Failed to remove game from manager:', error);
      
      // Revert the optimistic update on error
      if (gameStoreItem) {
        setState((prev) => {
          const updatedGameStore = prev.gameStore.dataSource.map((game) => {
            if (game.key === gameKey) {
              return {
                ...game,
                inManager: true,
              };
            }
            return game;
          });

          return {
            ...prev,
            gameStore: {
              ...prev.gameStore,
              dataSource: updatedGameStore,
            },
          };
        });
      }
      
      // You might want to show an error message to the user here
    }
  }, [state.gameManager.dataSource, state.gameStore.dataSource, fetchGamesInManager]);

  /**
   * Check if a game is in gameManager
   * Uses state directly for better reactivity, or checks inManager field from game data
   */
  const isGameInManager = useCallback((gameKey, gameItem = null) => {
    // First check the inManager field from the game data if available
    if (gameItem?.inManager !== undefined) {
      return gameItem.inManager;
    }
    // Fallback to checking selectedGameKeys
    return state.gameManager.selectedGameKeys.includes(gameKey);
  }, [state.gameManager.selectedGameKeys]);

  // Generic actions for other game modules (can be extended)
  const updateModuleDataSource = useCallback((moduleName, dataSource) => {
    setState((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        dataSource,
      },
    }));
  }, []);

  const setModulePagination = useCallback((moduleName, pagination) => {
    setState((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        pagination: {
          ...prev[moduleName].pagination,
          ...pagination,
        },
      },
    }));
  }, []);

  const openModuleModal = useCallback(
    (moduleName, modalType, editingItem = null) => {
      setState((prev) => ({
        ...prev,
        [moduleName]: {
          ...prev[moduleName],
          modals: {
            ...prev[moduleName].modals,
            [modalType]: true,
            editingItem,
          },
        },
      }));
    },
    []
  );

  const closeModuleModal = useCallback((moduleName, modalType) => {
    setState((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        modals: {
          ...prev[moduleName].modals,
          [modalType]: false,
          editingItem: null,
        },
      },
    }));
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  // Only recreate when state or callbacks change (callbacks are already memoized with useCallback)
  const value = useMemo(() => ({
    // State
    state,

    // Sidebar actions
    setSelectedKey,
    toggleMenuExpanded,

    // Game Category actions
    updateGameCategoryDataSource,
    updateGameCategoryItem,
    addGameCategoryItem,
    deleteGameCategoryItem,
    setGameCategoryPagination,
    setGameCategoryCurrentPage,
    openGameCategoryAddEditModal,
    closeGameCategoryAddEditModal,
    openGameCategoryDeleteModal,
    closeGameCategoryDeleteModal,
    confirmDeleteGameCategoryItem,
    fetchGameCategories,

    // Game Provider actions
    updateGameProviderItem,
    addGameProviderItem,
    setGameProviderCurrentPage,
    openGameProviderAddEditModal,
    closeGameProviderAddEditModal,
    openGameProviderDeleteModal,
    closeGameProviderDeleteModal,
    confirmDeleteGameProviderItem,
    fetchGameProviders,

    // Game Store actions
    fetchGamesForStore,
    updateGameStoreDataSource,
    updateGameStoreItem,
    addGameStoreItem,
    deleteGameStoreItem,
    setGameStorePagination,
    setGameStoreCurrentPage,
    openGameStoreModal,
    closeGameStoreModal,

    // Game Tags actions
    updateGameTagsDataSource,
    updateGameTagsItem,
    addGameTagsItem,
    deleteGameTagsItem,
    setGameTagsPagination,
    setGameTagsCurrentPage,
    openGameTagsAddEditModal,
    closeGameTagsAddEditModal,
    openGameTagsDeleteModal,
    closeGameTagsDeleteModal,
    confirmDeleteGameTagsItem,

    // Game Manager actions
    setGameManagerPagination,
    setGameManagerCurrentPage,
    fetchGames,
    fetchGamesInManager,
    updateGameManagerDataSource,
    updateGameManagerItem,
    addGameManagerItem,
    deleteGameManagerItem,
    addGameToManager,
    removeGameFromManager,
    isGameInManager,

    // Generic module actions
    updateModuleDataSource,
    setModulePagination,
    openModuleModal,
    closeModuleModal,

    // Dropdown data cache
    fetchDropdownData,
    refreshProvidersInCache,
    fetchGameFilters,
  }), [
    state,
    setSelectedKey,
    toggleMenuExpanded,
    updateGameCategoryDataSource,
    updateGameCategoryItem,
    addGameCategoryItem,
    deleteGameCategoryItem,
    setGameCategoryPagination,
    setGameCategoryCurrentPage,
    openGameCategoryAddEditModal,
    closeGameCategoryAddEditModal,
    openGameCategoryDeleteModal,
    closeGameCategoryDeleteModal,
    confirmDeleteGameCategoryItem,
    fetchGameCategories,
    updateGameProviderItem,
    addGameProviderItem,
    setGameProviderCurrentPage,
    openGameProviderAddEditModal,
    closeGameProviderAddEditModal,
    openGameProviderDeleteModal,
    closeGameProviderDeleteModal,
    confirmDeleteGameProviderItem,
    fetchGameProviders,
    fetchGamesForStore,
    updateGameStoreDataSource,
    updateGameStoreItem,
    addGameStoreItem,
    deleteGameStoreItem,
    setGameStorePagination,
    setGameStoreCurrentPage,
    openGameStoreModal,
    closeGameStoreModal,
    updateGameTagsDataSource,
    updateGameTagsItem,
    addGameTagsItem,
    deleteGameTagsItem,
    setGameTagsPagination,
    setGameTagsCurrentPage,
    openGameTagsAddEditModal,
    closeGameTagsAddEditModal,
    openGameTagsDeleteModal,
    closeGameTagsDeleteModal,
    confirmDeleteGameTagsItem,
    setGameManagerPagination,
    setGameManagerCurrentPage,
    fetchGames,
    fetchGamesInManager,
    updateGameManagerDataSource,
    updateGameManagerItem,
    addGameManagerItem,
    deleteGameManagerItem,
    addGameToManager,
    removeGameFromManager,
    isGameInManager,
    updateModuleDataSource,
    setModulePagination,
    openModuleModal,
    closeModuleModal,
    fetchDropdownData,
    refreshProvidersInCache,
    fetchGameFilters,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// Export default context for direct access if needed
export default AppContext;