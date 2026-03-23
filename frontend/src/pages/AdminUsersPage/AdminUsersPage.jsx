import React, { useState, useEffect } from 'react';
import { usersApi } from '../../api';
import './AdminUsersPage.scss';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll();
      setUsers(response.data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await usersApi.update(userId, { role: newRole });
      // Обновляем список
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      setEditingUser(null);
      alert('Роль пользователя обновлена');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Ошибка обновления роли');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    
    try {
      await usersApi.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert('Пользователь удален');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Ошибка удаления пользователя');
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'role-admin';
      case 'seller': return 'role-seller';
      default: return 'role-user';
    }
  };

  const getRoleName = (role) => {
    switch(role) {
      case 'admin': return 'Администратор';
      case 'seller': return 'Продавец';
      default: return 'Пользователь';
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-users-page">
      <div className="container">
        <div className="header">
          <h1>Управление пользователями</h1>
          <button className="back-btn" onClick={() => window.location.href = '/'}>
            ← На главную
          </button>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Роль</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>
                    {editingUser === user.id ? (
                      <select 
                        value={user.role} 
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      >
                        <option value="user">Пользователь</option>
                        <option value="seller">Продавец</option>
                        <option value="admin">Администратор</option>
                      </select>
                    ) : (
                      <span className={`role-badge ${getRoleColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      {editingUser === user.id ? (
                        <button 
                          className="cancel-btn"
                          onClick={() => setEditingUser(null)}
                        >
                          Отмена
                        </button>
                      ) : (
                        <button 
                          className="edit-btn"
                          onClick={() => setEditingUser(user.id)}
                        >
                          Изменить роль
                        </button>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'admin'}
                        title={user.role === 'admin' ? 'Нельзя удалить администратора' : ''}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}