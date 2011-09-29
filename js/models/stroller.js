// hi, I'm just a humble little Stroller model

var Stroller = Spine.Model.sub();

Stroller.configure("Stroller", "name", "categories", "brand", "price", "stars", "traits", "weightcap", "image");

Stroller.extend({
  // method to get a list of criteria of a particular sort (i.e. brands, etc)
  // for rendering
  criteriaList: function(type) {
    var list = [];
    Stroller.each(function(item) {
      
      // if we've passed in an array object instead of a single
      // value for each Stroller instance, handle accordingly
      // also, needs a refactor. this is ugly.
      if (typeof item[type] === "object") {
        $.each(item[type], function(i, val) {
          if ($.inArray(item[type][i], list) != -1) {
            return;
          }
          else {
            list.push(item[type][i]);
          }
        });
      }
      
      // single version
      else {
        if ($.inArray(item[type], list) !== -1) {
          
          return;
        }
        else {
          list.push(item[type]);
        }
      }
    });
    
    return list;
  }
});