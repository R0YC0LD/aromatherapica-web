import type { ProductOverride } from "@/lib/cms/types";
import type { NormalizedProduct } from "@/lib/ticimax/types";

export function applyProductOverride(
  product: NormalizedProduct,
  override?: ProductOverride | null,
): NormalizedProduct {
  if (!override) return product;

  const imageUrl = override.imageUrl !== undefined ? override.imageUrl : product.images[0] || null;
  const images = imageUrl ? [imageUrl, ...product.images.filter((i) => i !== imageUrl)] : product.images;

  return {
    ...product,
    name: override.name ?? product.name,
    description: override.description ?? product.description,
    seoDescription: override.shortDesc ?? product.seoDescription,
    categoryName: override.categoryName ?? product.categoryName,
    categoryId: override.categoryId !== undefined ? override.categoryId ?? undefined : product.categoryId,
    active: override.active ?? product.active,
    price: override.price ?? product.price,
    salePrice: override.salePrice !== undefined ? override.salePrice ?? undefined : product.salePrice,
    stock: override.stock ?? product.stock,
    images,
    variants: product.variants.map((v, idx) =>
      idx === 0
        ? {
            ...v,
            price: override.price ?? v.price,
            salePrice:
              override.salePrice !== undefined ? override.salePrice ?? undefined : v.salePrice,
            stock: override.stock ?? v.stock,
            imageUrl: imageUrl || v.imageUrl,
            active: override.active ?? v.active,
          }
        : v,
    ),
  };
}
