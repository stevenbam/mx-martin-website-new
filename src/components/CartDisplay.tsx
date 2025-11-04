import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const CartDisplay: React.FC = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('CartDisplay must be used within CartProvider');
  }

  const { cart } = context;

  return (
    <div>
      <h2>Cart Contents</h2>
      <ul>
        {cart.map((product, index) => (
          <li key={index}>{product.name} - {product.price}</li>
        ))}
      </ul>
    </div>
  );
};

export default CartDisplay;
