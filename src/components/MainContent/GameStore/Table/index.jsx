import React, { useMemo, useState } from "react";
import { Table as AntTable, Button, Pagination, Input, Select } from "antd";
import { SearchOutlined, UploadOutlined } from "@ant-design/icons";
import AddOrEditModal from "../../../Modal/AddOrEditModal";
import DeleteModal from "../../../Modal/DeleteModal";
import { useAppContext } from "../../../../contexts";
import "./style.css";

const Table = () => {
  const {
    state,
    updateGameCategoryItem,
    addGameCategoryItem,
    setGameCategoryCurrentPage,
    openGameCategoryAddEditModal,
    closeGameCategoryAddEditModal,
    openGameCategoryDeleteModal,
    closeGameCategoryDeleteModal,
    confirmDeleteGameCategoryItem,
  } = useAppContext();

  const { dataSource, pagination, modals } = state.gameCategory;
  const { currentPage, pageSize, totalItems } = pagination;
  const { isAddEditModalOpen, isDeleteModalOpen, editingItem } = modals;

  const [gameName, setGameName] = useState("");
  const [category, setCategory] = useState("All");
  const [provider, setProvider] = useState("All");
  const [tags, setTags] = useState(["Hot", "New"]);
  const [dateRange, setDateRange] = useState(null);
  const [visibility, setVisibility] = useState(["EN", "ZH"]);

  const handleSearch = () => {
    console.log("Search with filters:", {
      gameName,
      category,
      provider,
      tags,
      dateRange,
      visibility,
    });
    // Add your search logic here
  };

  // Build table data with provider/category/ping/status fallbacks to ensure cells have values
  const tableData = useMemo(() => {
    const providerCycle = ["ag", "allbet", "ap", "bbin", "bg"];
    const categoryCycle = ["Live", "Slot", "Lottery", "Sports", "Fishing"];
    const pingCycle = [60, 110, 300, undefined, undefined];
    const pingStatusCycle = [
      "online",
      "online",
      "online",
      "offline",
      "offline",
    ];
    const inStoreCycle = [false, true, true, false, true];
    return (dataSource || []).map((item, idx) => {
      const i = idx % providerCycle.length;
      return {
        ...item,
        provider: item.provider ?? providerCycle[i],
        category: item.category ?? categoryCycle[i],
        pingMs: typeof item.pingMs === "number" ? item.pingMs : pingCycle[i],
        pingStatus: item.pingStatus ?? pingStatusCycle[i],
        inStore:
          typeof item.inStore === "boolean" ? item.inStore : inStoreCycle[i],
      };
    });
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
        // Prefer explicit inStore flag if provided; otherwise fall back to availability
        const isInStore =
          typeof record.inStore === "boolean" ? record.inStore : !!record.state;
        const isOffline = record.pingStatus === "offline";
        if (isInStore) {
          return (
            <Button
              size="small"
              className={`action-btn remove-btn${
                isOffline ? " remove-offline" : ""
              }`}
              onClick={() => openGameCategoryDeleteModal(record)}
            >
              Remove
            </Button>
          );
        }
        return (
          <Button
            type="primary"
            size="small"
            className={`action-btn add-btn${isOffline ? " disabled" : ""}`}
            disabled={isOffline}
            onClick={() => !isOffline && openGameCategoryAddEditModal(record)}
          >
            Add
          </Button>
        );
      },
    },
  ];

  const handlePageChange = (page) => {
    setGameCategoryCurrentPage(page);
  };

  const handleDeleteOk = () => {
    console.log("Delete confirmed");
    confirmDeleteGameCategoryItem();
  };

  const handleDeleteCancel = () => {
    console.log("Delete cancelled");
    closeGameCategoryDeleteModal();
  };

  const handleOk = (data) => {
    // Handle form submission here
    console.log("Name:", data.name);
    console.log("Visibility:", data.visibility);
    if (editingItem) {
      // Update existing item
      updateGameCategoryItem(editingItem.key, {
        name: data.name,
        visibility: data.visibility,
      });
    } else {
      // Add new item
      const newItem = {
        key: Date.now().toString(),
        id: Date.now(),
        name: data.name,
        icon: "",
        state: true,
        createTime: new Date().toLocaleString(),
        visibility: data.visibility,
      };
      addGameCategoryItem(newItem);
    }
    closeGameCategoryAddEditModal();
  };

  const handleCancel = () => {
    closeGameCategoryAddEditModal();
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
            >
              Update
            </Button>
            <span>Last updated: 2025-10-8 16:20 32</span>
          </div>
          <div className="update-button-content">
            <Button type="primary" className="ping-button">
              Ping
            </Button>
            <span>Last ping: 2025-10-8 16:20 32</span>
          </div>
        </div>
        <Button type="primary" className="oneclick-button">
          One Click Remove
        </Button>
      </div>

      <div className="table-wrapper">
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
      </div>
      <div className="table-pagination">
        <div></div>
        <div className="main-pagination">
          <div>Total 658</div>
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
    </div>
  );
};

export default Table;
