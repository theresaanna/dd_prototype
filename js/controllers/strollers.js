var Strollers = Spine.Controller.sub({
  events: {
    "click .delete": "click",
    "click .category.active": "criteriaDeactivate",
    "click .category.inactive": "criteriaActivate",
    "click .brand.inactive": "criteriaActivate",
    "click .brand.active": "criteriaDeactivate",
    "click .star.inactive": "criteriaActivate",
    "click .star.active": "criteriaDeactivate",
    "click .trait.inactive": "criteriaActivate",
    "click .trait.active": "criteriaDeactivate"
  },
  
  elements: {
    "#listings": "list"
  },
  
  init: function() {
    // this.item.bind("destroy", this.proxy(this.destroy));
    Stroller.bind("refresh change", this.counter);
    Stroller.bind("destroy", this.remove);
  },
  
  // render item list, soon to be removed/refactored
  render: function() {
    this.list.append($("#stroller-list").tmpl(this.item));
  },
  
  // probably a better way to update the view when active listings change, refactor
  remove: function(item) {
    $(".listing").each(function() {
      if ($(this).text() === item.name) {
        $(this).remove();
      }
    })
  },
  
  // rerender the counter
  counter: function() {
    $("#counter").html(Stroller.all().length);
  },
    
  // the primary logic that decides, when any criteria is clicked, what Stroller instances
  // will remain active and which will go into purgatory
  criteriaActivate: function() {
    // cache the criteria that is being evaluated on this call
    var criteria = $(event.target).data("type"),
    // and the specific value selected
        value = $(event.target).text();
    
    
    // toggle classes on the clicked element so that the appropriate event gets called
    $(event.target).addClass("active").removeClass("inactive");
        
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
      if (criteria == "brand") {
        if (item.brand === value) {
          var match = 'yes';
        }
      }
      else if (criteria == "category") {
        var num = item.categories.length
        for (var i = 0; i < num; i++) {
          if (item.categories[i] === value) {
            var match = 'yes';
          }
        }
      }
      else if (criteria == "star") {
        if (parseInt(item.stars) >= parseInt(value)) {
          var match = 'yes';
        }
      }
      else if (criteria == "traits") {
        var num = item.traits.length
        for (var i = 0; i < num; i++) {
          if (item.traits[i] === value) {
            var match = 'yes';
          }
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
          weightcap: item.weightcap,
          image: item.image
        });
        item.destroy();
      }
    });
  },
  
  criteriaDeactivate: function() {
    // toggle classes on the clicked element so that the appropriate event gets called
    $(event.target).addClass("inactive").removeClass("active");
    
    // for each instance of PurgatoryItem that once again meets the active criteria,
    // create a Stroller instance and remove its PurgatoryItem instance
    PurgatoryItem.each(function(record) {
      var criteria = $(event.target).text();
        if (record.removed === criteria) {
          Stroller.create({
            name: record.name,
            categories: record.categories,
            brand: record.brand,
            price: record.price,
            stars: record.stars,
            traits: record.traits,
            weightcap: record.weightcap,
            image: record.image
          });
          record.destroy();
        }
      });
  }
  
});