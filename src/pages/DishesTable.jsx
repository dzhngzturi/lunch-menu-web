// ...imports...
import React, { useState, useEffect } from "react";
import DishForm from "./DishForm"; 
import { getCategories, getDishes, createDish, updateDish, deleteDish } from "../api";

const emptyForm = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  image: null,
  menu_type: "regular",
  station: "kitchen", // ⬅️ ново поле по подразбиране
};

export default function DishesTable() {
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  // ... останалите state/функции ...

  const onChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = async () => {
    const fd = new FormData();
    fd.append("category_id", form.category_id);
    fd.append("name", form.name);
    fd.append("description", form.description || "");
    fd.append("price", form.price);
    fd.append("menu_type", form.menu_type);
    fd.append("station", form.station);              // ⬅️ важно

    if (form.image instanceof File) {
      fd.append("image", form.image);
    }

    if (editing) {
      await updateDish(editing.id, fd);
    } else {
      await createDish(fd);
    }

    setForm(emptyForm);
    setEditing(null);
    await load();
  };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      category_id: row.category_id,
      name: row.name,
      description: row.description || "",
      price: row.price,
      image: null,
      menu_type: row.menu_type || "regular",
      station: row.station || "kitchen",            // ⬅️ зареждаме
    });
  };

  const onCancel = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  return (
    <>
      {/* където ти е формата в този компонент */}
      <DishForm
        form={form}
        onChange={onChange}
        onSave={onSave}
        onCancel={onCancel}
        editing={Boolean(editing)}
      />


      {/* ... таблицата със списъка ... */}
    </>
  );
}
