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

  // Game Manager
  gameManager: {
    dataSource: [],
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

  // Game Store
  gameStore: {
    dataSource: [
      {
        key: "1",
        id: 23,
        name: "Slot Game 1",
        provider: "ag",
        category: "Live",
        pingMs: 60,
        pingStatus: "online",
        inStore: false,
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "2",
        id: 25,
        name: "Slot Game 2",
        provider: "allbet",
        category: "Slot",
        pingMs: 110,
        pingStatus: "online",
        inStore: true,
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "3",
        id: 46,
        name: "Slot Game 3",
        provider: "ap",
        category: "Lottery",
        pingMs: 300,
        pingStatus: "online",
        inStore: true,
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "4",
        id: 577,
        name: "Slot Game 4",
        provider: "bbin",
        category: "Sports",
        pingMs: undefined,
        pingStatus: "offline",
        inStore: false,
        state: true,
        createTime: "2021-02-28 10:30",
      },
      {
        key: "5",
        id: 578,
        name: "Slot Game 5",
        provider: "bg",
        category: "Fishing",
        pingMs: undefined,
        pingStatus: "offline",
        inStore: true,
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

  // Game Store actions
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

    // Game Provider actions
    updateGameProviderItem,
    addGameProviderItem,
    setGameProviderCurrentPage,
    openGameProviderAddEditModal,
    closeGameProviderAddEditModal,
    openGameProviderDeleteModal,
    closeGameProviderDeleteModal,
    confirmDeleteGameProviderItem,

    // Game Store actions
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
