import {
  Container,
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Table,
  Form,
  Button,
  InputGroup,
  Modal,
  Badge,
  Image
} from "react-bootstrap";

import React, { useEffect, useState } from "react";


import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaSearch, FaSignOutAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { addProduct, deleteProduct, getProducts, updateProduct } from '../../services/products/products-services'
import { uploadImage } from '../../services/cloudinary'
import { SizesComponentTab } from './components/size/size-components'
import { ColorsComponentTab } from './components/colors/colors-components'
import { getSizes } from '../../services/size/size-services'
import { getColors } from '../../services/color/color-services'
import { fetchProductSizeCategories, getCommaWithDecimal, stats, validateForm } from '../../config/functions'
import { imageUrl } from '../../config/image-base'
import { formValue } from './model/admin-models'
import { OrdersComponentTab } from './components/orders/orders-component'
import { getOrders } from '../../services/order/order-services'
import { useAuthStore } from '../../stores/auth-store'
import { logoutUser } from '../../services/auth/auth-services'
import './styles/admin-styles.css';

export const Admin = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sizeCategories, setSizeCategories] = useState([]);
  const [colorCategories, setColorCategories] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(formValue);
  const [formErrors, setFormErrors] = useState({});
  const [flag, setFlag] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
    }
    clearAuth();
    window.location.href = '/';
  };

  const completedOrders = orders.filter(o => o.order_status === 'completed');

  const revenue = `₱${completedOrders
    ?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
    .toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(formValue);
    setFormErrors({});
    setShowProductModal(true);
    setFlag(!flag);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      price: product.price || '',
      stock: product.stock || '',
      image: null,
      imagePreview: product.image ? imageUrl(product.image) : '',
      description: product.description || '',
      brand: product.brand || '',
      status: product.status || 'active',
      sizes: (sizeCategories || [])
        .filter(size =>
          product?.sizes?.some(s => s.name === size.size_name)
        )
        .map(size => size.id),
      colors: (colorCategories || [])
        .filter(color =>
          product?.colors?.some(c => c.name === color.color_name)
        )
        .map(color => color.id)
    });
    setShowProductModal(true);
  };

  const handleSubmit = async () => {
    if (editingProduct !== null) {
      await handleEditProduct();
    } else {
      await handleSaveProduct();
    }
  };

  const handleSaveProduct = async () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let imageUrl = form.image;
      if (form.image instanceof File) {
        const cloudinaryToast = toast.loading('Uploading image...');
        imageUrl = await uploadImage(form.image);
        toast.dismiss(cloudinaryToast);
      }

      const payload = {
        name: form.name,
        brand: form.brand,
        description: form.description,
        price: form.price,
        stock: form.stock,
        status: form.status,
        image: imageUrl,
        sizes: form.sizes,
        colors: form.colors
      };

      const response = await addProduct(payload);
      if (response.status === 200) {
        toast.success('Product added successfully!');
        setFlag(!flag);
        setShowProductModal(false);
      }
    } catch (error) {
      toast.error('An error occurred while adding the product: ' + error.message);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
    || p.sizes.some(size => size.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const handleEditProduct = async () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let imageUrl = form.image;
      if (form.image instanceof File) {
        const cloudinaryToast = toast.loading('Uploading image...');
        imageUrl = await uploadImage(form.image);
        toast.dismiss(cloudinaryToast);
      }

      const payload = {
        name: form.name,
        brand: form.brand,
        description: form.description,
        price: form.price,
        stock: form.stock,
        status: form.status,
        image: imageUrl,
        sizes: form.sizes,
        colors: form.colors
      };

      const response = await updateProduct(editingProduct.id, payload);
      if (response.status === 200) {
        toast.success('Product updated successfully!');
        setFlag(!flag);
        setShowProductModal(false);
        setEditingProduct(null);
      } else {
        toast.error('Failed to update product. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred while editing the product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (id === undefined || id === null) {
      toast.error('Invalid product ID.');
      return;
    }

    try {
      const response = await deleteProduct(id);
      if (response.status === 200) {
        toast.success('Product deleted successfully!');
        setFlag(!flag);
      } else {
        toast.error('Failed to delete product. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the product: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchProductCategories = async () => {
      try {
        const response = await Promise.all([
          getSizes(),
          getColors()
        ]);

        if (response[0].status === 200 && response[1].status === 200) {
          setSizeCategories(response[0].data || []);
          setColorCategories(response[1].data || []);
        } else {
          toast.error('Failed to load product categories');
        }
      } catch (error) {
        toast.error('An error occurred while loading product categories: ', error);
      }
    };

    fetchProductCategories();
  }, [flag]);

  useEffect(() => {
    const fetchRecords = async () => {
      const response = await Promise.all([
        getProducts(),
        getOrders()
      ]);
      if (response[0].status === 200 && response[1].status === 200) {
        setProducts(response[0].data || []);
        setOrders(response[1].data || [])
      } else {
        toast.error('Failed to load records');
      }
    };

    fetchRecords();
  }, [flag]);

  return (
    <React.Fragment>
      <Container fluid className="mt-4 px-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Admin Dashboard</h4>
          <button
            className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Log out
          </button>
        </div>
        {/* Stats Row */}
        <Row className="g-3 mb-4 justify-content-center">
          {stats(products, orders, revenue).map((s, i) => (
            <Col key={i} xs={6} md={3}>
              <Card className={`border-0 shadow-sm text-white bg-${s.color}`}>
                <Card.Body className="py-3">
                  <p className="mb-1 small opacity-75">{s.label}</p>
                  <h4 className="fw-bold mb-0">{s.value}</h4>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Tabs */}
        <Tabs defaultActiveKey="products" className="mb-4 fw-semibold custom-admin-tabs">
          {/* ── Products Tab ── */}
          <Tab eventKey="products" title={<><FaBoxOpen className="me-1" />Products</>}>
            <Card className="shadow-sm border">
              <Card.Body>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                  <InputGroup style={{ maxWidth: '320px' }}>
                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                    <Form.Control
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                    />
                  </InputGroup>
                  <Button variant="dark" onClick={openAddModal}>
                    <FaPlus className="me-1" /> Add Product
                  </Button>
                </div>

                <Table responsive hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          No products found.
                        </td>
                      </tr>
                    ) : filteredProducts.map(product => (
                      <tr>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <Image
                              src={imageUrl(product.image)}
                              rounded
                              style={{ width: 52, height: 52, objectFit: 'cover' }}
                            />
                            <span className="fw-semibold">{product.name}</span>
                          </div>
                        </td>
                        <td>
                          {fetchProductSizeCategories(product).map((size, index) => (
                            <Badge key={index} bg="secondary" className="me-1">
                              {size.name}
                            </Badge>
                          ))}
                        </td>
                        <td className="text-success fw-semibold">
                          ₱{getCommaWithDecimal(product.price)}
                        </td>
                        <td>
                          <Badge bg={product.stock < 10 ? 'danger' : 'success'}>
                            {product.stock} pcs
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            bg={
                              product.status === 'inactive'
                                ? 'secondary'
                                : product.stock <= 0
                                  ? 'danger'
                                  : product.stock < 10
                                    ? 'warning'
                                    : 'success'
                            }
                          >
                            {
                              product.status === 'inactive'
                                ? 'Inactive'
                                : product.stock <= 0
                                  ? 'Out of Stock'
                                  : product.stock < 10
                                    ? 'Low Stock'
                                    : 'Active'
                            }
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => openEditModal(product)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          {/* SIZES (NEW) */}
          <Tab eventKey="sizes" title="Sizes">
            <SizesComponentTab />
          </Tab>

          {/* COLORS (NEW) */}
          <Tab eventKey="colors" title="Colors">
            <ColorsComponentTab />
          </Tab>

          {/* ORDERS (LIST) */}
          <Tab eventKey="orders" title="Orders" tabClassName="ms-auto">
            <OrdersComponentTab />
          </Tab>
        </Tabs>

        {/* ── Add/Edit Product Modal ── */}
        <Modal show={showProductModal} onHide={() => setShowProductModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                {/* LEFT COLUMN */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Product Name</Form.Label>
                    <Form.Control
                      placeholder="e.g. Classic Blue Tee"
                      value={form.name}
                      isInvalid={!!formErrors.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Brand</Form.Label>
                    <Form.Control
                      placeholder="e.g. Estrada Co."
                      value={form.brand}
                      isInvalid={!!formErrors.brand}
                      onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.brand}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Sizes
                      {form.sizes?.length > 0 && (
                        <span className="text-muted fw-normal ms-2" style={{ fontSize: '0.8rem' }}>
                          {form.sizes.length} selected
                        </span>
                      )}
                    </Form.Label>

                    {sizeCategories.length === 0 ? (
                      <p className="text-muted small">No sizes available. Add sizes in the Sizes tab first.</p>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {sizeCategories.map(size => {
                          const isSelected = form.sizes?.includes(size.id);
                          return (
                            <Button
                              key={size.id}
                              size="sm"
                              variant={isSelected ? 'dark' : 'outline-secondary'}
                              style={{ minWidth: '48px' }}
                              onClick={() => {
                                setForm(f => ({
                                  ...f,
                                  sizes: isSelected
                                    ? f.sizes.filter(id => id !== size.id)
                                    : [...(f.sizes || []), size.id],
                                }));
                                setFormErrors(fe => ({ ...fe, sizes: '' }));
                              }}
                            >
                              {size.size_name}
                            </Button>
                          );
                        })}
                      </div>
                    )}

                    {formErrors.sizes && (
                      <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                        {formErrors.sizes}
                      </div>
                    )}
                  </Form.Group>

                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Price (₱)</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          placeholder="0"
                          value={form.price}
                          isInvalid={!!formErrors.price}
                          onChange={e => {
                            const value = e.target.value;
                            if (value >= 0 || value === '') {
                              setForm(f => ({ ...f, price: value }));
                            }
                          }}
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.price}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Stock</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          placeholder="0"
                          value={form.stock}
                          isInvalid={!!formErrors.stock}
                          onChange={e => {
                            const value = e.target.value;
                            if (value >= 0 || value === '') {
                              setForm(f => ({ ...f, stock: value }));
                            }
                          }}
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.stock}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Status</Form.Label>
                    <Form.Select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      {/* <option value="Out of Stock">Out of Stock</option>
                      <option value="Archived">Archived</option> */}
                    </Form.Select>
                  </Form.Group>

                  {/* Colors - Multi Select */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Colors
                      {form.colors?.length > 0 && (
                        <span className="text-muted fw-normal ms-2" style={{ fontSize: '0.8rem' }}>
                          {form.colors.length} selected
                        </span>
                      )}
                    </Form.Label>

                    {colorCategories.length === 0 ? (
                      <p className="text-muted small">No colors available. Add colors in the Colors tab first.</p>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {colorCategories.map(color => {
                          const isSelected = form.colors?.includes(color.id);
                          return (
                            <div
                              key={color.id}
                              title={color.color_name}
                              onClick={() => {
                                setForm(f => ({
                                  ...f,
                                  colors: isSelected
                                    ? f.colors.filter(id => id !== color.id)
                                    : [...(f.colors || []), color.id],
                                }));
                                setFormErrors(fe => ({ ...fe, colors: '' }));
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: isSelected ? '2px solid #212529' : '2px solid #dee2e6',
                                background: isSelected ? '#f8f9fa' : '#fff',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: isSelected ? '600' : '400',
                                transition: 'all 0.15s ease',
                                userSelect: 'none',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  backgroundColor: color.color_name.toLowerCase(),
                                  border: '1px solid #ccc',
                                  flexShrink: 0,
                                }}
                              />
                              {color.color_name}
                              {isSelected && (
                                <span style={{ color: '#212529', fontSize: '0.75rem' }}>✓</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {formErrors.colors && (
                      <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                        {formErrors.colors}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* RIGHT COLUMN */}
                <Col md={6}>
                  {/* Image Upload */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Product Image</Form.Label>

                    {/* Drop zone */}
                    <div
                      className={`border rounded d-flex flex-column align-items-center justify-content-center text-center p-3
                                ${formErrors.image ? 'border-danger' : 'border-secondary'}`}
                      style={{
                        height: '180px',
                        cursor: 'pointer',
                        background: '#f8f9fa',
                        borderStyle: 'dashed !important',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onClick={() => document.getElementById('imageUploadInput').click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          const preview = URL.createObjectURL(file);
                          setForm(f => ({ ...f, image: file, imagePreview: preview }));
                          setFormErrors(fe => ({ ...fe, image: '' }));
                        }
                      }}
                    >
                      {form.imagePreview ? (
                        <Image
                          src={form.imagePreview}
                          style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <>
                          <div style={{ fontSize: '2rem' }}>🖼️</div>
                          <p className="mb-0 text-muted small mt-2">
                            Click or drag & drop an image here
                          </p>
                          <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                            PNG, JPG, WEBP up to 5MB
                          </p>
                        </>
                      )}
                    </div>

                    {/* Hidden file input */}
                    <input
                      id="imageUploadInput"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const preview = URL.createObjectURL(file);
                          setForm(f => ({ ...f, image: file, imagePreview: preview }));
                          setFormErrors(fe => ({ ...fe, image: '' }));
                        }
                      }}
                    />

                    {formErrors.image && (
                      <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                        {formErrors.image}
                      </div>
                    )}

                    {/* Change / Remove buttons */}
                    {form.imagePreview && (
                      <div className="d-flex gap-2 mt-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => document.getElementById('imageUploadInput').click()}
                        >
                          Change Image
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setForm(f => ({ ...f, image: null, imagePreview: '' }))}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </Form.Group>

                  {/* Description */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Describe the product..."
                      value={form.description}
                      isInvalid={!!formErrors.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.description}</Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      {form.description.length} / 300 characters
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProductModal(false)}>Cancel</Button>
            <Button variant="dark" onClick={handleSubmit}>
              {editingProduct ? 'Update Changes' : 'Add Product'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </React.Fragment>
  )
}