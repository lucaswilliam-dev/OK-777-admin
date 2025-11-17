import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import apiService from "../services/api";

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
    dataSource: initialSelectedGames.games, // Initialize with persisted games
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      pageSize: 21,
      totalItems: initialSelectedGames.games.length, // Set total items from persisted games
    },
    modals: {
      isAddEditModalOpen: false,
      isDeleteModalOpen: false,
      editingItem: null,
      itemToDelete: null,
    },
    // Track which games are added to gameManager (using game keys as array)
    selectedGameKeys: initialSelectedGames.keys,
    // Store the actual game data for persistence
    _persistedGames: initialSelectedGames.games,
  },

  // Game Store
  gameStore: {
    dataSource: [],
    loading: false,
    error: null,
    lastUpdated: null,
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
};

// Context Provider Component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  // Use ref to track current state for synchronous access in callbacks
  const stateRef = useRef(state);
  
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

  const updateGameCategoryItem = useCallback((key, updates) => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        dataSource: prev.gameCategory.dataSource.map((item) =>
          item.key === key ? { ...item, ...updates } : item
        ),
      },
    }));
  }, []);

  const addGameCategoryItem = useCallback((newItem) => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        dataSource: [...prev.gameCategory.dataSource, newItem],
        pagination: {
          ...prev.gameCategory.pagination,
          totalItems: prev.gameCategory.pagination.totalItems + 1,
        },
      },
    }));
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

  const openGameCategoryDeleteModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gameCategory: {
        ...prev.gameCategory,
        modals: {
          ...prev.gameCategory.modals,
          isDeleteModalOpen: true,
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

  const confirmDeleteGameCategoryItem = useCallback(() => {
    setState((prev) => {
      const itemToDelete = prev.gameCategory.modals.itemToDelete;
      if (itemToDelete) {
        return {
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
        };
      }
      return prev;
    });
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
          icon: "",
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
  const updateGameProviderItem = useCallback((key, updates) => {
    setState((prev) => ({
      ...prev,
      gameProvider: {
        ...prev.gameProvider,
        dataSource: prev.gameProvider.dataSource.map((item) =>
          item.key === key ? { ...item, ...updates } : item
        ),
      },
    }));
  }, []);

  const addGameProviderItem = useCallback((newItem) => {
    setState((prev) => ({
      ...prev,
      gameProvider: {
        ...prev.gameProvider,
        dataSource: [...prev.gameProvider.dataSource, newItem],
        pagination: {
          ...prev.gameProvider.pagination,
          totalItems: prev.gameProvider.pagination.totalItems + 1,
        },
      },
    }));
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

  const confirmDeleteGameProviderItem = useCallback(() => {
    setState((prev) => {
      const itemToDelete = prev.gameProvider.modals.itemToDelete;
      if (itemToDelete) {
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
      }
      return prev;
    });
  }, []);

  // Fetch game providers (products) from database
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
    // Generate random ping value between 20-350ms
    const randomPing = Math.floor(Math.random() * 330) + 20;
    const pingStatus = randomPing < 300 ? "online" : "offline";
    
    // Get provider - backend now returns it from Game table
    const provider = game.provider || "-";
    
    // Get category - backend now returns category name from GameCategory table
    // Falls back to gameType if category name is not available
    const category = game.category || game.game_type || "-";
    
    // Get state - convert status to boolean
    // Status can be "ACTIVATED", "active", "enabled", etc.
    const state = game.status === "ACTIVATED" || 
                  game.status === "active" || 
                  game.status === "enabled" || 
                  game.status === "ACTIVE";
    
    return {
      key: game.game_code || `game-${game.product_id}-${game.game_code}`,
      id: game.product_id,
      gameCode: game.game_code,
      name: game.game_name, // GameName
      provider: provider, // Provider from backend Game table
      category: category, // Category name from GameCategory table (or gameType as fallback)
      state: state, // State from status
      status: game.status, // Keep original status
      pingMs: randomPing, // Random ping value
      pingStatus: pingStatus, // Online/offline based on ping
      inStore: false, // Default to not in store
      gameType: game.game_type,
      productCode: game.product_code,
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
   */
  const fetchGamesForStore = useCallback(async (productCode, page, limit, search, category, provider) => {
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
      const response = await apiService.getProvidedGames(productCode, currentPage, pageSize, search, category, provider);
      
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
    let cnName = game.game_name;
    let enName = game.game_name;
    
    if (game.lang_name) {
      if (typeof game.lang_name === 'object') {
        cnName = game.lang_name.zh || game.lang_name.ZH || game.lang_name['zh-CN'] || game.game_name;
        enName = game.lang_name.en || game.lang_name.EN || game.lang_name['en-US'] || game.game_name;
      } else if (typeof game.lang_name === 'string') {
        // If it's a string, try to parse it
        try {
          const langObj = JSON.parse(game.lang_name);
          cnName = langObj.zh || langObj.ZH || langObj['zh-CN'] || game.game_name;
          enName = langObj.en || langObj.EN || langObj['en-US'] || game.game_name;
        } catch (e) {
          // If parsing fails, use game_name for both
          cnName = game.game_name;
          enName = game.game_name;
        }
      }
    }
    
    return {
      key: game.game_code || `game-${game.product_id}-${game.game_code}`,
      id: game.product_id,
      gameCode: game.game_code,
      gameName: game.game_name,
      image: game.image_url || "/cat.jpg",
      cnName: cnName,
      enName: enName,
      gameType: game.game_type,
      productCode: game.product_code,
      status: game.status,
      provider: game.provider || null, // Include provider from backend
      category: game.category || game.game_type || null, // Include category name from backend
      // Store full game data for edit modal
      fullData: game,
    };
  }, []);

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
  const addGameToManager = useCallback((gameItem) => {
    setState((prev) => {
      // Check if game is already in manager
      if (prev.gameManager.selectedGameKeys.includes(gameItem.key)) {
        return prev; // Already added, do nothing
      }

      // Map gameStore item to gameManager format
      // Get image URL from fullData or directly from gameItem
      let imageUrl = "/cat.jpg";
      if (gameItem.fullData?.image_url) {
        imageUrl = gameItem.fullData.image_url;
      } else if (gameItem.fullData?.imageUrl) {
        imageUrl = gameItem.fullData.imageUrl;
      } else if (gameItem.imageUrl) {
        imageUrl = gameItem.imageUrl;
      }

      const managerGame = {
        key: gameItem.key,
        id: gameItem.id,
        gameCode: gameItem.gameCode,
        gameName: gameItem.name,
        image: imageUrl,
        cnName: gameItem.name,
        enName: gameItem.name,
        gameType: gameItem.gameType,
        productCode: gameItem.productCode,
        status: gameItem.status,
        provider: gameItem.provider,
        category: gameItem.category,
        fullData: gameItem.fullData || gameItem,
      };

      const newDataSource = [...prev.gameManager.dataSource, managerGame];
      const newSelectedKeys = [...prev.gameManager.selectedGameKeys, gameItem.key];

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
   * Remove a game from gameManager
   */
  const removeGameFromManager = useCallback((gameKey) => {
    setState((prev) => {
      const newDataSource = prev.gameManager.dataSource.filter(
        (item) => item.key !== gameKey
      );
      const newSelectedKeys = prev.gameManager.selectedGameKeys.filter(
        (key) => key !== gameKey
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
   * Check if a game is in gameManager
   * Uses state directly for better reactivity
   */
  const isGameInManager = useCallback((gameKey) => {
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

  const value = {
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
  };

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
