import React, { useState } from "react";
import {
  Button,
  Pagination,
  Modal,
  Input,
  Select,
  DatePicker,
  Spin,
  message,
} from "antd";
import ManagerEditModal from "../../../Modal/ManagerEditModal";
import { ExclamationCircleFilled, SearchOutlined } from "@ant-design/icons";
import { useAppContext } from "../../../../contexts";
import Product from "../Product";
import apiService from "../../../../services/api";
import "./style.css";

const { RangePicker } = DatePicker;

const GameProducts = () => {
  const { state, setGameManagerCurrentPage } = useAppContext();

  // Get data from global context (all backend data is processed here)
  const { dataSource, loading, error, pagination } = state.gameManager;
  const { currentPage, pageSize } = pagination;

  // Client-side pagination for games in manager
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDataSource = dataSource.slice(startIndex, endIndex);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [launchingGame, setLaunchingGame] = useState(false);
  const [launchedGameUrl, setLaunchedGameUrl] = useState("");
  const [gameFrameKey, setGameFrameKey] = useState(0);
  
  // GameManager now only shows games that were added from GameStore
  // No need to fetch from backend - games are managed via state

  // Filter states
  const [gameName, setGameName] = useState("");
  const [category, setCategory] = useState("All");
  const [provider, setProvider] = useState("All");
  const [tags, setTags] = useState(["Hot", "New"]);
  const [dateRange, setDateRange] = useState(null);
  const [visibility, setVisibility] = useState(["EN", "ZH"]);

  // Options for dropdowns
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

  const tagOptions = [
    { value: "Hot", label: "Hot" },
    { value: "New", label: "New" },
  ];

  const visibilityOptions = [
    { value: "EN", label: "EN" },
    { value: "ZH", label: "ZH" },
    { value: "DE", label: "DE" },
    { value: "FR", label: "FR" },
  ];

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

  const handlePageChange = (page) => {
    // Just update the current page - games are already in state
    setGameManagerCurrentPage(page);
  };

  const handleDeleteOk = () => {
    console.log("Delete confirmed");
    setIsDeleteModalOpen(false);
    // Add your delete logic here
  };

  const handleDeleteCancel = () => {
    console.log("Delete cancelled");
    setIsDeleteModalOpen(false);
  };

  const handleOk = (data) => {
    // Handle form submission here
    console.log("Form data:", data);
    console.log("ZH Name:", data.zhName);
    console.log("EN Name:", data.enName);
    console.log("Provider:", data.provider);
    console.log("Category:", data.category);
    console.log("Tags:", data.tags);
    console.log("Visibility:", data.visibility);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleEditClick = (product) => {
    setEditingProduct({
      zhName: product?.cnName || product?.gameName || "",
      enName: product?.enName || product?.gameName || "",
      provider: product?.productCode?.toString() || "All",
      category: product?.gameType || "All",
      tags: ["Hot", "New"], // TODO: Get from product data if available
      visibility: ["EN", "ZH", "DE"], // TODO: Get from product data if available
      coverImage: product?.image || "/cat.jpg",
      gameCode: product?.gameCode,
      fullData: product?.fullData,
    });
    setIsModalOpen(true);
  };

  const handleLaunchClick = async (product) => {
    console.log(product);
    // Check if required game data is available
    if (!product.gameCode || !product.gameType || !product.productCode) {
      message.error("Missing game information. Cannot launch game.");
      return;
    }
    setLaunchingGame(true);
    try {
      const response = await apiService.launchGame({
        gameCode: product.gameCode,
        gameType: product.gameType,
        productCode: product.productCode,
        currency: "IDR",
        languageCode: 0,
      });

      if (response.success && response.url) {
        setLaunchedGameUrl(response.url);
        setGameFrameKey((prev) => prev + 1);
        message.success("Game launched successfully!");
      } else {
        message.error(response.message || "Failed to launch game");
      }
    } catch (error) {
      console.error("Launch game error:", error);
      const errorMessage =
        error.message ||
        "Failed to launch game. Please check your authentication.";
      message.error(errorMessage);
    } finally {
      setLaunchingGame(false);
    }
  };

  return (
    <div className="table-container">
      <div className="search-filter-container">
        <div className="search-filter-row">
          <h2 className="page-title" id="page-title">
            {"Game Manager"}
          </h2>
        </div>
        <div className="search-filter-row">
          <div className="filter-item1">
            <span className="filter-label">GameName:</span>
            <Input
              placeholder="Please input GameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-item">
            <span className="filter-label">Category:</span>
            <Select
              value={category}
              onChange={setCategory}
              className="filter-select"
              options={categoryOptions}
            />
          </div>
          <div className="filter-item">
            <span className="filter-label">Provider:</span>
            <Select
              value={provider}
              onChange={setProvider}
              className="filter-select filter-select1"
              options={providerOptions}
            />
          </div>
          <div className="filter-item">
            <span className="filter-label">Tags:</span>
            <Select
              mode="multiple"
              value={tags}
              onChange={setTags}
              className="filter-select-multiple filter-select-multiple-2"
              options={tagOptions}
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
        <div className="search-filter-row search-filter-row-gap">
          <div className="filter-item">
            <span className="filter-label">CreateTime:</span>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              className="filter-date-picker"
              placeholder={["Start", "End"]}
              format="YYYY-MM-DD"
              separator="-"
            />
          </div>

          <div className="filter-item">
            <span className="filter-label">Visibility:</span>
            <Select
              mode="multiple"
              value={visibility}
              onChange={setVisibility}
              className="filter-select-multiple filter-select-multiple-2"
              options={visibilityOptions}
            />
          </div>
        </div>
      </div>
      <div className="line"></div>
      <div className="table-wrapper1">
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
        ) : dataSource.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <p>No games found</p>
          </div>
        ) : (
          <div className="products">
            {paginatedDataSource.map((product) => (
              <Product
                key={product.key}
                image={product.image}
                cnName={product.cnName}
                enName={product.enName}
                onLaunch={() => handleLaunchClick(product)}
                onEdit={() => handleEditClick(product)}
              />
            ))}
          </div>
        )}
        <div className="game-model">
          {launchingGame ? (
            <div className="game-model-loader">
              <Spin size="large" tip="Launching game..." />
            </div>
          ) : launchedGameUrl ? (
            <iframe
              key={gameFrameKey}
              src={launchedGameUrl}
              title="Launched game preview"
              className="game-model-frame"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox"
            />
          ) : (
            <div className="game-model-placeholder">
              <img src="/model.png" alt="" />
            </div>
          )}
        </div>
      </div>
      <div className="table-pagination1">
        <div className="main-pagination">
          <div>Total {dataSource.length}</div>
          <Pagination
            current={currentPage}
            total={dataSource.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper={false}
            showLessItems={false}
            className="custom-pagination"
          />
        </div>
      </div>
      <ManagerEditModal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        initialData={editingProduct}
      />
      <Modal
        title={null}
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="确定"
        cancelText="取消"
        centered
        closable={true}
        className="delete-confirm-modal"
        width={480}
      >
        <div className="delete-modal-content">
          <div className="delete-modal-header">
            <div className="delete-warning-icon">
              <ExclamationCircleFilled />
            </div>
            <span className="delete-modal-question">
              Should the game be removed from game provider?
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GameProducts;
