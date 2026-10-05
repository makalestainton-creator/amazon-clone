import { calculateCartQuantity } from "../../data/cart.js";

export function renderCheckoutHeader() {
  const link = document.querySelector(".js-return-to-home-link");

  // Safe to call from places where the header doesn't exist (e.g. tests).
  if (!link) {
    return;
  }

  const quantity = calculateCartQuantity();
  link.textContent = `${quantity} ${quantity === 1 ? "item" : "items"}`;
}
