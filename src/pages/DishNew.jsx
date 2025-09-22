// src/pages/DishNew.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DishForm from "./DishForm";
import { createDish } from "../api";
import { toastSuccess, toastError } from "../utils/toast";

const EMPTY = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  image: null,          // File при качване
  image_existing: "",   // път от наличните
  image_url: "",        // само за преглед
  menu_type: "regular",
  station: "kitchen",
};

export default function DishNew() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    // лека валидация
    if (!String(form.name || "").trim()) {
      toastError("Въведи име на ястие.");
      return;
    }
    if (!String(form.category_id || "").trim()) {
      toastError("Избери категория.");
      return;
    }

    const fd = new FormData();
    fd.append("category_id", form.category_id);
    fd.append("name", form.name);
    fd.append("description", form.description || "");
    fd.append("price", form.price || "");
    fd.append("menu_type", form.menu_type);
    fd.append("station", form.station);

    // снимка – или файл, или път от наличните
    if (form.image_existing) {
      fd.append("image_existing", form.image_existing);
    } else if (form.image instanceof File) {
      fd.append("image", form.image);
    }

    try {
      setSaving(true);
      await createDish(fd);
      toastSuccess("Добавено успешно.");
      nav("/admin/dishes", { replace: true });
    } catch (e) {
      toastError(e?.response?.data?.message || e?.message || "Грешка при добавяне.");
    } finally {
      setSaving(false);
    }
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
