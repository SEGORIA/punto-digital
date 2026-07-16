import { notFound } from "next/navigation";
import { prisma } from "@punto-digital/db";
import { updateProduct, addVariant, deleteProduct } from "../actions";
import { Button } from "@/components/ui/button";
import { StockAdjuster } from "@/components/admin/stock-adjuster";
import { VariantBarcodeField } from "@/components/admin/variant-barcode-field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { formatCOP } from "@/lib/utils";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, product.id);
  const addVariantWithId = addVariant.bind(null, product.id);
  const deleteProductWithId = deleteProduct.bind(null, product.id);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar producto</h1>
        <form action={deleteProductWithId}>
          <Button variant="outline" className="text-danger border-danger">
            Eliminar
          </Button>
        </form>
      </div>

      <form action={updateProductWithId} className="space-y-4 rounded-2xl border border-border bg-background p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre" name="name" defaultValue={product.name} required />
          <Field label="Slug (URL)" name="slug" defaultValue={product.slug} required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Marca" name="brand" defaultValue={product.brand ?? ""} />
          <Field
            label="Precio base (COP)"
            name="basePrice"
            type="number"
            defaultValue={product.basePrice}
            required
          />
        </div>
        <label className="text-sm block">
          <span className="block font-medium mb-1">Categoría</span>
          <select
            name="categoryId"
            defaultValue={product.categoryId ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <ImageUploader name="image" defaultValue={product.images[0] ?? ""} />
        <label className="text-sm block">
          <span className="block font-medium mb-1">Descripción</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={product.description ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <Button type="submit">Guardar cambios</Button>
      </form>

      <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
        <h2 className="font-semibold">Variantes e inventario</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="py-2">SKU</th>
              <th className="py-2">Código de barras</th>
              <th className="py-2">Variante</th>
              <th className="py-2">Precio</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Ajustar</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id} className="border-t border-border">
                <td className="py-2 font-mono text-xs">{v.sku}</td>
                <td className="py-2">
                  <VariantBarcodeField
                    variantId={v.id}
                    productId={product.id}
                    defaultValue={v.barcode ?? ""}
                  />
                </td>
                <td className="py-2">{v.label}</td>
                <td className="py-2">{formatCOP(v.priceOverride ?? product.basePrice)}</td>
                <td className="py-2">
                  <span className={v.stock <= v.lowStockThreshold ? "text-danger font-semibold" : ""}>
                    {v.stock}
                  </span>
                </td>
                <td className="py-2">
                  <StockAdjuster variantId={v.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form action={addVariantWithId} className="grid sm:grid-cols-6 gap-2 items-end pt-4 border-t border-border">
          <Field label="SKU" name="sku" required />
          <Field label="Código de barras" name="barcode" />
          <Field label="Nombre variante" name="label" required />
          <Field label="Stock inicial" name="stock" type="number" defaultValue={0} />
          <Field label="Precio override" name="priceOverride" type="number" />
          <Button type="submit" size="sm">
            + Añadir variante
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
}) {
  return (
    <label className="text-sm block">
      <span className="block font-medium mb-1">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-brand"
      />
    </label>
  );
}
