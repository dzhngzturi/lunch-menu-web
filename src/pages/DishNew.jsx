// src/pages/DishNew.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DishForm from "./DishForm";
import { createDish } from "../api";

const EMPTY = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  image: null,
  menu_type: "regular",
  station: "kitchen",
};

export default function DishNew() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    const fd = new FormData();
    fd.append("category_id", form.category_id);
    fd.append("name", form.name);
    fd.append("description", form.description || "");
    fd.append("price", form.price);
    fd.append("menu_type", form.menu_type);
    fd.append("station", form.station);
    if (form.image instanceof File) fd.append("image", form.image);

    setSaving(true);
    await createDish(fd);
    setSaving(false);
    nav("/admin/dishes"); // <- връщаме към списъка
  };

  const onCancel = () => nav("/admin/dishes");

  return (
    <DishForm
      form={form}
      onChange={onChange}
      onSave={onSave}
      onCancel={onCancel}
      editing={false}
      saving={saving}
    />
  );
}
