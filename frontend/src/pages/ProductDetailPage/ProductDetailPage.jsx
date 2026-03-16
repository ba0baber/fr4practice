import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../../api';
import './ProductDetailPage.scss';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getById(id);
      setProduct(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error('Error loading product:', err);
      alert('Ошибка загрузки товара');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await productsApi.update(id, formData);
      setProduct(response.data);
      setEditing(false);
      alert('Товар обновлен');
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Ошибка обновления');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить товар?')) return;
    
    try {
      await productsApi.delete(id);
      alert('Товар удален');
      navigate('/');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Ошибка удаления');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!product) return <div className="error">Товар не найден</div>;

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Назад к списку
        </button>

        {!editing ? (
          // Просмотр
          <div className="product-view">
            <h1>{product.name}</h1>
            <div className="product-info">
              <p><strong>Категория:</strong> {product.category}</p>
              <p><strong>Описание:</strong> {product.description}</p>
              <p><strong>Цена:</strong> {product.price} ₽</p>
              <p><strong>В наличии:</strong> {product.stock}</p>
              {product.rating && <p><strong>Рейтинг:</strong> {product.rating}</p>}
            </div>
            <div className="actions">
              <button className="edit-btn" onClick={() => setEditing(true)}>
                Редактировать
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                Удалить
              </button>
            </div>
          </div>
        ) : (
          // Редактирование
          <div className="product-edit">
            <h2>Редактирование товара</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
              <div className="form-group">
                <label>Название</label>
                <input
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Категория</label>
                <input
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Цена</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Количество</label>
                <input
                  name="stock"
                  type="number"
                  value={formData.stock || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Рейтинг</label>
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="actions">
                <button type="submit" className="save-btn">Сохранить</button>
                <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}