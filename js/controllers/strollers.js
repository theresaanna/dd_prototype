var Strollers = Spine.Controller.sub({
  events: {
    "click .category.active": "criteriaDeactivate",
    "click .category.inactive": "criteriaActivate",
    "click .brand.inactive": "criteriaActivate",
    "click .brand.active": "criteriaDeactivate",
    "click .star.inactive": "criteriaActivate",
    "click .star.active": "criteriaDeactivate",
    "click .trait.inactive": "criteriaActivate",
    "click .trait.active": "criteriaDeactivate",
    "click .weight.inactive": "criteriaActivate",
    "click .weight.active": "criteriaDeactivate",
    "click .clear-link": "resetAll",
    "click .close-button-breadcrumb": "criteriaDeactivate"
  },
  
  init: function() {
    // this.item.bind("destroy", this.proxy(this.destroy));
    Stroller.bind("refresh change", this.counter);
    PurgatoryItem.bind("refresh change", this.counter);
    Stroller.bind("sliderchange", this.criteriaActivate);
    Stroller.bind("sliderremove", this.criteriaDeactivate);
  },
  
  // rerender the counter
  counter: function() {
    var currentLength = Stroller.all().length + PurgatoryItem.all().length;
    if (Stroller.all().length === currentLength) {
      $("#counter").html("All");
      $(".clear-link").addClass("text-hide");
    }
    else {
      $("#counter").html(Stroller.all().length);
      $(".clear-link").removeClass("text-hide");
    }
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
        categories: record.categories,
        brand: record.brand,
        price: record.price,
        stars: record.stars,
        traits: record.traits,
        weight: record.weight,
        image: record.image
      });
      record.destroy();
    });
  },
    
  // the primary logic that decides, when any criteria is clicked, what Stroller instances
  // will remain active and which will go into purgatory
  criteriaActivate: function() {
    // cache the criteria that is being evaluated on this call
    var criteria = $(event.target).data("type");
    // and the specific value selected
    if (criteria === 'price') {
      // the slider has two values - min and max
      var values = $(event.target).data("values");
    }
    else {
      var value = $(event.target).data("value");
    }

    // only execute if we've clicked on a valid criteria input
    if (criteria) {
      // toggle classes on the clicked element so that the appropriate event gets called
      $(event.target).addClass("active").removeClass("inactive");
      
      Stroller.trigger("breadcrumb", {criteria: criteria, value: value});
      
                    
      // for each category on each instance of Stroller, ultimately return
      // if the clicked category is present on the instance or remove it from
      // Stroller and put it into a new instance of PurgatoryItem.
      // this is better than setting a flag on the Stroller instance because
      // going forward, we can rely on all records in Stroller being active
      // and do not have to do checks or suppress events
      Stroller.each(function(item) {
        // switch how we determine active state based on applicable criteria in the 
        // Stroller instance and what criteria has been activated. definitely a 
        // to be refactored to be far more elegant
        if (criteria === "brand") {
          if (item.brand === value) {
            var match = 'yes';
          }
        }
        else if (criteria === "category") {
          var num = item.categories.length
          for (var i = 0; i < num; i++) {
            if (item.categories[i] === value) {
              var match = 'yes';
            }
          }
        }
        else if (criteria === "star") {
          if (parseInt(item.stars) >= parseInt(value)) {
            var match = 'yes';
          }
        }
        else if (criteria === "trait") {
          var num = item.traits.length
          for (var i = 0; i < num; i++) {
            if (item.traits[i] === value) {
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
          if (item.price >= values[0] && item.price <= values[1]) {
            var match = 'yes';
          }
        }

        if (match) {
          return;
        }
        else {
          PurgatoryItem.create({
            // keep a record of what criteria rendered this item
            // inactive in the instance so that we can quickly recall it without fully reevaluating each
            // item if the criteria is untoggled
            removed: value,
          
            name: item.name,
            categories: item.categories,
            brand: item.brand,
            price: item.price,
            stars: item.stars,
            traits: item.traits,
            weight: item.weight,
            image: item.image
          });
          item.destroy();
        }
      });
    }
  },
  
  criteriaDeactivate: function() {
    //only execute if we've clicked on a valid criteria input
    if ($(event.target).data("type") || $(event.target).data("clear")) {
    
      // if a matched breadcrumb link close button was clicked
      if ($(event.target).data("clear")) {
        // remove this breadcrumb item
        Stroller.trigger("reset");
        
        // make inactive associated main menu item
        $(".active").each(function(i, item) {
          if ($(this).data("value")) {
            console.log(this)
            $(this).addClass("inactive").removeClass("active");
          }
        })
      }
      // toggle classes on the clicked element so that the appropriate event gets called
      $(event.target).addClass("inactive").removeClass("active");

      // for each instance of PurgatoryItem that once again meets the active criteria,
      // create a Stroller instance and remove its PurgatoryItem instance
      PurgatoryItem.each(function(record) {
        var criteria = $(event.target).data("value");

        // when we are resetting the price or star, the value won't and shouldn't match
        if (record.removed === criteria || $(event.target).data("type") === "price" || $(event.target).data("type") === "star") {
          Stroller.create({
            name: record.name,
            categories: record.categories,
            brand: record.brand,
            price: record.price,
            stars: record.stars,
            traits: record.traits,
            weight: record.weight,
            image: record.image
          });
          record.destroy();
        }
      });
    }
  }  
});