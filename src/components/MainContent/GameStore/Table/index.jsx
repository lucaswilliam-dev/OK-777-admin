import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Table as AntTable, Button, Pagination, Input, Select, Spin, message } from "antd";
import { SearchOutlined, UploadOutlined } from "@ant-design/icons";
import AddOrEditModal from "../../../Modal/AddOrEditModal";
import DeleteModal from "../../../Modal/DeleteModal";
import StoreUpdate from "../../../Modal/StoreUpdate";
import StorePing from "../../../Modal/StorePing";
import StoreAdd from "../../../Modal/StoreAdd";
import StoreMove from "../../../Modal/StoreMove";
import { useAppContext } from "../../../../contexts";
import api from "../../../../services/api";
import "./style.css";

const STATUS_LABELS = {
  ACTIVATED: "Active",
  DEACTIVATED: "Deactive",
};

const Table = () => {
  const {
    state,
    updateGameStoreItem,
    addGameStoreItem,
    deleteGameStoreItem,
    openGameStoreModal,
    closeGameStoreModal,
    fetchGamesForStore,
    addGameToManager,
    removeGameFromManager,
    isGameInManager,
    fetchGameFilters: fetchGameFiltersFromContext,
  } = useAppContext();

  const { dataSource, pagination, modals, loading, error, lastUpdated, lastPing } = state.gameStore;
  const { currentPage, pageSize, totalItems } = pagination;
  const {
    isAddEditModalOpen,
    isDeleteModalOpen,
    isUpdateModalOpen,
    isPingModalOpen,
    isAddModalOpen,
    isMoveModalOpen,
    editingItem,
    itemToDelete,
  } = modals;

  const [gameName, setGameName] = useState("");
  const [category, setCategory] = useState("All");
  const [provider, setProvider] = useState("All");
  const [tags] = useState(["Hot", "New"]);
  const [dateRange] = useState(null);
  const [visibility] = useState(["EN", "ZH"]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [pingFilter, setPingFilter] = useState("All");
  
  // Store current search filters to preserve them during pagination
  const [currentSearchFilters, setCurrentSearchFilters] = useState({
    search: undefined,
    category: undefined,
    provider: undefined,
  });

  // Use ref to track if initial fetch has been done
  const hasFetchedRef = useRef(false);

  // Fetch games from backend when component mounts
  useEffect(() => {
    if (!hasFetchedRef.current && dataSource.length === 0 && !loading) {
      hasFetchedRef.current = true;
      const loadGames = async () => {
        const result = await fetchGamesForStore(
          undefined, // productCode
          currentPage, // page
          pageSize, // limit
          undefined, // search
          undefined, // category
          undefined, // provider
          undefined // status - fetch all games initially
        );
        if (!result.success) {
          message.error(
            result.error ||
              "Failed to load games. Please check if the backend is running."
          );
        }
      };
      loadGames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateTime = useCallback((value) => {
    if (!value) return "N/A";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes} ${seconds}`;
  }, []);

  // Apply filters function (used by both search button and dropdown changes)
  const applyFilters = useCallback(async (resetPage = true) => {
    // Store current search filters
    const searchFilters = {
      search: gameName.trim() || undefined,
      category: category !== "All" ? category : undefined,
      provider: provider !== "All" ? provider : undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
    };
    setCurrentSearchFilters(searchFilters);
    
    // Reset to page 1 when filtering, or use current page if just updating
    const targetPage = resetPage ? 1 : currentPage;
    
    const result = await fetchGamesForStore(
      undefined, // productCode
      targetPage, // page
      pageSize, // limit
      searchFilters.search, // search - game name
      searchFilters.category, // category
      searchFilters.provider, // provider
      searchFilters.status // status filter
    );
    
    if (!result.success) {
      message.error(
        result.error ||
          "Failed to filter games. Please check if the backend is running."
      );
    }
  }, [gameName, category, provider, statusFilter, pageSize, currentPage, fetchGamesForStore]);

  const handleSearch = async () => {
    await applyFilters(true); // Reset to page 1 when searching
  };

  const refetchCurrentGames = useCallback(() => {
    const currentPageSize = pagination.pageSize;
    return fetchGamesForStore(
      undefined, // productCode
      currentPage, // page
      currentPageSize, // limit
      currentSearchFilters.search, // search
      currentSearchFilters.category, // category
      currentSearchFilters.provider, // provider
      statusFilter !== "All" ? statusFilter : undefined // status filter
    );
  }, [
    currentPage, 
    currentSearchFilters.category,
    currentSearchFilters.provider,
    currentSearchFilters.search,
    statusFilter,
    fetchGamesForStore,
    pagination.pageSize,
  ]);

  // Handle category change - automatically filter
  const handleCategoryChange = async (value) => {
    setCategory(value);
    // Note: We'll trigger filter in useEffect after state updates
  };

  // Handle provider change - automatically filter
  const handleProviderChange = async (value) => {
    setProvider(value);
    // Note: We'll trigger filter in useEffect after state updates
  };

  // Handle status filter change - trigger backend filter
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    // Status filter will trigger applyFilters via useEffect
  };

  // Handle ping filter change - client-side filtering only
  const handlePingFilterChange = (value) => {
    setPingFilter(value);
    // Ping filtering is client-side, no need to call applyFilters
  };

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({ category: "All", provider: "All", status: "All" });

  // Auto-filter when category, provider, or status changes (but not on initial mount)
  useEffect(() => {
    // Only filter if:
    // 1. We've already done initial fetch (to avoid filtering on initial mount)
    // 2. The filter values have actually changed (user interaction)
    const hasChanged = 
      prevFiltersRef.current.category !== category || 
      prevFiltersRef.current.provider !== provider ||
      prevFiltersRef.current.status !== statusFilter;
    
    if (hasFetchedRef.current && hasChanged) {
      // Update previous values
      prevFiltersRef.current = { category, provider, status: statusFilter };
      // Apply filters (this will show all games if all are "All")
      applyFilters(true); // Reset to page 1 when filter changes
    } else {
      // Update previous values even if not filtering (for initial mount)
      prevFiltersRef.current = { category, provider, status: statusFilter };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, provider, statusFilter]); // Trigger when category, provider, or status changes

  // Build table data - dataSource already has all needed fields from backend
  const statusOptions = useMemo(() => {
    return [
      { value: "All", label: "All" },
      // Use label as value so backend receives "Active" or "DeActive"
      { value: "Active", label: "Active" },
      { value: "DeActive", label: "DeActive" },
    ];
  }, []);

  const pingOptions = useMemo(() => {
    return [
      { value: "All", label: "All" },
      { value: "online", label: "Online" },
      { value: "offline", label: "Offline" },
    ];
  }, []);

  const tableData = useMemo(() => {
    // Status filtering is now done at backend level, so we just map the data
    let mapped = (dataSource || []).map((item) => {
      const statusCode = (item.status || "")
        .toString()
        .toUpperCase()
        .trim();
      return {
        ...item,
        provider: item.provider || "-",
        category: item.category || "-",
        pingMs:
          typeof item.pingMs === "number" && !Number.isNaN(item.pingMs)
            ? item.pingMs
            : null,
        pingStatus: item.pingStatus || "unknown",
        inStore: typeof item.inStore === "boolean" ? item.inStore : false,
        status: statusCode,
        statusLabel: STATUS_LABELS[statusCode] || statusCode || "Unknown",
      };
    });

    // Apply client-side ping filtering
    if (pingFilter !== "All") {
      mapped = mapped.filter((item) => {
        const pingStatus = item.pingStatus || (item.pingMs !== null ? "online" : "offline");
        return pingStatus === pingFilter;
      });
    }

    return mapped;
  }, [dataSource, pingFilter]);

  const columns = [
    {
      title: "GameName",
      dataIndex: "name",
      key: "gameName",
      width: 240,
      align: "center",
      render: (text) => <span className="cell-ellipsis">{text || "-"}</span>,
    },
    {
      title: "Provider",
      dataIndex: "provider",
      key: "provider",
      width: 160,
      align: "center",
      render: (text) => <span className="cell-ellipsis">{text || "-"}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 160,
      align: "center",
      render: (text) => <span className="cell-ellipsis">{text || "-"}</span>,
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      width: 160,
      align: "center",
      render: (_, record) => {
        // Get status from database and normalize it
        const statusCode = (record.status || "")
          .toString()
          .toUpperCase()
          .trim();
        
        // Map status to label: ACTIVATED -> Active, DEACTIVATED -> DeActive
        const label = STATUS_LABELS[statusCode] || statusCode || "Unknown";
        
        // Set class based on status: ACTIVATED = available (green), DEACTIVATED = unavailable (grey)
        const isAvailable = statusCode === "ACTIVATED";
        const cls = isAvailable
          ? "state-badge available"
          : "state-badge unavailable";
        
        return <span className={cls}>{label}</span>;
      },
    },
    {
      title: "Ping",
      dataIndex: "pingMs",
      key: "ping",
      width: 140,
      align: "center",
      render: (pingMs, record) => {
        const value = typeof pingMs === "number" ? pingMs : null;
        const status = record.pingStatus || (value !== null ? "online" : "offline");

        if (status === "offline") {
          return <span className="ping-badge offline">Offline</span>;
        }

        if (value !== null) {
          let cls = "ping-badge good";
          if (value > 80 && value <= 200) {
            cls = "ping-badge warn";
          } else if (value > 200) {
            cls = "ping-badge slow";
          }
          return <span className={cls}>{`${value}ms`}</span>;
        }

        return <span className="ping-badge offline">Unknown</span>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      align: "center",
      render: (_, record) => {
        const disableActions = record.pingStatus === "offline";
        const isInManager = isGameInManager(record.key, record);
        
        if (isInManager) {
          // Show Remove button if game is in manager
          return (
            <Button
              type="default"
              danger
              size="small"
              className={`action-btn remove-btn${
                disableActions ? " disabled" : ""
              }`}
              disabled={disableActions}
              onClick={() => {
                if (!disableActions) {
                  // Remove game from manager
                  removeGameFromManager(record.key);
                }
              }}
            >
              Remove
            </Button>
          );
        } else {
          // Show Add button if game is not in manager
          return (
            <Button
              type="primary"
              size="small"
              className={`action-btn add-btn${
                disableActions ? " disabled" : ""
              }`}
              disabled={disableActions}
              onClick={() => {
                if (!disableActions) {
                  // Add game to manager
                  addGameToManager(record);
                }
              }}
            >
              Add
            </Button>
          );
        }
      },
    },
  ];

  const handlePageChange = async (page) => {
    // Fetch games for the new page, preserving current search filters
    const currentPageSize = state.gameStore.pagination.pageSize;
    const result = await fetchGamesForStore(
      undefined, // productCode
      page, // page
      currentPageSize, // limit
      currentSearchFilters.search, // search - preserve search filters
      currentSearchFilters.category, // category
      currentSearchFilters.provider // provider
    );
    if (!result.success) {
      message.error(
        result.error ||
          "Failed to load games. Please check if the backend is running."
      );
    }
  };

  // Delete modal handlers
  const handleDeleteOk = () => {
    console.log("Delete confirmed");
    if (itemToDelete) {
      deleteGameStoreItem(itemToDelete.key);
    }
    closeGameStoreModal("isDeleteModalOpen");
  };

  const handleDeleteCancel = () => {
    console.log("Delete cancelled");
    closeGameStoreModal("isDeleteModalOpen");
  };

  // Update modal handlers
  const handleUpdateOk = async () => {
    console.log("Update confirmed");
    closeGameStoreModal("isUpdateModalOpen");
    
    // Show loading message
    const hideLoading = message.loading("Updating game store...", 0);
    
    try {
      // Call the API to update provider games
      const response = await api.updateProviderGames();
      
      hideLoading();
      
      if (response.success) {
        const inserted = response.inserted || 0;
        message.success(`Successfully updated game store! ${inserted} new games added.`);
        
        // Refresh the game list
        const result = await fetchGamesForStore(undefined, currentPage, pageSize);
        if (!result.success) {
          message.warning("Games updated but failed to refresh the list. Please refresh the page.");
        }
      } else {
        message.error(response.error || "Failed to update game store");
      }
    } catch (error) {
      hideLoading();
      console.error("Update error:", error);
      message.error(error.message || "Failed to update game store. Please try again.");
    }
  };

  const handleUpdateCancel = () => {
    console.log("Update cancelled");
    closeGameStoreModal("isUpdateModalOpen");
  };

  // Ping modal handlers
  const handlePingOk = async () => {
    closeGameStoreModal("isPingModalOpen");
    const hideLoading = message.loading("Refreshing ping values...", 0);
    try {
      const result = await refetchCurrentGames();
      hideLoading();
      if (result.success) {
        message.success("Ping values updated.");
      } else {
        message.error(
          result.error || "Failed to refresh ping values. Please try again."
        );
      }
    } catch (error) {
      hideLoading();
      console.error("Ping refresh failed:", error);
      message.error("Failed to refresh ping values. Please try again.");
    }
  };

  const handlePingCancel = () => {
    console.log("Ping cancelled");
    closeGameStoreModal("isPingModalOpen");
  };

  // Add modal handlers
  const handleAddOk = () => {
    console.log("Add confirmed");
    closeGameStoreModal("isAddModalOpen");
    // Add your add logic here
  };

  const handleAddCancel = () => {
    console.log("Add cancelled");
    closeGameStoreModal("isAddModalOpen");
  };

  // Move (One Click Remove) modal handlers
  const handleMoveOk = async () => {
    const offlineGames = tableData.filter((game) => {
      if (!game) return false;
      const pingValue =
        typeof game.pingMs === "number" ? game.pingMs : Number(game.pingMs);
      if (Number.isFinite(pingValue)) {
        return pingValue <= 0;
      }
      return game.pingStatus === "offline" || pingValue === 0 || pingValue === null;
    });

    const offlineGameIds = offlineGames
      .map((game) => game.id)
      .filter((id) => Number.isInteger(id) && id > 0);

    if (!offlineGameIds.length) {
      message.info("There are no offline games to remove.");
      closeGameStoreModal("isMoveModalOpen");
      return;
    }

    const hideLoading = message.loading("Removing offline games...", 0);
    try {
      const response = await api.removeOfflineGames(offlineGameIds);
      hideLoading();
      if (response.success) {
        const removedCount = response.removed ?? offlineGameIds.length;
        message.success(`Removed ${removedCount} offline game(s).`);
        await refetchCurrentGames();
      } else {
        message.error(response.error || "Failed to remove offline games.");
      }
    } catch (error) {
      hideLoading();
      console.error("One Click Remove error:", error);
      message.error(error.message || "Failed to remove offline games.");
    } finally {
      closeGameStoreModal("isMoveModalOpen");
    }
  };

  const handleMoveCancel = () => {
    console.log("One Click Remove cancelled");
    closeGameStoreModal("isMoveModalOpen");
  };

  const handleOk = (data) => {
    // Handle form submission here
    console.log("Name:", data.name);
    console.log("Visibility:", data.visibility);
    if (editingItem) {
      // Update existing item
      updateGameStoreItem(editingItem.key, {
        name: data.name,
        visibility: data.visibility,
      });
    } else {
      // Add new item
      const newItem = {
        key: Date.now().toString(),
        id: Date.now(),
        name: data.name,
        provider: "ag",
        category: "Slot",
        pingMs: undefined,
        pingStatus: "unknown",
        inStore: false,
        state: true,
        createTime: new Date().toLocaleString(),
        visibility: data.visibility,
      };
      addGameStoreItem(newItem);
    }
    closeGameStoreModal("isAddEditModalOpen");
  };

  const handleCancel = () => {
    closeGameStoreModal("isAddEditModalOpen");
  };

  // Get dropdown data from context cache
  const { fetchGameFilters, state: appState } = useAppContext();
  const { gameFilters } = appState;

  useEffect(() => {
    if (
      gameFilters.providers.length === 0 ||
      gameFilters.categories.length === 0
    ) {
      fetchGameFiltersFromContext();
    }
  }, [
    fetchGameFiltersFromContext,
    gameFilters.providers.length,
    gameFilters.categories.length,
  ]);

  const providerOptions = useMemo(
    () => [
      { value: "All", label: "All" },
      ...gameFilters.providers.map((name) => ({
        value: name,
        label: name,
      })),
    ],
    [gameFilters.providers]
  );

  const categoryOptions = useMemo(
    () => [
      { value: "All", label: "All" },
      ...gameFilters.categories.map((name) => ({
        value: name,
        label: name,
      })),
    ],
    [gameFilters.categories]
  );

  return (
    <div className="table-container">
      <div className="search-filter-container">
        <div className="search-filter-row">
          <h2 className="page-title" id="page-title">
            {"Game Store"}
          </h2>
        </div>
        <div className="search-filter-row-game-store">
          <div className="filter-item1">
            <span className="filter-label">GameName:</span>
            <Input
              placeholder="Please input GameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              onPressEnter={handleSearch}
              className="filter-input filter-input-game-store"
            />
          </div>
          <div className="filter-item">
            <span className="filter-label">Provider:</span>
            <Select
              value={provider}
              onChange={handleProviderChange}
              className="filter-select filter-select1 filter-select-game-store"
              options={providerOptions}
              loading={gameFilters.loading}
              placeholder="Select Provider"
            />
          </div>
          <div className="filter-item">
            <span className="filter-label">Category:</span>
            <Select
              value={category}
              onChange={handleCategoryChange}
              className="filter-select filter-select-game-store"
              options={categoryOptions}
              loading={gameFilters.loading}
              placeholder="Select Category"
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            className="search-button"
          >
            Search
          </Button>
        </div>
        <div className="search-filter-row search-filter-row-state">
          <div className="filter-item filter-item-state">
            <span className="filter-label">State:</span>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="filter-select filter-select-game-store"
              options={statusOptions}
              placeholder="Select Status"
            />
          </div>
          <div className="filter-item filter-item-ping">
            <span className="filter-label">Ping:</span>
            <Select
              value={pingFilter}
              onChange={handlePingFilterChange}
              className="filter-select filter-select-game-store"
              options={pingOptions}
              placeholder="Select Ping Status"
            />
          </div>
        </div>
      </div>
      <div className="line"></div>
      <div className="game-store-buttons">
        <div className="update-buttons">
          <div className="update-button-content">
            <Button
              icon={<UploadOutlined />}
              type="primary"
              className="update-button"
              onClick={() => openGameStoreModal("isUpdateModalOpen")}
            >
              Update
            </Button>
            <span>
              Last updated: {formatDateTime(lastUpdated)}
            </span>
          </div>
          <div className="update-button-content">
            <Button
              type="primary"
              className="ping-button"
              onClick={() => openGameStoreModal("isPingModalOpen")}
            >
              Ping
            </Button>
            <span>Last ping: {formatDateTime(lastPing)}</span>
          </div>
        </div>
        <Button
          type="primary"
          className="oneclick-button"
          onClick={() => openGameStoreModal("isMoveModalOpen")}
        >
          One Click Remove
        </Button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <Spin size="large" tip="Loading games..." />
          </div>
        ) : error ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
              flexDirection: "column",
            }}
          >
            <p style={{ color: "red", marginBottom: "16px" }}>Error: {error}</p>
            <Button type="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : (
          <AntTable
            columns={columns}
            dataSource={tableData}
            pagination={false}
            className="game-store-table"
            rowClassName="table-row"
            bordered={false}
            size="small"
            scroll={{ x: "max-content" }}
          />
        )}
      </div>
      <div className="table-pagination">
        <div></div>
        <div className="main-pagination">
          <div>Total {totalItems}</div>
          <Pagination
            current={currentPage}
            total={totalItems}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper={false}
            showLessItems={false}
            className="custom-pagination"
          />
        </div>
      </div>
      <AddOrEditModal
        open={isAddEditModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        initialName={editingItem?.name || ""}
        initialVisibility={editingItem?.visibility || ["EN", "ZH"]}
      />
      <DeleteModal
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
      />
      <StoreUpdate
        open={isUpdateModalOpen}
        onOk={handleUpdateOk}
        onCancel={handleUpdateCancel}
      />
      <StorePing
        open={isPingModalOpen}
        onOk={handlePingOk}
        onCancel={handlePingCancel}
      />
      <StoreAdd
        open={isAddModalOpen}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
      />
      <StoreMove
        open={isMoveModalOpen}
        onOk={handleMoveOk}
        onCancel={handleMoveCancel}
      />
    </div>
  );
};

export default Table;
