"use client";

import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { freeShippingAnnouncement } from "@/lib/shipping";

export function ShippingBenefitText() {
  const { settings } = useCatalogOverrides();
  return (
    <>
      {freeShippingAnnouncement({
        threshold: settings.freeShippingThreshold,
        fee: settings.shippingFee,
      })}
    </>
  );
}
