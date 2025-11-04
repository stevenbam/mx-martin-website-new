import React from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Main from './Main';
import './App.css';

const App: React.FC = () => {
  return (
    <CartProvider>
      <div className="app">
        <Header />
        <main>
          <Main />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
};

export default App;
