import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Button,
  Pagination,
  Modal,
  Input,
  Select,
  DatePicker,
  Spin,
} from "antd";
import ManagerEditModal from "../../../Modal/ManagerEditModal";
import { ExclamationCircleFilled, SearchOutlined } from "@ant-design/icons";
import { useAppContext } from "../../../../contexts";
import { useNotification } from "../../../../contexts/NotificationContext";
import Product from "../Product";
import apiService from "../../../../services/api";
import "./style.css";

const { RangePicker } = DatePicker;

const GameProducts = () => {
  const {
    state,
    setGameManagerCurrentPage,
    fetchGamesInManager,
    updateGameManagerItem,
  } = useAppContext();

  const { notifySuccess, notifyError } = useNotification();

  const { dataSource, loading, error, pagination } = state.gameManager;
  const { currentPage, pageSize } = pagination;
  const { dropdowns, gameCategory, gameProvider } = state;

  // Filter states
  const [gameName, setGameName] = useState("");
  const [category, setCategory] = useState("All");
  const [provider, setProvider] = useState("All");
  const [tags, setTags] = useState(["All"]);
  const [dateRange, setDateRange] = useState(null);
  const [visibility, setVisibility] = useState(["All"]);
  const hasFetchedRef = useRef(false);
  const prevFiltersRef = useRef({
    category: undefined,
    provider: undefined,
    startDate: null,
    endDate: null,
    tagsKey: "[]",
    visibilityKey: "[]",
  });
  const [currentSearchFilters, setCurrentSearchFilters] = useState({
    search: undefined,
    category: undefined,
    provider: undefined,
    startDate: undefined,
    endDate: undefined,
    tags: undefined,
    visibility: undefined,
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

  const normalizeNumberArray = useCallback((values) => {
    if (!Array.isArray(values) || values.length === 0) {
      return undefined;
    }
    const filtered = values.filter((value) => value !== "All");
    if (filtered.length === 0) return undefined;
    const normalized = filtered
      .map((value) =>
        typeof value === "string" ? parseInt(value, 10) : Number(value)
      )
      .filter((value) => Number.isInteger(value) && !Number.isNaN(value));
    return normalized.length ? normalized : undefined;
  }, []);

  const getArraySignature = useCallback(
    (values) => {
      if (!Array.isArray(values)) {
        return "[]";
      }
      const normalized = normalizeNumberArray(values) || [];
      return JSON.stringify([...normalized].sort((a, b) => a - b));
    },
    [normalizeNumberArray]
  );

  // Fetch games in manager only if data is empty
  // This prevents unnecessary re-fetching when navigating back to the page
  useEffect(() => {
    if (!hasFetchedRef.current && dataSource.length === 0 && !loading) {
      const loadGames = async () => {
        const result = await fetchGamesInManager(currentPage, pageSize);
        if (!result.success) {
          notifyError(result.error || "Failed to load games in manager.");
        }
        hasFetchedRef.current = true;
        prevFiltersRef.current = {
          category: normalizeFilterValue(category),
          provider: normalizeFilterValue(provider),
          startDate: null,
          endDate: null,
          tagsKey: getArraySignature(tags),
          visibilityKey: getArraySignature(visibility),
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
        tagsKey: getArraySignature(tags),
        visibilityKey: getArraySignature(visibility),
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizeFilterValue]);

  const applyFilters = useCallback(
    async (resetPage = true) => {
      const trimmedGameName = gameName.trim();
      const { startDate: startDateIso, endDate: endDateIso } = getDateRangeISO(dateRange);
      const normalizedTags = normalizeNumberArray(tags);
      const normalizedVisibility = normalizeNumberArray(visibility);

      const filters = {
        search: trimmedGameName || undefined,
        category: normalizeFilterValue(category),
        provider: normalizeFilterValue(provider),
        startDate: startDateIso,
        endDate: endDateIso,
        tags: normalizedTags,
        visibility: normalizedVisibility,
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
        filters.endDate,
        filters.tags,
        filters.visibility
      );

      if (!result.success) {
        notifyError(result.error || "Failed to filter games in manager.");
      }
    },
    [
      gameName,
      category,
      provider,
      dateRange,
      tags,
      visibility,
      currentPage,
      pageSize,
      fetchGamesInManager,
      getDateRangeISO,
      normalizeFilterValue,
      normalizeNumberArray,
    ]
  );

  // Optimize: Debounce filter changes to prevent excessive API calls
  const filterTimeoutRef = useRef(null);
  
  useEffect(() => {
    // Clear any pending filter application
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    const { startDate: startDateIso, endDate: endDateIso } = getDateRangeISO(dateRange);
    const nextFiltersSnapshot = {
      category: normalizeFilterValue(category),
      provider: normalizeFilterValue(provider),
      startDate: startDateIso || null,
      endDate: endDateIso || null,
      tagsKey: getArraySignature(tags),
      visibilityKey: getArraySignature(visibility),
    };

    if (!hasFetchedRef.current) {
      prevFiltersRef.current = nextFiltersSnapshot;
      return;
    }

    const hasChanged =
      prevFiltersRef.current.category !== nextFiltersSnapshot.category ||
      prevFiltersRef.current.provider !== nextFiltersSnapshot.provider ||
      prevFiltersRef.current.startDate !== nextFiltersSnapshot.startDate ||
      prevFiltersRef.current.endDate !== nextFiltersSnapshot.endDate ||
      prevFiltersRef.current.tagsKey !== nextFiltersSnapshot.tagsKey ||
      prevFiltersRef.current.visibilityKey !== nextFiltersSnapshot.visibilityKey;

    prevFiltersRef.current = nextFiltersSnapshot;

    if (hasChanged) {
      // Debounce filter application to reduce API calls
      filterTimeoutRef.current = setTimeout(() => {
        applyFilters(true);
      }, 300); // 300ms debounce
    }

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    category,
    provider,
    dateRange,
    tags,
    visibility,
    getDateRangeISO,
    applyFilters,
    normalizeFilterValue,
    getArraySignature,
  ]);

  // Server-side pagination - dataSource already contains paginated results
  // Memoize to prevent unnecessary re-renders
  const paginatedDataSource = useMemo(() => dataSource, [dataSource]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [launchingGame, setLaunchingGame] = useState(false);
  const [launchedGameUrl, setLaunchedGameUrl] = useState("");
  const [gameFrameKey, setGameFrameKey] = useState(0);
  
  // GameManager now only shows games that were added from GameStore
  // No need to fetch from backend - games are managed via state
  
  // Use data from context directly - no API calls needed!
  // Categories from gameCategory.dataSource (GameCategories table)
  // Providers from gameProvider.dataSource (Product table)
  // Tags from dropdowns.tags (GameTags table)
  // Create stable string keys to prevent unnecessary re-renders
  const categoryDataKey = useMemo(() => {
    const categories = gameCategory.dataSource || [];
    return `${categories.length}-${categories.map(c => c.name).sort().join(',')}`;
  }, [gameCategory.dataSource]);

  const providerDataKey = useMemo(() => {
    const providers = gameProvider.dataSource || [];
    const uniqueProviders = [...new Set(
      providers.map((p) => p.provider || p.name).filter(Boolean)
    )].sort();
    return `${uniqueProviders.length}-${uniqueProviders.join(',')}`;
  }, [gameProvider.dataSource]);

  const categoryOptions = useMemo(() => {
    const categories = gameCategory.dataSource || [];
    return [
      { value: "All", label: "All" },
      ...categories.map((cat) => ({
        value: cat.name,
        label: cat.name,
      })),
    ];
  }, [categoryDataKey]);

  const providerOptions = useMemo(() => {
    const providers = gameProvider.dataSource || [];
    // Extract unique provider values from Product table
    const uniqueProviders = [...new Set(
      providers
        .map((p) => p.provider || p.name)
        .filter(Boolean)
    )].sort();
    return [
      { value: "All", label: "All" },
      ...uniqueProviders.map((prov) => ({
        value: prov,
        label: prov,
      })),
    ];
  }, [providerDataKey]);

  const tagOptions = useMemo(() => {
    const tags = dropdowns.tags || [];
    return [
      { value: "All", label: "All" },
      ...tags
        .filter((tag) => tag.state !== false)
        .map((tag) => ({
          value: tag.id,
          label: tag.name,
        })),
    ];
  }, [dropdowns.tags]);

  const visibilityOptions = [
    { value: "All", label: "All" },
    { value: 0, label: "English" },
    { value: 1, label: "Traditional Chinese" },
    { value: 2, label: "Simplify Chinese" },
    { value: 3, label: "Thai" },
    { value: 4, label: "Indonesia" },
    { value: 5, label: "Japanese" },
    { value: 6, label: "Korea" },
    { value: 7, label: "Vietnamese" },
    { value: 8, label: "Deutsch" },
    { value: 9, label: "Espanol" },
    { value: 10, label: "Francais" },
    { value: 11, label: "Russia" },
    { value: 12, label: "Portuguese" },
    { value: 13, label: "Burmese" },
    { value: 14, label: "Danish" },
    { value: 15, label: "Finnish" },
    { value: 16, label: "Italian" },
    { value: 17, label: "Dutch" },
    { value: 18, label: "Norwegian" },
    { value: 19, label: "Polish" },
    { value: 20, label: "Romanian" },
    { value: 21, label: "Swedish" },
    { value: 22, label: "Turkish" },
    { value: 23, label: "Bulgarian" },
    { value: 24, label: "Czech" },
    { value: 25, label: "Greek" },
    { value: 26, label: "Hungarian" },
    { value: 27, label: "Brazilian Portugese" },
    { value: 28, label: "Slovak" },
    { value: 29, label: "Georgian" },
    { value: 30, label: "Latvian" },
    { value: 31, label: "Ukrainian" },
    { value: 32, label: "Estonian" },
    { value: 33, label: "Filipino" },
    { value: 34, label: "Cambodian" },
    { value: 35, label: "Lao" },
    { value: 36, label: "Malay" },
    { value: 37, label: "Cantonese" },
    { value: 38, label: "Tamil" },
    { value: 39, label: "Hindi" },
    { value: 40, label: "European Spanish" },
    { value: 41, label: "Azerbaijani" },
    { value: 42, label: "Brunei Darussalam" },
    { value: 43, label: "Croatian" },
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
      filters.endDate,
      filters.tags,
      filters.visibility
    );
    if (!result.success) {
      notifyError(result.error || "Failed to load games in manager.");
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
      notifyError("Game ID not found. Cannot update game.");
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

      const normalizedTags = Array.isArray(data.tags)
        ? data.tags
            .map((tagId) =>
              typeof tagId === "string" ? parseInt(tagId, 10) : Number(tagId)
            )
            .filter((tagId) => !Number.isNaN(tagId))
        : [];

      // Prepare update data
      const updateData = {
        extra_langName: langName,
        tags: normalizedTags,
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
        notifySuccess("Game updated successfully!", "Your changes have been saved.");
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
        const updatedTags = Array.isArray(updatedGame.tags)
          ? updatedGame.tags
          : normalizedTags;
        
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
          tags: updatedTags,
          visibility: updatedVisibility,
          fullData: {
            ...(editingProduct.fullData || {}),
            ...updatedGame,
            extra_langName: updateData.extra_langName ?? updatedGame.extra_langName ?? editingProduct.fullData?.extra_langName,
            extra_provider: nextProvider,
            extra_gameType: nextCategory,
            extra_imageUrl: serverImage,
            tags: updatedTags,
            visibility: updatedGame.visibility ?? editingProduct.fullData?.visibility,
          },
        };

        updateGameManagerItem(editingProduct.key, updatedFields);
        setEditingProduct(null);
      } else {
        notifyError(response.error || "Failed to update game");
      }
    } catch (error) {
      console.error("Error updating game:", error);
      notifyError(error.message || "Failed to update game. Please try again.");
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
    
    const gameTags = Array.isArray(product?.fullData?.tags)
      ? product.fullData.tags
      : Array.isArray(product?.tags)
      ? product.tags
      : [];
    
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
      tags: gameTags,
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
      notifyError("Missing game information. Cannot launch game.");
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
        notifySuccess("Game launched successfully!", `${product.enName || product.cnName || product.gameName || "Game"} is live.`);
      } else {
        notifyError(response.message || "Failed to launch game");
      }
    } catch (error) {
      console.error("Launch game error:", error);
      const errorMessage =
        error.message ||
        "Failed to launch game. Please check your authentication.";
      notifyError(errorMessage);
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
