export let cart;
loadFromStorage();

export function loadFromStorage() {
  cart = JSON.parse(localStorage.getItem("cart"));
  if (!cart) {
    cart = [
      {
        productId: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
        quantity: 2,
        deliveryOptionId: "1",
      },
      {
        productId: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
        quantity: 1,
        deliveryOptionId: "2",
      },
    ];
  }
}

function saveToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(productId, productQuantity) {
  let matchingItem;
  cart.forEach((item) => {
    if (productId === item.productId) {
      matchingItem = item;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += productQuantity;
  } else {
    cart.push({
      productId: productId,
      quantity: productQuantity,
      deliveryOptionId: "1",
    });
  }

  saveToStorage();
}

export function removeFromCart(productId) {
  const newCart = [];

  cart.forEach((cartItem) => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }
  });

  cart = newCart;
  saveToStorage();
}

// Total number of items in the cart (this is what the header shows).
export function calculateCartQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Sets a cart item's quantity to an exact number (unlike addToCart,
// which adds on top of the existing quantity).
export function updateQuantity(productId, newQuantity) {
  const matchingItem = cart.find((item) => item.productId === productId);

  if (!matchingItem) {
    return;
  }

  matchingItem.quantity = newQuantity;
  saveToStorage();
}

export function updateDeliveryOption(productId, deliveryOptionId) {
  const matchingItem = cart.find((item) => item.productId === productId);

  if (!matchingItem) {
    return;
  }

  matchingItem.deliveryOptionId = deliveryOptionId;
  saveToStorage();
}

// Empties the cart (used after an order is placed).
export function resetCart() {
  cart = [];
  saveToStorage();
}

export function loadCart(fun) {
  const xhr = new XMLHttpRequest();

  xhr.addEventListener("load", () => {
    fun();
  });

  xhr.open("GET", "https://supersimplebackend.dev/cart");

  xhr.send();
}
