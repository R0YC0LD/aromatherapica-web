import type { CartLineInput, StockPriceValidation } from "@/lib/ticimax/types";
import { fetchProductById } from "@/lib/ticimax/products";

function effectivePrice(price: number, salePrice?: number): number {
  return salePrice !== undefined && salePrice > 0 && salePrice < price ? salePrice : price;
}

export async function validateCartLines(lines: CartLineInput[]): Promise<StockPriceValidation> {
  const results: StockPriceValidation["lines"] = [];
  let total = 0;

  for (const line of lines) {
    const product = await fetchProductById(line.productId);
    if (!product) {
      results.push({
        ...line,
        price: 0,
        stock: 0,
        available: false,
        message: "Ürün bulunamadı",
      });
      continue;
    }

    const variant = product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
    if (!variant) {
      results.push({
        ...line,
        price: 0,
        stock: 0,
        available: false,
        message: "Varyant bulunamadı",
      });
      continue;
    }

    const unit = effectivePrice(variant.price, variant.salePrice);
    const available = variant.active && product.active && variant.stock >= line.quantity;

    results.push({
      variantId: variant.id,
      productId: product.id,
      quantity: line.quantity,
      price: variant.price,
      salePrice: variant.salePrice,
      stock: variant.stock,
      available,
      message: available ? undefined : "Yetersiz stok",
    });

    if (available) total += unit * line.quantity;
  }

  return {
    valid: results.length > 0 && results.every((r) => r.available),
    lines: results,
    total,
  };
}
