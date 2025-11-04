import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Product } from '../types';
import './ProductItem.css';

interface ProductItemProps {
  product: Product;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('ProductItem must be used within CartProvider');
  }

  const { addToCart } = context;

  return (
    <div className="product-item">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
};

export default ProductItem;
