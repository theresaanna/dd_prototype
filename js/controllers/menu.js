// when we initialize the controller, we pass in a DOM element for it to bind to
jQuery(function($) {
  return new Menu({
    el: $("#menu")
  });
});

// Menu is subclass of the Spine controller as a parent controller for our app
var Menu = Spine.Controller.sub({
  
  elements: {
    ".listing": "list",
    "#brand-list": "brandList"
  },

  init: function() {
    // When a new Stroller instance is created, it runs the above "add" method
    Stroller.bind("create", this.proxy(this.add));
    Stroller.bind("setup", this.proxy(this.setup));
    
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
      Stroller.trigger("setup");
    });
  },
  
  add: function(stroller) {
    // when we initialize the controller, we pass in a DOM element for it to bind to
    // as well as an object for it to be associated with in this.item
    var s = new Strollers({el: "#list", item: stroller});
    
    // delegate to the Strollers controller render method
    this.list.append(s.render());
  },
  
  // after init runs and we populate the Stroller model instances,
  // we want to generate the menu items and attach data to the DOM elements
  // that toggle criteria active/inactive so that we can repurpose logic that
  // makes determinations about whether items should remain active
  setup: function() {
    this.renderList();
    
    // to be refactored. should be a little more elegant.
    $("#brand-list div").data({"type": "brand"});
    $(".category").data({"type": "category"});
    $(".star").data({"type": "star"});
  },
  
  // fetch the brand listing from the Stroller model method and template them
  renderList: function() {
    var brands = Stroller.brands(),
        list = this.brandList;
    $.each(brands, function(k, brand) {
      list.append($("#brand-list-tmpl").tmpl({brand: brand}));
    })
  }
    
});  
