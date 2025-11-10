import React, { createContext, useContext, useState, useCallback } from "react";

// Create the App Context
const AppContext = createContext(null);

// Initial state
const initialState = {
  // Navigation/Sidebar
  sidebar: {
    selectedKey: "game-category",
    isMenuExpanded: true,
  },

  // Game Category
  gameCategory: {
    dataSource: [
      {
        key: "1",
        id: 23,  
        name: "Slot",
        icon: "/logo512.png",
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "2",
        id: 25,
        name: "LiveCasino",
        icon: "/logo512.png",
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "3",
        id: 46,
        name: "CryptoGames",
        icon: "/logo512.png",
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "4",
        id: 577,
        name: "TableGames",
        icon: "/logo512.png",
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "5",
        id: 578,
        name: "Sport",
        icon: "/logo512.png",
        state: true,
        createTime: "2021-02-28 10:30",
      },
      
    ],  
    pagination: {
      currentPage: 51,
      pageSize: 10,
      totalItems: 658,
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
    dataSource: [
      {
        key: "1",
        id: 23,
        name: "ag",
        cover: "/cat.jpg",
        sort: 1,
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "2",
        id: 25,
        name: "allbet",
        cover: "/cat.jpg",
        sort: 2,
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "3",
        id: 46,
        name: "ap",
        cover: "/cat.jpg",
        sort: 3,
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "4",
        id: 577,
        name: "bbin",
        cover: "/cat.jpg",
        sort: 4,
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "5",
        id: 23,
        name: "bg",
        cover: "/cat.jpg",
        sort: 5,
        state: true,
        createTime: "2021-02-28 10:30",
      },
    ],
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalItems: 5,
    },
    modals: {
      isAddEditModalOpen: false,
      isDeleteModalOpen: false,
      editingItem: null,
      itemToDelete: null,
    },
  },

  // Game Manager (for future use)
  gameManager: {
    dataSource: [],
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

  // Game Store (for future use)
  gameStore: {
    dataSource: [],
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

  // Game Tags (for future use)
  gameTags: {
    dataSource: [],
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
};

// Context Provider Component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

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
        dataSource: prev.gameCategory.dataSource.filter((item) => item.key !== key),
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

  const openModuleModal = useCallback((moduleName, modalType, editingItem = null) => {
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
  }, []);

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

    // Game Provider actions
    updateGameProviderItem,
    addGameProviderItem,
    setGameProviderCurrentPage,
    openGameProviderAddEditModal,
    closeGameProviderAddEditModal,
    openGameProviderDeleteModal,
    closeGameProviderDeleteModal,
    confirmDeleteGameProviderItem,

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

