import React from "react";
import "./ProductCard.scss";

export default function ProductCard({ product, onEdit, onDelete, userRole }) {
  const canEdit = userRole === 'seller' || userRole === 'admin';
  const canDelete = userRole === 'admin';

  return (
    <div className="product-card">
      {product.image && (
        <div className="product-card__image">
          <img src={product.image} alt={product.name} />
        </div>
      )}
      <div className="product-card__content">
        <div className="product-card__header">
          <h3 className="product-card__name">{product.name}</h3>
          <span className="product-card__category">{product.category}</span>
        </div>
        
        <p className="product-card__description">{product.description}</p>
        
        <div className="product-card__details">
          <span className="product-card__price">{product.price} ₽</span>
          <span className="product-card__stock">В наличии: {product.stock}</span>
        </div>
        
        {product.rating > 0 && (
          <div className="product-card__rating">
            Рейтинг: {product.rating} ★
          </div>
        )}
        
        <div className="product-card__actions">
          {canEdit && (
            <button 
              className="btn" 
              onClick={() => onEdit(product)}
            >
              ✏️ Редактировать
            </button>
          )}
          {canDelete && (
            <button 
              className="btn btn--danger" 
              onClick={() => onDelete(product.id)}
            >
              🗑️ Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}