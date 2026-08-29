export enum InteractionEventType {
  VIEW = 'VIEW',             // User viewed an item page
  CLICK = 'CLICK',           // User clicked on an item card/link
  LIKE = 'LIKE',             // User favorited or liked an item
  ADD_TO_CART = 'ADD_TO_CART',// User placed an item in their cart
  PURCHASE = 'PURCHASE',     // User purchased the item
  RATING = 'RATING',         // User submitted an explicit score (e.g., 1–5 stars)
  DISLIKE = 'DISLIKE',       // User expressed negative sentiment
}
