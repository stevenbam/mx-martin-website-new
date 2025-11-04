import React from 'react';
import ProductItem from './ProductItem';
import { Product } from '../types';
import './Store.css';

const products: Product[] = [
  { id: 1, name: 'T-Shirt', price: '$20', image: '/images/tshirt.jpg' },
  { id: 2, name: 'Hat', price: '$15', image: '/images/hat.jpg' },
  // Add more products as needed
];

const Store: React.FC = () => {
  return (
    <div className="store">
      {products.map((product: Product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Store;
