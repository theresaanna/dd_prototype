// hi, I'm just a humble little Stroller model

var Stroller = Spine.Model.sub();

Stroller.configure("Stroller", "name", "categories", "brand", "price", "stars", "traits", "weightcap", "image");

Stroller.extend({
  brands: function() {
    var brands = [];
    Stroller.each(function(item) {
      if ($.inArray(item.brand, brands) !== -1) {
        return;
      }
      else {
        brands.push(item.brand);
      }
    });
    return brands;
  }
});