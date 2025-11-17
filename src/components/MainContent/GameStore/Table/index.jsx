import React, { useMemo, useState, useEffect, useRef } from "react";
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
  } = useAppContext();

  const { dataSource, pagination, modals, loading, error, lastUpdated } = state.gameStore;
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
        const result = await fetchGamesForStore(undefined, currentPage, pageSize);
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

  const handleSearch = async () => {
    // Store current search filters
    const searchFilters = {
      search: gameName.trim() || undefined,
      category: category !== "All" ? category : undefined,
      provider: provider !== "All" ? provider : undefined,
    };
    setCurrentSearchFilters(searchFilters);
    
    // Reset to page 1 when searching
    const result = await fetchGamesForStore(
      undefined, // productCode
      1, // page - reset to first page
      pageSize, // limit
      searchFilters.search, // search - game name
      searchFilters.category, // category
      searchFilters.provider // provider
    );
    
    if (!result.success) {
      message.error(
        result.error ||
          "Failed to search games. Please check if the backend is running."
      );
    }
  };

  // Build table data - dataSource already has all needed fields from backend
  const tableData = useMemo(() => {
    return (dataSource || []).map((item) => ({
      ...item,
      provider: item.provider || "-",
      category: item.category || "-",
      pingMs: item.pingMs, // Random ping value generated in mapGameStoreData
      pingStatus: item.pingStatus || "offline",
      inStore: typeof item.inStore === "boolean" ? item.inStore : false,
    }));
  }, [dataSource]);

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
        // record.state is boolean in current data
        const isAvailable = !!record.state;
        const label = isAvailable ? "Available" : "Not available";
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
        // Prefer numeric ping if provided; otherwise infer from createTime for demo purposes
        const value = typeof pingMs === "number" ? pingMs : undefined;
        const offline = record.pingStatus === "offline";
        let cls = "ping-badge offline";
        let text = "Offline";
        if (!offline && typeof value === "number") {
          if (value <= 80) {
            cls = "ping-badge good";
          } else if (value <= 200) {
            cls = "ping-badge warn";
          } else {
            cls = "ping-badge slow";
          }
          text = `${value}ms`;
        }
        return <span className={cls}>{text}</span>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      align: "center",
      render: (_, record) => {
        const isOffline = record.pingStatus === "offline";
        const isInManager = isGameInManager(record.key);
        
        if (isInManager) {
          // Show Remove button if game is in manager
          return (
            <Button
              type="default"
              danger
              size="small"
              className={`action-btn remove-btn${isOffline ? " disabled" : ""}`}
              disabled={isOffline}
              onClick={() => {
                if (!isOffline) {
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
              className={`action-btn add-btn${isOffline ? " disabled" : ""}`}
              disabled={isOffline}
              onClick={() => {
                if (!isOffline) {
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
  const handlePingOk = () => {
    console.log("Ping confirmed");
    closeGameStoreModal("isPingModalOpen");
    // Add your ping logic here
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
  const handleMoveOk = () => {
    console.log("One Click Remove confirmed");
    closeGameStoreModal("isMoveModalOpen");
    // Add your remove logic here
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
        pingStatus: "offline",
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

  const categoryOptions = [
    { value: "All", label: "All" },
    { value: "Slot", label: "Slot" },
    { value: "LiveCasino", label: "LiveCasino" },
    { value: "TableGames", label: "TableGames" },
  ];

  const providerOptions = [
    { value: "All", label: "All" },
    { value: "ag", label: "ag" },
    { value: "allbet", label: "allbet" },
    { value: "bbin", label: "bbin" },
  ];

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
              onChange={setProvider}
              className="filter-select filter-select1 filter-select-game-store"
              options={providerOptions}
            />
          </div>
          <div className="filter-item">
            <span className="filter-label">Category:</span>
            <Select
              value={category}
              onChange={setCategory}
              className="filter-select filter-select-game-store"
              options={categoryOptions}
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
              value={category}
              onChange={setCategory}
              className="filter-select filter-select-game-store"
              options={categoryOptions}
            />
          </div>
          <div className="filter-item filter-item-ping">
            <span className="filter-label">Ping:</span>
            <Select
              value={category}
              onChange={setCategory}
              className="filter-select filter-select-game-store"
              options={categoryOptions}
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
              Last updated:{" "}
              {lastUpdated
                ? (() => {
                    const date = new Date(lastUpdated);
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    const hours = String(date.getHours()).padStart(2, "0");
                    const minutes = String(date.getMinutes()).padStart(2, "0");
                    const seconds = String(date.getSeconds()).padStart(2, "0");
                    return `${year}-${month}-${day} ${hours}:${minutes} ${seconds}`;
                  })()
                : "N/A"}
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
            <span>Last ping: 2025-10-8 16:20 32</span>
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
