import React, { useEffect, useState, useMemo } from "react";
import { Table as AntTable, Switch, Space, Button, Pagination, Spin } from "antd";
import AddOrEditModal from "../../../Modal/AddOrEditModal";
import DeleteModal from "../../../Modal/DeleteModal";
import { useAppContext } from "../../../../contexts";
import apiService, { getImageURL } from "../../../../services/api";
import { useNotification } from "../../../../contexts/NotificationContext";
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
  const { notifySuccess, notifyError } = useNotification();
  const [checkingDeleteId, setCheckingDeleteId] = useState(null);

  const { dataSource, pagination, modals, loading, error } = state.gameProvider;
  const { currentPage, pageSize, totalItems } = pagination;
  const { isAddEditModalOpen, isDeleteModalOpen, editingItem, itemToDelete } = modals;

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
    const result = await updateGameProviderItem(record.key, { enabled: checked, state: checked });
    if (result.success) {
      notifySuccess("Provider updated successfully", `"${record.name}" is now ${checked ? "active" : "inactive"}.`);
    } else {
      notifyError(result.error || "Failed to update provider");
    }
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
            className={`delete-link ${checkingDeleteId === record.id ? "disabled" : ""}`}
            onClick={() => {
              if (!checkingDeleteId) {
                handleDeleteRequest(record);
              }
            }}
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

  const getProviderBlockedMessage = useMemo(
    () => (name, linkedGames) => {
      const label = name ? `Provider "${name}"` : "This provider";
      if (typeof linkedGames === "number" && linkedGames >= 0) {
        if (linkedGames === 0) {
          return `${label} cannot be deleted while it is linked to existing games. Remove or reassign those games first.`;
        }
        return `${label} cannot be deleted while it is linked to ${linkedGames} game${linkedGames === 1 ? "" : "s"}. Remove or reassign those games first.`;
      }
      return `${label} cannot be deleted while it is linked to existing games. Remove or reassign those games first.`;
    },
    []
  );

  const handleDeleteOk = async () => {
    const result = await confirmDeleteGameProviderItem();
    if (result.success) {
      notifySuccess("Deletion was successful", "The provider has been removed.");
    } else {
      const relationBlocked =
        result.status === 409 ||
        (result.error && result.error.toLowerCase().includes("cannot delete provider"));
      if (relationBlocked) {
        notifyError(
          getProviderBlockedMessage(itemToDelete?.name)
        );
      } else {
        notifyError(result.error || "Failed to delete provider");
      }
    }
  };

  const handleDeleteRequest = async (record) => {
    if (!record?.id) {
      notifyError("Provider not found");
      return;
    }
    setCheckingDeleteId(record.id);
    try {
      const response = await apiService.checkGameProviderDeletable(record.id);
      const deletable =
        response?.deletable !== false && (response.success || response.success === undefined);
      if (deletable) {
        openGameProviderDeleteModal(record);
      } else {
        notifyError(
          getProviderBlockedMessage(record?.name, response?.linkedGames)
        );
      }
    } catch (error) {
      const message = error.message || "Failed to verify provider deletion.";
      const relationBlocked =
        error.status === 409 ||
        message.toLowerCase().includes("cannot delete") ||
        message.toLowerCase().includes("related games");
      notifyError(
        relationBlocked
          ? getProviderBlockedMessage(record?.name)
          : message
      );
    } finally {
      setCheckingDeleteId(null);
    }
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
        if (result.success) {
          notifySuccess("Provider updated successfully", `"${data.name || editingItem.name}" changes saved.`);
        } else {
          console.error('Failed to update product:', result.error);
          notifyError(result.error || "Failed to update provider");
          return;
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
          notifyError(result.error || "Failed to create provider");
          return;
        }
        notifySuccess("Added correctly.", `"${data.name}" is now available.`);
        // Refresh the list to get updated data with proper pagination
        fetchGameProviders(currentPage, pageSize);
      }
      closeGameProviderAddEditModal();
    } catch (error) {
      console.error('Error in handleOk:', error);
      notifyError(error.message || "Operation failed");
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
