import React from "react";
import ProductCard from "./ProductCard";

export default function ProductList({ products, onEdit, onDelete, userRole }) {
  if (!products.length) {
    return <div className="empty">Товаров пока нет</div>;
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          userRole={userRole}
        />
      ))}
    </div>
  );
}