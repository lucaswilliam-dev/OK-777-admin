import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const {
    state,
    setGameManagerCurrentPage,
    fetchGamesInManager,
    fetchDropdownData,
    updateGameManagerItem,
  } = useAppContext();

  const { dataSource, loading, error, pagination } = state.gameManager;
  const { currentPage, pageSize } = pagination;
  const { dropdowns } = state;

  // Filter states
  const [gameName, setGameName] = useState("");
  const [category, setCategory] = useState("All");
  const [provider, setProvider] = useState("All");
  const [tags, setTags] = useState(["Hot", "New"]);
  const [dateRange, setDateRange] = useState(null);
  const [visibility, setVisibility] = useState(["EN", "ZH"]);
  const hasFetchedRef = useRef(false);
  const prevFiltersRef = useRef({
    category: undefined,
    provider: undefined,
    startDate: null,
    endDate: null,
  });
  const [currentSearchFilters, setCurrentSearchFilters] = useState({
    search: undefined,
    category: undefined,
    provider: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const getDateRangeISO = useCallback((range) => {
    if (!Array.isArray(range) || range.length < 2) {
      return { startDate: undefined, endDate: undefined };
    }
    const normalizeValue = (value, toEndOfDay = false) => {
      if (!value) return undefined;
      if (
        typeof value.startOf === "function" &&
        typeof value.endOf === "function"
      ) {
        const normalized = toEndOfDay ? value.endOf("day") : value.startOf("day");
        return normalized.toISOString();
      }
      const date = value instanceof Date ? new Date(value) : new Date(value);
      if (Number.isNaN(date.getTime())) return undefined;
      if (toEndOfDay) {
        date.setHours(23, 59, 59, 999);
      } else {
        date.setHours(0, 0, 0, 0);
      }
      return date.toISOString();
    };

    return {
      startDate: normalizeValue(range[0], false),
      endDate: normalizeValue(range[1], true),
    };
  }, []);

  const normalizeFilterValue = useCallback((value) => {
    if (!value || value === "All") {
      return undefined;
    }
    const trimmedValue = value.toString().trim();
    return trimmedValue.length ? trimmedValue : undefined;
  }, []);

  // Fetch games in manager only if data is empty
  // This prevents unnecessary re-fetching when navigating back to the page
  useEffect(() => {
    if (!hasFetchedRef.current && dataSource.length === 0 && !loading) {
      const loadGames = async () => {
        const result = await fetchGamesInManager(currentPage, pageSize);
        if (!result.success) {
          message.error(result.error || "Failed to load games in manager.");
        }
        hasFetchedRef.current = true;
        prevFiltersRef.current = {
          category: normalizeFilterValue(category),
          provider: normalizeFilterValue(provider),
          startDate: null,
          endDate: null,
        };
      };
      loadGames();
    } else if (!hasFetchedRef.current && dataSource.length > 0) {
      hasFetchedRef.current = true;
      prevFiltersRef.current = {
        category: normalizeFilterValue(category),
        provider: normalizeFilterValue(provider),
        startDate: null,
        endDate: null,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizeFilterValue]);

  const applyFilters = useCallback(
    async (resetPage = true) => {
      const trimmedGameName = gameName.trim();
      const { startDate: startDateIso, endDate: endDateIso } = getDateRangeISO(dateRange);

      const filters = {
        search: trimmedGameName || undefined,
        category: normalizeFilterValue(category),
        provider: normalizeFilterValue(provider),
        startDate: startDateIso,
        endDate: endDateIso,
      };

      setCurrentSearchFilters(filters);

      const targetPage = resetPage ? 1 : currentPage;

      const result = await fetchGamesInManager(
        targetPage,
        pageSize,
        filters.search,
        filters.category,
        filters.provider,
        undefined,
        filters.startDate,
        filters.endDate
      );

      if (!result.success) {
        message.error(result.error || "Failed to filter games in manager.");
      }
    },
    [
      gameName,
      category,
      provider,
      dateRange,
      currentPage,
      pageSize,
      fetchGamesInManager,
      getDateRangeISO,
      normalizeFilterValue,
    ]
  );

  useEffect(() => {
    const { startDate: startDateIso, endDate: endDateIso } = getDateRangeISO(dateRange);
    const nextFiltersSnapshot = {
      category: normalizeFilterValue(category),
      provider: normalizeFilterValue(provider),
      startDate: startDateIso || null,
      endDate: endDateIso || null,
    };

    if (!hasFetchedRef.current) {
      prevFiltersRef.current = nextFiltersSnapshot;
      return;
    }

    const hasChanged =
      prevFiltersRef.current.category !== nextFiltersSnapshot.category ||
      prevFiltersRef.current.provider !== nextFiltersSnapshot.provider ||
      prevFiltersRef.current.startDate !== nextFiltersSnapshot.startDate ||
      prevFiltersRef.current.endDate !== nextFiltersSnapshot.endDate;

    prevFiltersRef.current = nextFiltersSnapshot;

    if (hasChanged) {
      applyFilters(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, provider, dateRange, getDateRangeISO, applyFilters, normalizeFilterValue]);

  // Server-side pagination - dataSource already contains paginated results
  const paginatedDataSource = dataSource;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [launchingGame, setLaunchingGame] = useState(false);
  const [launchedGameUrl, setLaunchedGameUrl] = useState("");
  const [gameFrameKey, setGameFrameKey] = useState(0);
  
  // GameManager now only shows games that were added from GameStore
  // No need to fetch from backend - games are managed via state
  
  const [categoryOptions, setCategoryOptions] = useState([
    { value: "All", label: "All" },
  ]);
  const [providerOptions, setProviderOptions] = useState([
    { value: "All", label: "All" },
  ]);

  useEffect(() => {
    const loadDropdownData = async () => {
      if (dropdowns.categories.length > 0 && dropdowns.providers.length > 0) {
        const categoryOpts = [
          { value: "All", label: "All" },
          ...dropdowns.categories.map((cat) => ({
            value: cat.name,
            label: cat.name,
          })),
        ];
        const providerOpts = [
          { value: "All", label: "All" },
          ...dropdowns.providers.map((prov) => ({
            value: prov,
            label: prov,
          })),
        ];
        setCategoryOptions(categoryOpts);
        setProviderOptions(providerOpts);
      } else {
        const result = await fetchDropdownData();
        if (result.success) {
          const categoryOpts = [
            { value: "All", label: "All" },
            ...result.categories.map((cat) => ({
              value: cat.name,
              label: cat.name,
            })),
          ];
          const providerOpts = [
            { value: "All", label: "All" },
            ...result.providers.map((prov) => ({
              value: prov,
              label: prov,
            })),
          ];
          setCategoryOptions(categoryOpts);
          setProviderOptions(providerOpts);
        }
      }
    };

    loadDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSearch = async () => {
    await applyFilters(true);
  };

  const handlePageChange = async (page) => {
    setGameManagerCurrentPage(page);
    const filters = currentSearchFilters;
    const result = await fetchGamesInManager(
      page,
      pageSize,
      filters.search,
      filters.category,
      filters.provider,
      undefined,
      filters.startDate,
      filters.endDate
    );
    if (!result.success) {
      message.error(result.error || "Failed to load games in manager.");
    }
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

  const handleOk = async (data) => {
    if (!editingProduct?.gameId) {
      message.error("Game ID not found. Cannot update game.");
      return;
    }

    try {

      // Build extra_langName object using language codes
      // 0 = English, 2 = Simplify Chinese
      // Preserve existing language codes and only update 0 and 2
      const existingLangName = editingProduct?.fullData?.extra_langName || editingProduct?.fullData?.langName || {};
      let parsedExisting = {};
      
      // Parse existing langName if it's a string
      if (typeof existingLangName === 'string') {
        try {
          parsedExisting = JSON.parse(existingLangName);
        } catch (e) {
          // If parsing fails, try to extract from old format
          parsedExisting = existingLangName;
        }
      } else if (existingLangName && typeof existingLangName === 'object') {
        parsedExisting = { ...existingLangName };
      }
      
      // Create new langName object preserving all existing language codes
      const langName = { ...parsedExisting };
      
      // Update language code 0 (English) if enName is provided
      if (data.enName) {
        langName['0'] = data.enName.trim();
      }
      
      // Update language code 2 (Simplify Chinese) if zhName is provided
      if (data.zhName) {
        langName['2'] = data.zhName.trim();
      }

      // Convert tags array to isHot and isNew boolean fields
      // If "Hot" is in tags array, set isHot to true, otherwise false
      // If "New" is in tags array, set isNew to true, otherwise false
      const isHot = Array.isArray(data.tags) && data.tags.includes("Hot");
      const isNew = Array.isArray(data.tags) && data.tags.includes("New");

      // Prepare update data
      const updateData = {
        extra_langName: langName,
        isHot: isHot,
        isNew: isNew,
      };

      if (data.provider !== undefined) {
        updateData.extra_provider = data.provider || null;
      }

      if (data.category !== undefined) {
        updateData.extra_gameType = data.category || null;
      }

      if (data.uploadedImagePath) {
        updateData.extra_imageUrl = data.uploadedImagePath;
      }

      // Handle visibility field - convert array of language codes to JSON
      if (data.visibility !== undefined && Array.isArray(data.visibility)) {
        // Filter out invalid values and ensure all are numbers
        const validVisibility = data.visibility
          .map(code => typeof code === 'string' ? parseInt(code, 10) : code)
          .filter(code => !isNaN(code) && code >= 0 && code <= 43);
        updateData.visibility = validVisibility.length > 0 ? validVisibility : null;
      }

      // Call API to update game
      const response = await apiService.updateGame(editingProduct.gameId, updateData);

      if (response.success) {
        message.success("Game updated successfully!");
        setIsModalOpen(false);

        const updatedGame = response.data || {};
        const nextProvider =
          updatedGame.extra_provider ??
          updatedGame.provider ??
          data.provider ??
          editingProduct.provider ??
          null;
        const nextCategory =
          updatedGame.extra_gameType ??
          updatedGame.category ??
          data.category ??
          editingProduct.category ??
          null;
        // Extract names using language codes: 0 = English, 2 = Simplify Chinese
        const updatedLangName = updatedGame.extra_langName || updatedGame.langName || {};
        const parsedUpdatedLangName = typeof updatedLangName === 'string' 
          ? (() => { try { return JSON.parse(updatedLangName); } catch { return {}; } })()
          : updatedLangName;
        
        const nextCnName = data.zhName || parsedUpdatedLangName['2'] || parsedUpdatedLangName[2] || editingProduct.cnName;
        const nextEnName = data.enName || parsedUpdatedLangName['0'] || parsedUpdatedLangName[0] || editingProduct.enName;
        const serverImage =
          updatedGame.extra_imageUrl ??
          updatedGame.imageUrl ??
          updatedGame.image_url ??
          data.uploadedImagePath ??
          editingProduct.image;

        // Extract updated isHot and isNew values from the response
        const updatedIsHot = updatedGame.isHot ?? false;
        const updatedIsNew = updatedGame.isNew ?? false;
        
        // Extract updated visibility from the response
        let updatedVisibility = [];
        const visibilityData = updatedGame.visibility;
        if (visibilityData) {
          try {
            const parsed = typeof visibilityData === 'string' ? JSON.parse(visibilityData) : visibilityData;
            if (Array.isArray(parsed)) {
              updatedVisibility = parsed.map(code => typeof code === 'string' ? parseInt(code, 10) : code).filter(code => !isNaN(code));
            }
          } catch (e) {
            // If parsing fails, use empty array
          }
        }
        
        const updatedFields = {
          cnName: nextCnName,
          enName: nextEnName,
          provider: nextProvider,
          category: nextCategory,
          extra_provider: nextProvider,
          extra_gameType: nextCategory,
          image: serverImage,
          isHot: updatedIsHot,
          isNew: updatedIsNew,
          visibility: updatedVisibility,
          fullData: {
            ...(editingProduct.fullData || {}),
            ...updatedGame,
            extra_langName: updateData.extra_langName ?? updatedGame.extra_langName ?? editingProduct.fullData?.extra_langName,
            extra_provider: nextProvider,
            extra_gameType: nextCategory,
            extra_imageUrl: serverImage,
            isHot: updatedIsHot,
            isNew: updatedIsNew,
            visibility: updatedGame.visibility ?? editingProduct.fullData?.visibility,
          },
        };

        updateGameManagerItem(editingProduct.key, updatedFields);
        setEditingProduct(null);
      } else {
        message.error(response.error || "Failed to update game");
      }
    } catch (error) {
      console.error("Error updating game:", error);
      message.error(error.message || "Failed to update game. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleEditClick = (product) => {
    // Use extra_provider and extra_gameType for display values (from game table)
    // These should match the dropdown values from Product and Category tables
    const providerName = product?.extra_provider || product?.fullData?.extra_provider || product?.provider || product?.fullData?.provider || "All";
    const categoryName = product?.extra_gameType || product?.fullData?.extra_gameType || product?.gameType || product?.fullData?.game_type || "All";
    
    // Extract langName from fullData if available
    // Use language codes: 0 = English, 2 = Simplify Chinese
    const langName = product?.fullData?.extra_langName || product?.fullData?.langName;
    let zhName = product?.cnName || "";
    let enName = product?.enName || "";
    
    // Parse langName if it's a JSON object/string
    if (langName) {
      try {
        const parsed = typeof langName === 'string' ? JSON.parse(langName) : langName;
        // Extract using language codes: 0 = English, 2 = Simplify Chinese
        enName = parsed['0'] || parsed[0] || parsed.en || parsed.EN || parsed['en-US'] || enName;
        zhName = parsed['2'] || parsed[2] || parsed.zh || parsed.ZH || parsed['zh-CN'] || zhName;
      } catch (e) {
        // If parsing fails, use existing values
        // Silently fallback to existing values
      }
    }
    
    // Get the image URL - prefer extra_imageUrl, fallback to image_url
    const imageUrl = product?.fullData?.extra_imageUrl || product?.image || "/cat.jpg";
    
    // Extract tags from isHot and isNew fields
    // If isHot is true, include "Hot" in tags array
    // If isNew is true, include "New" in tags array
    const tags = [];
    const isHot = product?.fullData?.isHot || product?.isHot || false;
    const isNew = product?.fullData?.isNew || product?.isNew || false;
    if (isHot) tags.push("Hot");
    if (isNew) tags.push("New");
    
    // Extract visibility from database (JSON field containing array of language codes)
    let visibilityArray = [];
    const visibilityData = product?.fullData?.visibility;
    if (visibilityData) {
      try {
        // Parse if it's a string, otherwise use as-is
        const parsed = typeof visibilityData === 'string' ? JSON.parse(visibilityData) : visibilityData;
        // Ensure it's an array and convert to numbers if needed
        if (Array.isArray(parsed)) {
          visibilityArray = parsed.map(code => typeof code === 'string' ? parseInt(code, 10) : code).filter(code => !isNaN(code));
        }
      } catch (e) {
        // If parsing fails, use empty array
        console.warn("Failed to parse visibility data:", e);
      }
    }
    
    setEditingProduct({
      key: product?.key,
      gameId: product?.gameId || product?.fullData?.id,
      zhName: zhName || product?.gameName || "",
      enName: enName || product?.gameName || "",
      provider: providerName, // Use extra_provider from game table
      category: categoryName, // Use extra_gameType from game table
      tags: tags.length > 0 ? tags : [], // Get from isHot/isNew fields
      visibility: visibilityArray, // Get from visibility field in database
      coverImage: imageUrl,
      gameCode: product?.gameCode,
      fullData: product?.fullData,
    });
    setIsModalOpen(true);
  };

  const handleLaunchClick = async (product) => {
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
              onPressEnter={handleSearch}
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
            loading={dropdowns.loading}
            />
          </div>
          <div className="filter-item">
            <span className="filter-label">Provider:</span>
            <Select
              value={provider}
              onChange={setProvider}
              className="filter-select filter-select1"
              options={providerOptions}
            loading={dropdowns.loading}
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
        {loading && dataSource.length === 0 ? (
          // Only show spinner if we have no data
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
          <div>Total {pagination.totalItems || 0}</div>
          <Pagination
            current={currentPage}
            total={pagination.totalItems || 0}
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
        key={editingProduct?.gameId} // Force re-render when editing different game
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
