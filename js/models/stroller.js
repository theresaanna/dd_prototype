  var Stroller = Spine.Model.setup("Stroller", 
                                    ["name", "categories", "brand", "price", "stars", "traits", "weightcap", "image"]
                                    );
  
  Stroller.render = function() {
    console.log(this.item);
  }