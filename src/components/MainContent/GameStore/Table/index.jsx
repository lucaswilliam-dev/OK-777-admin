import React, { useState } from "react";
import {
  Table as AntTable,
  Switch,
  Space,
  Button,
  Pagination,
  Input,
  Select,
  DatePicker,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
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
  const { RangePicker } = DatePicker;

  const [gameName, setGameName] = useState("");
  const [category, setCategory] = useState("All");
  const [provider, setProvider] = useState("All");
  const [tags, setTags] = useState(["Hot", "New"]);
  const [dateRange, setDateRange] = useState(null);
  const [visibility, setVisibility] = useState(["EN", "ZH"]);

  const handleStateChange = (record, checked) => {
    updateGameCategoryItem(record.key, { state: checked });
  };

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

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 150,
      align: "left",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      align: "left",
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 100,
      align: "center",
      render: () => (
        <div className="category-icon">
          <div className="icon-circle"></div>
        </div>
      ),
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Switch
          checked={record.state}
          onChange={(checked) => handleStateChange(record, checked)}
          className="state-switch"
        />
      ),
    },
    {
      title: "CreateTime",
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
      align: "center",
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <p
            className="edit-link"
            onClick={() => openGameCategoryAddEditModal(record)}
          >
            Edit
          </p>
          <p
            className="delete-link"
            onClick={() => openGameCategoryDeleteModal(record)}
          >
            Delete
          </p>
        </Space>
      ),
    },
  ];

  const handlePageChange = (page) => {
    setGameCategoryCurrentPage(page);
  };

  const createModalShow = () => {
    openGameCategoryAddEditModal();
  };

  const showDeleteModal = () => {
    console.log("Delete modal triggered");
    openGameCategoryDeleteModal();
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

  return (
    <div className="table-container">
      {/* <div className="content-header">
        <div className="header-left">
          <h2 className="page-title">Game Category</h2>
          <div></div>
        </div>
        <div className="function-elements">
          <div></div>
          <Button
            type="primary"
            className="create-button"
            onClick={createModalShow}
          >
            + Create
          </Button>
        </div>
      </div> */}
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
          <div className="search-button-container">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              className="search-button"
            >
              Search
            </Button>
          </div>
        </div>
        <div className="search-filter-row">
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
      <div className="table-wrapper">
        <AntTable
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          className="game-category-table"
          rowClassName="table-row"
          bordered={false}
          size="small"
          scroll={{ x: "max-content", y: 106 * 5 }}
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
