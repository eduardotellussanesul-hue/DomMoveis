import React from 'react';
import ProductList from '../components/Products/ProductList';

const ProductsPage: React.FC = () => {
    return (
        <div className="page-container">
            <ProductList />
        </div>
    );
};

export default ProductsPage;