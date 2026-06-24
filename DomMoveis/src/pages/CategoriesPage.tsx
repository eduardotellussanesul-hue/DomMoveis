import React from 'react';
import CategoryList from '../components/Categories/CategoryList';

const CategoriesPage: React.FC = () => {
    return (
        <div className="page-container">
            <CategoryList />
        </div>
    );
};

export default CategoriesPage;