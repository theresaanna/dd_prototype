// when we initialize the controller, we pass in a DOM element for it to bind to
jQuery(function($) {
  return new Menu({
    el: $("#menu")
  });
});

// Menu is subclass of the Spine controller as a parent controller for our app
var Menu = Spine.Controller.sub({
  
  elements: {
    ".listing": "list"
  },

  init: function() {
    // When a new Stroller instance is created, it runs the above "add" method
    Stroller.bind("create", this.proxy(this.add));
    
    // grab JSON and create a new Stroller for each result
    $.getJSON('feed.json', function(data) {
      $.each(data, function(s) {
        var stroller = Stroller.create({
          name: this.name,
          categories: this.categories,
          brand: this.brand,
          price: this.price,
          stars: this.stars,
          traits: this.traits,
          weightcap: this.weightcap,
          image: this.image
        });
      });
    });
  },
  
  add: function(stroller) {
    // when we initialize the controller, we pass in a DOM element for it to bind to
    // as well as an object for it to be associated with in this.item
    var s = new Strollers({el: "#list", item: stroller});
    
    // delegate to the Strollers controller render method
    this.list.append(s.render());
  },
    
});  
