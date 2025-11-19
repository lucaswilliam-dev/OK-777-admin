import React, { useEffect } from "react";
import { Table as AntTable, Switch, Space, Button, Pagination, Spin } from "antd";
import AddOrEditModal from "../../../Modal/AddOrEditModal";
import DeleteModal from "../../../Modal/DeleteModal";
import { useAppContext } from "../../../../contexts";
import { getImageURL } from "../../../../services/api";
import "./style.css";

const Table = () => {
  const {
    state,
    updateGameProviderItem,
    addGameProviderItem,
    setGameProviderCurrentPage,
    openGameProviderAddEditModal,
    closeGameProviderAddEditModal,
    openGameProviderDeleteModal,
    closeGameProviderDeleteModal,
    confirmDeleteGameProviderItem,
    fetchGameProviders,
  } = useAppContext();

  const { dataSource, pagination, modals, loading, error } = state.gameProvider;
  const { currentPage, pageSize, totalItems } = pagination;
  const { isAddEditModalOpen, isDeleteModalOpen, editingItem } = modals;

  // Fetch providers on component mount only if data is empty
  useEffect(() => {
    // Only fetch if dataSource is empty to avoid refetching on navigation
    if (dataSource.length === 0 && !loading) {
      fetchGameProviders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Use totalItems for pagination
  const totalCount = totalItems || 0;

  const handleStateChange = async (record, checked) => {
    await updateGameProviderItem(record.key, { enabled: checked, state: checked });
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
      title: "Cover",
      dataIndex: "cover",
      key: "cover",
      width: 120,
      align: "center",
      render: (cover) => (
        <div className="cover-image-container">
          <img
            src={getImageURL(cover)}
            alt="Cover"
            className="cover-image"
            style={{ width: "40px", height: "40px" }}
            onError={(e) => {
              e.target.src = "/cat.jpg";
            }}
          />
        </div>
      ),
    },
    {
      title: "Sort",
      dataIndex: "sort",
      key: "sort",
      width: 100,
      align: "center",
    },
    {
      title: "CreateTime",
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
      align: "center",
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
      title: "操作",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <p
            className="edit-link"
            onClick={() => openGameProviderAddEditModal(record)}
          >
            Edit
          </p>
          <p
            className="delete-link"
            onClick={() => openGameProviderDeleteModal(record)}
          >
            Delete
          </p>
        </Space>
      ),
    },
  ];

  const handlePageChange = (page) => {
    setGameProviderCurrentPage(page);
    // Fetch data for the new page
    fetchGameProviders(page, pageSize);
  };

  const createModalShow = () => {
    openGameProviderAddEditModal();
  };

  const handleDeleteOk = () => {
    console.log("Delete confirmed");
    confirmDeleteGameProviderItem();
  };

  const handleDeleteCancel = () => {
    console.log("Delete cancelled");
    closeGameProviderDeleteModal();
  };

  const handleOk = async (data) => {
    try {
      if (editingItem) {
        // Update existing item
        // Only update image if a new one was uploaded, otherwise keep existing
        const updates = {
          name: data.name || '',
          provider: data.name || editingItem.provider || '',
          title: data.name || editingItem.title || '',
          // Only include image if a new one was uploaded
          ...(data.image && { image: data.image }),
          // Keep existing values for other fields
          currency: editingItem.currency || 'USD',
          status: editingItem.status || 'active',
          providerId: editingItem.providerId || 0,
          code: editingItem.code || 0,
          gameType: editingItem.gameType || '',
          enabled: editingItem.state !== undefined ? editingItem.state : true,
        };
        
        const result = await updateGameProviderItem(editingItem.key, updates);
        if (!result.success) {
          console.error('Failed to update product:', result.error);
          // You could show an error message to the user here
        }
      } else {
        // Add new item
        // Get max code from existing items to generate next code
        // Note: The backend will handle code generation if not provided
        const newItem = {
          name: data.name || '',
          provider: data.name || '',
          title: data.name || '',
          image: data.image || null,
          currency: 'USD',
          status: 'active',
          providerId: 0,
          code: 0, // Let backend generate or use max + 1
          gameType: '',
          enabled: true,
          state: true,
        };
        
        const result = await addGameProviderItem(newItem);
        if (!result.success) {
          console.error('Failed to create product:', result.error);
          // You could show an error message to the user here
        } else {
          // Refresh the list to get updated data with proper pagination
          fetchGameProviders(currentPage, pageSize);
        }
      }
      closeGameProviderAddEditModal();
    } catch (error) {
      console.error('Error in handleOk:', error);
      // You could show an error message to the user here
    }
  };

  const handleCancel = () => {
    closeGameProviderAddEditModal();
  }

  return (
    <div className="table-container">
      <div className="content-header">
        <div className="header-left">
          <h2 className="page-title">Game Provider</h2>
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
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <Spin size="large" tip="Loading providers..." />
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
            <Button type="primary" onClick={fetchGameProviders}>
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
          <div>Total {totalCount}</div>
          <Pagination
            current={currentPage}
            total={totalCount}
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
        initialCover={editingItem?.cover || null}
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
