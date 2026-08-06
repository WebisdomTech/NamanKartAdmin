import { couponRules } from "../rules/couponRules.js";

export const couponProfile = {
  name: "CouponCreate",
  strictMode: true,
  rules: {
    code: couponRules.code,
    type: couponRules.type,
    value: couponRules.value,
    expiresAt: couponRules.expiresAt,
    minOrderAmount: couponRules.minOrderAmount,
    maxDiscount: couponRules.maxDiscount,
    usageLimit: couponRules.usageLimit,
  },
};
