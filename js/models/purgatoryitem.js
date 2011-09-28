// a model to hold items that have been destroyed from Stroller but that may be active again due to UI toggling
var PurgatoryItem = Spine.Model.sub();

PurgatoryItem.configure("PurgatoryItem", "deactiveCat", "name", "categories", "brand", "price", "stars", "traits", "weightcap", "image");