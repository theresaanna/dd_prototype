// a model to hold items that have been destroyed from Stroller but that may be active again due to UI toggling
var PurgatoryItem = Spine.Model.sub();

PurgatoryItem.configure("PurgatoryItem", "removed", "name", "category", "brand", "price", "stars", "trait", "weight", "image");