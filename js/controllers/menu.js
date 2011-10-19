// when we initialize the controller, we pass in a DOM element for it to bind to
jQuery(function($) {
  return new Menu({
    el: $("#menu")
  });
});

// Menu is subclass of the Spine controller and is the parent controller for our app
// It controls the main menu and breadcrumb menus
var Menu = Spine.Controller.sub({
  events: {
    "click .active": "criteriaDeactivate",
    "click .inactive": "criteriaActivate",
    "click #go-button": "results",
    "click .clear-link": "resetAll",
    "click .close-button-breadcrumb": "criteriaDeactivate"
  },
  
  elements: {
    ".listing": "list",
    "#brand-list": "brandList",
    "#trait-list": "traitList",
    "#weights-list": "weightList",
    "#categories": "categoryList",
    ".breadcrumb": "breadcrumb"
  },

  init: function() {
    //this.routes({
    //  "/strollers": function() {
    //    new Results({el: "#good-stuff", item: Stroller.all()});
    //  }
    //});
    
    // run the appropriate methods when certain changes occur
    // to instances of our three types of models
    Stroller.bind("setup", this.proxy(this.setup));
    MenuItem.bind("sliderchange", this.criteriaActivate);
    Stroller.bind("refresh change", this.counter);
    PurgatoryItem.bind("refresh change", this.counter);
    MenuItem.bind("cleartoggle", this.clearToggle);
    MenuItem.bind("breadcrumbactivate", this.breadcrumbActivate);
    MenuItem.bind("breadcrumbdeactivate", this.breadcrumbDeactivate);
    
    // grab JSON and create a new Stroller for each result
    $.getJSON('feed.json', function(data) {
      $.each(data, function(s) {
        Stroller.create({
          name: this.name,
          category: this.category,
          brand: this.brand,
          price: this.price,
          stars: this.stars,
          trait: this.trait,
          weight: this.weight,
          image: this.image
        });
      });
      
      // calls "Stroller.bind("setup", this.proxy(this.setup));"
      Stroller.trigger("setup");
    });
  },
  
  // after init runs and we populate the Stroller model instances,
  // we want to generate the menu items render the data into the templates
  // that make up our menu
  setup: function() {
    // these are the types of criteria we will handle here
    // the price and stars get taken care of in the UI 
    // jQuery mess as it lives in jQuery UI land
    var criteria = ["brand", "category", "trait", "weight"];
    
    // populate MenuItem model with instances of all menu items listed above
    $.each(criteria, function(i, c) {
      Stroller.each(function(item) {
        var instance = item[c];
        
        // some criteria are stored as objects - when multiple criteria
        // can be assigned in a single Stroller instance. ex: category, trait
        if (typeof instance === "object") {
          $.each(instance, function(j, inst) {
            
            // we don't want to add criteria twice, so if a MenuItem
            // already exists for this criteria, don't add another
            if (MenuItem.findByAttribute("value", inst) === null) {
              MenuItem.create({
                criteria: c,
                value: inst
              });
            }
          });
        }
        
        // handles insertion of strings or ints. ex: brand
        else {
          $.each(item[c], function(){
            if (MenuItem.findByAttribute("value", item[c]) === null) {
              MenuItem.create({
                criteria: c,
                value: item[c]
              });
            }
          });
        }
      });
    });
    
    // call render methods for each of these criteria lists
    this.renderList("category", this.categoryList);
    this.renderList("brand", this.brandList);
    this.renderList("trait", this.traitList);
    this.renderList("weight", this.weightList);
  },
  
  // template the criteria lists and add them to the DOM
  renderList: function(type, ele) {
    var typeList = MenuItem.findAllByAttribute("criteria", type),
        breadcrumb = this.breadcrumb;
        
    $.each(typeList, function(i, ind) {
      var markup = $("#" + type + "-list-tmpl").tmpl({value: ind.value}),
          breadcrumbMarkup = $("#options-breadcrumb").tmpl({type: ind.criteria, value: ind.value});
          
      // attaches main menu bits
      // data is stored on the DOM node so that when actions occur to it
      // later, we can tell what we're working with just from 
      // event.target. see criteriaActivate and criteriaDeactivate
      
      // if we're rendering brands, add in the count
      if (type === "brand") {
        var count = MenuItem.findAllByAttribute(ind.criteria).length;
        ele.append($(markup).data({type: ind.criteria, value: ind.value, count: count}));
      }
      else {
       ele.append($(markup).data({type: ind.criteria, value: ind.value})); 
      }
      
      // attaches breadcrumb menu bits
      breadcrumb.append($(breadcrumbMarkup).data({type: ind.criteria, value: ind.value}));
    });
  },
  
  // rerender the counter
  counter: function() {
    // if all items are currently active, meaning no criteria have been
    // selected that rule out any items, display All instead of the number
    // of items
    var currentLength = Stroller.all().length + PurgatoryItem.all().length;
    if (Stroller.all().length === currentLength) {
      $("#counter").html("All");
      $(".clear-link").hide();
    }
    else {
      $("#counter").html(Stroller.all().length);
      $(".clear-link").show();
    }
    
    // toggle visibility of the clear link
    Stroller.trigger("cleartoggle");
  },
  
  clearToggle: function() {
    $(".clear-link.text-hide").removeClass('text-hide').addClass('inactive');
    $(".clear-link.inactive").removeClass('inactive').addClass('text-hide');
  },
  
  // reset all options when the clear link is clicked
  // super ghetto. should get merged with criteriaDeactivate. or the 
  // actual create/destroy loop should be abstracted. or something.
  resetAll: function(e) {
    e.preventDefault();
    $(".active").each(function(i) {
      $(this).addClass("inactive").removeClass("active");
    });
    $(".breadcrumb").removeClass("open");
    Stroller.trigger("reset");
    PurgatoryItem.each(function(record) {
      Stroller.create({
        name: record.name,
        category: record.category,
        brand: record.brand,
        price: record.price,
        stars: record.stars,
        trait: record.trait,
        weight: record.weight,
        image: record.image
      });
      record.destroy();
    });
    $(".inner").html('<img src="static/content-header.png"/><img src="static/main.png" class="main"/><img src="static/sidebar.png"/>');
  },
  
  // fake little results page creator
  results: function() {
    $(this.breadcrumb).addClass("open");
    $(".inner").html('<img src="static/results-page.png"/>');
  },
  
  // all breadcrumbs are rendered in setup but hidden
  // display them if the corresponding main menu item
  // is activated
  breadcrumbActivate: function(data) {
    $(".breadcrumb-item").each(function(i, b) {
      if ($(b).data("value") === data.value) {
        $(this).removeClass('inactive').addClass('active');
      }
    })
  },
  
  // hide breadcrumb items when the criteria
  // is deactivated
  breadcrumbDeactivate: function(data) {
    $(".breadcrumb-item").each(function(i, b) {
      if ($(b).data("value") === data) {
        $(this).removeClass('active').addClass('inactive');
      }
    });
    
    // if there are no active breadcrumb criteria
    // hide the menu and reset the body
    if ($(".breadcrumb .active").length === 0) {
      $(".breadcrumb").removeClass("open");
      $(".inner").html('<img src="static/content-header.png"/><img src="static/main.png" class="main"/><img src="static/sidebar.png"/>');
    }
  },
  
  // the primary logic that decides, when any criteria is clicked, what Stroller instances
  // will remain active and which will go into purgatory
  criteriaActivate: function(slider) {
    
    // with the sliders, event.target is unreliable so data is
    // passed in via the slider update trigger
    if (slider.value) {
      var criteria = slider.type;
      var value = slider.value;
      var sliderOn = 'yes';
    } else {
      // cache the criteria that is being evaluated on this call
      var criteria = $(event.target).data("type");

      // and the specific value selected
      var value = $(event.target).data("value");
      
      var sliderOn;
    }

    // only execute if we've clicked on a valid criteria input
    if (criteria) {
      if (sliderOn != 'yes') {
        // toggle classes on the clicked element so that the appropriate event gets called
        $(event.target).addClass("active").removeClass("inactive");
      }
      
      // also mirror this on the corresponding breadcrumb menu item
      MenuItem.trigger("breadcrumbactivate", {criteria: criteria, value: value});
      
                    
      // for each category on each instance of Stroller, ultimately return
      // if the clicked category is present on the instance or remove it from
      // Stroller and put it into a new instance of PurgatoryItem.

      // this system of setting active flags to create an "and" listing is
      // extremely inefficient. perhaps a worthwhile refactor might be to 
      // associate stroller or PI items with menuitems?
      Stroller.each(function(item) {
        //don't need to evaluate if another active criteria
        //has rendered this active
        if (typeof item.active !== 'undefined' && item.active.length > 0 && sliderOn != 'yes') {
          item.active.push(value);
          item.save();
          return;
        }
        else {
          item.active = [];
        }
        var match = determineActive(criteria, value, item);

        if (match) {
          item.active.push(value);
          item.save();
          return;
        }
        else {
          PurgatoryItem.create({
            // keep a record of what criteria rendered this item
            // inactive in the instance so that we can quickly recall it without fully reevaluating each
            // item if the criteria is untoggled
            removed: value,
          
            name: item.name,
            category: item.category,
            brand: item.brand,
            price: item.price,
            stars: item.stars,
            trait: item.trait,
            weight: item.weight,
            image: item.image
          });
          item.destroy();
        }
      });

      //evaluate PurgatoryItems and see if they now apply as active
      PurgatoryItem.each(function(item) {
        // i copied and pasted. that is not cool. i shall refactor.
        var match = determineActive(criteria, value, item);
        
        // if it now matches, bring it back into stroller and
        // kill its PI instance
        if (match) {
          Stroller.create({
            name: item.name,
            category: item.category,
            brand: item.brand,
            price: item.price,
            stars: item.stars,
            trait: item.trait,
            weight: item.weight,
            image: item.image,
            active: [value]
          });
          item.destroy();
        }
        else {
          return;
        }
      });
      
      
    }
  },
  
  criteriaDeactivate: function() {
    //only execute if we've clicked on a valid criteria input
    if ($(event.target).data("type") || $(event.target).hasClass('close-button-breadcrumb')) {
      var criteria = $(event.target).data("type");
      
      // if a matched breadcrumb link close button was clicked
      if ($(event.target).hasClass('close-button-breadcrumb')) {
        var value = $(event.target).parent().data("value");
        
        //deactivate matching main menu item
        $(".active").each(function(i, m) {
          if ($(this).data("value") === value) {
            $(this).addClass("inactive").removeClass("active");
          }
        });
      }
      
      // if we've clicked on a main menu item
      else {
        var value = $(event.target).data("value");
        // toggle classes on the clicked element so that the appropriate event gets called
        $(event.target).addClass("inactive").removeClass("active");
      }

      // update breadcrumb menu
      MenuItem.trigger("breadcrumbdeactivate", value);
      
      // if a stroller item is active for only this criteria,
      // deactivate it. otherwise, leave it active but update it
      Stroller.each(function(item) {
        // if the item is active under other criteria,
        // find the one just deactivated and remove it from
        // the list
        if (typeof item.active !== 'undefined' && item.active.length > 0) {
          var len = item.active.length;
          for (var i = 0; i <= len - 1; i++) {
            if (item.active[i] === value) {
              item.active.splice(i,1);
            }
          } 
          //update length to see if we should kill this item
          var len = item.active.length;
        }
        // if there were no active items, well, you get it...
        else {
          var len = 0;
        }
        
        // if this item has no other active criteria, kill it
        if (len === 0) {
          if (determineActive(criteria, value, item) !== 'match') {
            PurgatoryItem.create({
              // keep a record of what criteria rendered this item
              // inactive in the instance so that we can quickly recall it without fully reevaluating each
              // item if the criteria is untoggled
              removed: value,

              name: item.name,
              category: item.category,
              brand: item.brand,
              price: item.price,
              stars: item.stars,
              trait: item.trait,
              weight: item.weight,
              image: item.image
            });
            item.destroy();
          }
        }
      });
    }
  },
  
});  

function determineActive(criteria, value, item) {
  // switch how we determine active state based on applicable criteria in the 
  // Stroller instance and what criteria has been activated. definitely a 
  // to be refactored to be far more elegant
  if (criteria === "brand") {
    if (item.brand === value) {
      var match = 'yes';
    }
  }
  else if (criteria === "category") {
    var num = item.category.length
    for (var i = 0; i < num; i++) {
      if (item.category[i] === value) {
        var match = 'yes';
      }
    }
  }
  else if (criteria === "star") {
    var value = $("#slider-star").data('rating');
    if (parseInt(item.stars) >= parseInt(value)) {
      var match = 'yes';
    }
  }
  else if (criteria === "trait") {
    var num = item.trait.length
    for (var i = 0; i < num; i++) {
      if (item.trait[i] === value) {
        var match = 'yes';
      }
    }
  }
  else if (criteria === "weight") {
    if ($.inArray(value, item.weight) !== -1) {
      var match = 'yes';
    }
  }
  else if (criteria === "price") {
    if (item.price >= value[0] && item.price <= value[1]) {
      var match = 'yes';
    }
  }
  return match;
}
