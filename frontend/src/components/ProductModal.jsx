import React, { useEffect, useState } from "react";

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (!open) return;
    
    setName(initialProduct?.name ?? "");
    setCategory(initialProduct?.category ?? "");
    setDescription(initialProduct?.description ?? "");
    setPrice(initialProduct?.price != null ? String(initialProduct.price) : "");
    setStock(initialProduct?.stock != null ? String(initialProduct.stock) : "");
    setRating(initialProduct?.rating != null ? String(initialProduct.rating) : "");
    setImage(initialProduct?.image ?? "");
  }, [open, initialProduct]);

  if (!open) return null;

  const title = mode === "edit" ? "Редактирование товара" : "Добавление товара";

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedRating = rating ? Number(rating) : 0;

    if (!trimmedName) {
      alert("Введите название товара");
      return;
    }

    if (!trimmedCategory) {
      alert("Введите категорию");
      return;
    }

    if (!trimmedDescription) {
      alert("Введите описание");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      alert("Введите корректную цену");
      return;
    }

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      alert("Введите корректное количество");
      return;
    }

    if (parsedRating && (parsedRating < 0 || parsedRating > 5)) {
      alert("Рейтинг должен быть от 0 до 5");
      return;
    }

    onSubmit({
      id: initialProduct?.id,
      name: trimmedName,
      category: trimmedCategory,
      description: trimmedDescription,
      price: parsedPrice,
      stock: parsedStock,
      rating: parsedRating,
      image: image.trim() || undefined
    });
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog" 
        aria-modal="true"
      >
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button 
            className="iconBtn" 
            onClick={onClose} 
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Название товара *
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Классическая футболка"
              autoFocus
            />
          </label>

          <label className="label">
            Категория *
            <input
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Например, Футболки"
            />
          </label>

          <label className="label">
            Описание *
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробное описание товара"
            />
          </label>

          <div className="form-row">
            <label className="label">
              Цена (₽) *
              <input
                className="input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500"
                min="0"
                step="1"
              />
            </label>

            <label className="label">
              Количество *
              <input
                className="input"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="25"
                min="0"
                step="1"
              />
            </label>
          </div>

          <div className="form-row">
            <label className="label">
              Рейтинг
              <input
                className="input"
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="4.5"
                min="0"
                max="5"
                step="0.1"
              />
            </label>

            <label className="label">
              URL фото
              <input
                className="input"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </label>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              {mode === "edit" ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}