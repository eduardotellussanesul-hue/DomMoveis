import React from 'react';
import UserList from '../components/Users/UserList';

const UsersPage: React.FC = () => {
    return (
        <div className="page-container">
            <UserList />
        </div>
    );
};

export default UsersPage;