import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Form, Accordion, Container, Badge } from 'react-bootstrap'
import { toast } from 'react-toastify';
import { Header } from '../../components/header/header';
import { getProducts } from '../../services/products/products-services';
import { getColors } from '../../services/color/color-services';
import { getSizes } from '../../services/size/size-services';
import { getCommaWithDecimal, priceRanges } from '../../config/functions';
import { createCartItem } from '../../services/cart/cart-services';
import { useCartItemCountStore } from '../../stores/use-context-stores';
import { MainPageModal } from './components/main-page-modal/main-page-modal';
import './styles/main-page-styles.css'

export const MainPage = () => {
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    sizes: [],
    colors: [],
    priceRange: '',
  });
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [colorsCategories, setColorsCategories] = useState([]);
  const [sizeCategories, setSizeCategories] = useState([]);

  const { toggleRefreshCart } = useCartItemCountStore();

  const handleShowModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
    setSelectedProduct(null);
    setShowModal(false);
  }

  const handleAddToCart = async () => {
    const cartItem = {
      product_id: Number(selectedProduct?.id) || null,
      size_id: selectedSize?.id || null,
      color_id: selectedColor?.id || null,
      quantity: quantity,
      price: Number(selectedProduct?.price) || 0,
    }

    try {
      const response = await createCartItem(cartItem);
      if (response.status === 200) {
        toast.success('Item added to cart!');
        handleCloseModal();
        toggleRefreshCart();
      } else {
        toast.error('Failed to add item to cart');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred while adding to cart');
    }
  };

  const handleCheckbox = (group, value) => {
    setFilters(prev => {
      const current = prev[group];
      return {
        ...prev,
        [group]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  const handlePriceChange = (e) => {
    setFilters(prev => ({ ...prev, priceRange: e.target.value }));
  };

  const handleClearFilters = () => {
    setFilters({
      sizes: [],
      colors: [],
      priceRange: '',
    });
    setSelectedSize('');
    setSelectedColor('');
  };

  const filteredProducts = productList.filter((product) => {
    const matchSize =
      filters.sizes.length === 0 ||
      product.sizes?.some(size =>
        filters.sizes.includes(size.name)
      );

    const matchColor =
      filters.colors.length === 0 ||
      product.colors?.some(color =>
        filters.colors.includes(color.name)
      );

    const price = parseFloat(product.price);

    const matchPrice = (() => {

      switch (filters.priceRange) {

        case 'under50':
          return price < 50;

        case '50to100':
          return price >= 50 && price <= 100;

        case '100to200':
          return price > 100 && price <= 200;

        case 'above200':
          return price > 200;

        default:
          return true;
      }

    })();

    return matchSize && matchColor && matchPrice;
  });

  useEffect(() => {
    const fetchProductsCategories = async () => {
      const response = await Promise.all([
        getProducts(),
        getColors(),
        getSizes()
      ])
      if (response[0].status === 200) {
        setProductList(response[0].data);
        setColorsCategories(response[1].data);
        setSizeCategories(response[2].data);
      } else {
        toast.error('Failed to fetch products');
      }
    }

    fetchProductsCategories();
  }, []);

  return (
    <React.Fragment>
      <Header />
      <Container fluid className="mt-4 px-4">
        <Row>
          {/* Filter Sidebar */}
          <Col xs={12} md={3} lg={2} className="mb-4">
            <div className="border rounded p-3 bg-white sticky-filter">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Filters</h6>
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger p-0 text-decoration-none"
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
              </div>

              <Accordion defaultActiveKey={['0', '1', '2']} alwaysOpen flush>
                {/* Size */}
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Size</Accordion.Header>
                  <Accordion.Body className="px-0">
                    {sizeCategories.map((size) => (
                      <Form.Check
                        key={size.id}
                        type="checkbox"
                        label={size.size_name}
                        checked={filters.sizes.includes(size.size_name)}
                        onChange={() =>
                          handleCheckbox('sizes', size.size_name)
                        }
                        className="mb-1"
                      />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>

                {/* Color */}
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Color</Accordion.Header>
                  <Accordion.Body className="px-0">
                    {colorsCategories.map((color) => (
                      <Form.Check
                        key={color.id}
                        type="checkbox"
                        label={color.color_name}
                        checked={filters.colors.includes(color.color_name)}
                        onChange={() =>
                          handleCheckbox('colors', color.color_name)
                        }
                        className="mb-1"
                      />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>

                {/* Price Range */}
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Price Range</Accordion.Header>
                  <Accordion.Body className="px-0">
                    {priceRanges.map(range => (
                      <Form.Check
                        key={range.value}
                        type="radio"
                        name="priceRange"
                        label={range.label}
                        value={range.value}
                        checked={filters.priceRange === range.value}
                        onChange={handlePriceChange}
                        className="mb-1"
                      />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </Col>

          {/* Product Grid */}
          <Col xs={12} md={9} lg={10} className='mb-3'>
            <Row xs={1} sm={2} md={2} lg={3} xl={4} className="g-4">
              {filteredProducts.map((product, i) => {
                const isInactive = product.status === "inactive";
                const isOutOfStock = Number(product.stock) <= 0;

                return (
                  <Col key={i}>
                    <Card
                      style={{
                        height: '100%',
                        width: '100%',
                        opacity: isInactive || isOutOfStock ? 0.6 : 1,
                        filter: isInactive || isOutOfStock ? 'grayscale(1)' : 'none',
                        position: 'relative',
                      }}
                      className="product-card"
                    >
                      {/* INACTIVE BADGE */}
                      {isInactive && (
                        <Badge
                          bg="danger"
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            zIndex: 2,
                          }}
                        >
                          Inactive
                        </Badge>
                      )}

                      {/* OUT OF STOCK BADGE */}
                      {isOutOfStock && (
                        <Badge
                          bg="dark"
                          style={{
                            position: 'absolute',
                            top: isInactive ? '45px' : '10px',
                            left: '10px',
                            zIndex: 2,
                          }}
                        >
                          Out of Stock
                        </Badge>
                      )}

                      <Card.Img
                        variant="top"
                        src={`http://localhost:80/estrada_closet_be/${product.image}`}
                        className="card-img-top"
                      />

                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Card.Title>{product.name}</Card.Title>
                          <Card.Subtitle>
                            ₱{getCommaWithDecimal(product?.price)}
                          </Card.Subtitle>
                        </div>

                        <Card.Text>{product.description}</Card.Text>

                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <Button
                            variant="primary"
                            className="me-2"
                            onClick={() => handleShowModal(product)}
                            disabled={isInactive || isOutOfStock}
                          >
                            {isOutOfStock ? 'Out of Stock' : 'View Product'}
                          </Button>
                          <Card.Text>
                            Stock:{' '}
                            <span className={isOutOfStock ? 'text-danger fw-bold' : 'fw-semibold'}>
                              {product.stock}
                            </span>
                          </Card.Text>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Product Details Modal */}
      <MainPageModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        selectedProduct={selectedProduct}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        quantity={quantity}
        setQuantity={setQuantity}
        handleAddToCart={handleAddToCart}
      />
    </React.Fragment>
  );
};