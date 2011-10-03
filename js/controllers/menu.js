// when we initialize the controller, we pass in a DOM element for it to bind to
jQuery(function($) {
  return new Menu({
    el: $("#menu")
  });
});

// Menu is subclass of the Spine controller as a parent controller for our app
var Menu = Spine.Controller.sub({
  events: {
    "click .criteria": "breadcrumb",
    "click #go-button": "breadcrumbMenu"
  },
  
  elements: {
    ".listing": "list",
    "#brand-list": "brandList",
    "#traits-list": "traitsList",
    "#weights-list": "weightList",
    ".breadcrumb": "optionsBreadcrumb"
  },

  init: function() {
    //this.routes({
    //  "/strollers": function() {
    //    new Results({el: "#good-stuff", item: Stroller.all()});
    //  }
    //});
    
    // When a new Stroller instance is created, it runs the above "add" method
    Stroller.bind("create", this.proxy(this.add));
    Stroller.bind("setup", this.proxy(this.setup));
    Stroller.bind("reset", this.breadcrumb);
    
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
          weight: this.weight,
          image: this.image
        });
      });
      Stroller.trigger("setup");
    });
  },
  
  add: function(stroller) {
    // when we initialize the controller, we pass in a DOM element for it to bind to
    // as well as an object for it to be associated with in this.item
    var s = new Strollers({el: "#menu", item: stroller});
  },
  
  // after init runs and we populate the Stroller model instances,
  // we want to generate the menu items and attach data to the DOM elements
  // that toggle criteria active/inactive so that we can repurpose logic that
  // makes determinations about whether items should remain active
  setup: function() {
    this.renderList("brand", this.brandList);
    this.renderList("traits", this.traitsList);
    this.renderList("weight", this.weightList);
    
    // attach data to the DOM elements for each criteria so that 
    // when an event fires, we can read the data off of the element
    // to know what should change
    // price and star are not in this array as they are bound in the UI JS
    var criteria = ["brand", "category", "trait", "weight"];
    
    $.each(criteria, function(i, c) {
      $("." + c).each(function(k, ele) {
        $(this).data({"type": c, "value": $(this).text()})
      });
    });
  },
  
  // fetch the various criteria listings from the Stroller model method and template them
  renderList: function(type, ele) {
    var data = Stroller.criteriaList(type),
        list = ele;
    $.each(data, function(k, item) {
        list.append($("#" + type + "-list-tmpl").tmpl({criteria: item}));
    })
  },
  
  // updates the breadcrumb menu shown on results pages
  // as options are selected/deselected
  breadcrumb: function() {
    var origin = $(event.target),
        breadcrumbMenu = this.optionsBreadcrumb;
        
    // if an active menu item or clear link is clicked, check to see what
    // breadcrumb item should be removed or remove all if its a clear link
    if ($(origin).hasClass('active') || origin.data("clear")) {
      $(".breadcrumb-item").each(function(b, c) {
        if ($(c).data("value") === origin.data("value") || origin.data("clear")) {
          $(c).remove();
        }
      })
    }
    
    // if a new criteria has been activated
    // add a matching breadcrumb item
    else if ($(origin).hasClass('inactive')) {
      var criteria = origin.data(),
          ele = $("#options-breadcrumb").tmpl({type: criteria.type, value: criteria.value});
      breadcrumbMenu.append(ele);
      $(".breadcrumb-item").last().data({type: criteria.type, value: criteria.value});
      $(".close-button-breadcrumb").data({clear: "yes"});
    }
  },
  
  breadcrumbMenu: function() {
    $(this.optionsBreadcrumb).addClass("open");
    $(".inner").html('<img src="static/results-page.png"/>');
  }
});  
