import React, { useState } from "react";
import { Button, Pagination, Modal, Input, Select, DatePicker } from "antd";
import ManagerEditModal from "../../../Modal/ManagerEditModal";
import {
  ExclamationCircleFilled,
  SearchOutlined,
  PlayCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import "./style.css";

const { RangePicker } = DatePicker;

const GameProducts = () => {
  const [currentPage, setCurrentPage] = useState(51);
  const [pageSize] = useState(10);
  const totalItems = 658;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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
    setCurrentPage(page);
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
      zhName: "1000x糖果大战",
      enName: "1000x Candy Battle",
      provider: "All",
      category: "All",
      tags: ["Hot", "New"],
      visibility: ["EN", "ZH", "DE"],
      coverImage: "/cat.jpg",
    });
    setIsModalOpen(true);
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
      <div className="table-wrapper1">
        <div className="products">
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
          <div className="product">
            <div className="product-image-container">
              <img src="/cat.jpg" alt="" className="product-image" />
              <div className="product-overlay">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  className="product-action-btn product-launch-btn"
                  onClick={() => console.log("Lunch clicked")}
                >
                  Lunch
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="product-action-btn product-edit-btn"
                  onClick={() => handleEditClick()}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="product-label">
              <p className="cn">CN:糖果大战</p>
              <p className="en">EN:Candy Wars</p>
            </div>
          </div>
        </div>
        <div className="game-model">
          <img
            src="/model.png"
            alt=""
            style={{ width: "296px", height: "100%" }}
          />
        </div>
      </div>
      <div className="table-pagination1">
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
