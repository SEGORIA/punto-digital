import { prisma } from "@punto-digital/db";
import { createProduct } from "../actions";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Nuevo producto</h1>
      <form action={createProduct} className="space-y-4 rounded-2xl border border-border bg-background p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre" name="name" required />
          <Field label="Slug (URL)" name="slug" required placeholder="audifonos-bluetooth-x1" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Marca" name="brand" />
          <Field label="Precio base (COP)" name="basePrice" type="number" required />
        </div>
        <label className="text-sm block">
          <span className="block font-medium mb-1">Categoría</span>
          <select name="categoryId" className="w-full rounded-lg border border-border px-3 py-2">
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <ImageUploader name="image" />
        <label className="text-sm block">
          <span className="block font-medium mb-1">Descripción</span>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <Button type="submit">Crear producto</Button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="text-sm block">
      <span className="block font-medium mb-1">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-brand"
      />
    </label>
  );
}
