import React, { useEffect } from "react";
import {
  Table as AntTable,
  Switch,
  Space,
  Button,
  Pagination,
  Spin,
  message,
} from "antd";
import AddOrEditModal from "../../../Modal/AddOrEditModal";
import DeleteModal from "../../../Modal/DeleteModal";
import { useAppContext } from "../../../../contexts";
import { getImageURL } from "../../../../services/api";
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
    fetchGameCategories,
  } = useAppContext();

  const { dataSource, pagination, modals, loading, error } = state.gameCategory;
  const { currentPage, pageSize, totalItems } = pagination;
  const { isAddEditModalOpen, isDeleteModalOpen, editingItem } = modals;

  // Fetch categories on component mount only if data is empty
  useEffect(() => {
    // Only fetch if dataSource is empty to avoid refetching on navigation
    if (dataSource.length === 0 && !loading) {
      fetchGameCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleStateChange = (record, checked) => {
    updateGameCategoryItem(record.key, { state: checked });
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
      render: (icon, record) => {
        // If there's an uploaded icon, show it; otherwise show default CSS icon
        if (icon && icon !== "") {
          const iconUrl = icon.startsWith("/") && !icon.startsWith("/uploads/") 
            ? icon 
            : getImageURL(icon);
          return (
            <div className="category-icon">
              <img 
                src={iconUrl} 
                alt="category icon" 
                className="category-icon-image"
                onError={(e) => {
                  // If image fails to load, hide image and show default CSS icon
                  e.target.style.display = "none";
                  const parent = e.target.parentElement;
                  if (parent && !parent.querySelector(".icon-circle")) {
                    const defaultIcon = document.createElement("div");
                    defaultIcon.className = "icon-circle";
                    parent.appendChild(defaultIcon);
                  }
                }}
              />
            </div>
          );
        }
        // Default CSS icon
        return (
          <div className="category-icon">
            <div className="icon-circle"></div>
          </div>
        );
      },
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

  const handleDeleteOk = async () => {
    const result = await confirmDeleteGameCategoryItem();
    if (result.success) {
      message.success("Category deleted successfully");
    } else {
      message.error(result.error || "Failed to delete category");
    }
  };

  const handleDeleteCancel = () => {
    console.log("Delete cancelled");
    closeGameCategoryDeleteModal();
  };

  const handleOk = async (data) => {
    if (!data.name || data.name.trim() === "") {
      message.error("Category name is required");
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        const result = await updateGameCategoryItem(editingItem.key, {
          name: data.name,
          icon: data.icon || null,
          visibility: data.visibility,
        });
        if (result.success) {
          message.success("Category updated successfully");
          closeGameCategoryAddEditModal();
        } else {
          message.error(result.error || "Failed to update category");
        }
      } else {
        // Add new item
        const newItem = {
          name: data.name,
          icon: data.icon || null,
          state: true,
          visibility: data.visibility,
        };
        const result = await addGameCategoryItem(newItem);
        if (result.success) {
          message.success("Category created successfully");
          closeGameCategoryAddEditModal();
        } else {
          message.error(result.error || "Failed to create category");
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
      message.error(error.message || "Failed to save category");
    }
  };

  const handleCancel = () => {
    closeGameCategoryAddEditModal();
  };

  return (
    <div className="table-container">
      <div className="content-header">
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
      </div>

      <div className="line"></div>
      <div className="table-wrapper">
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
            <Spin size="large" tip="Loading categories..." />
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
            <Button type="primary" onClick={fetchGameCategories}>
              Retry
            </Button>
          </div>
        ) : (
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
        initialIcon={editingItem?.icon || null}
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
