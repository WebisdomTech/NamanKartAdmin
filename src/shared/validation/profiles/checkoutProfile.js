import { orderRules } from "../rules/orderRules.js";

export const checkoutProfile = {
  name: "Checkout",
  strictMode: true,
  rules: {
    fullName: orderRules.fullName,
    phone: orderRules.phone,
    line1: orderRules.line1,
    line2: orderRules.line2,
    landmark: orderRules.landmark,
    city: orderRules.city,
    state: orderRules.state,
    pincode: orderRules.pincode,
    email: orderRules.email,
  },
};
