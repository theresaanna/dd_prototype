var Strollers = Spine.Controller.sub({
  events: {
    "click .delete": "click",
    "click .category.active": "categoryDeactivate",
    "click .category.inactive": "categoryActivate"
  },
  
  init: function() {
    // this.item.bind("destroy", this.proxy(this.destroy));
    Stroller.bind("refresh change", this.counter);
    Stroller.bind("destroy", this.remove);
  },
  
  render: function() {
    this.el.append($("#stroller-list").tmpl(this.item));
  },
  
  click: function() {
    // for some reason, every Stroller item gets erased if I do it the way that it should work
    // this is a workaround for refactor
    this.el = $(event.target);
    this.el.remove();
    if (this.item.name === this.el.text()) {
      this.item.destroy();
    }
  },
  
  // probably a better way to update the view, too
  remove: function(item) {
    $(".listing").each(function() {
      if ($(this).text() === item.name) {
        $(this).remove();
      }
    })
  },
  
  counter: function() {
    $("#counter").html(Stroller.all().length);
  },
    
  categoryActivate: function() {
    // toggle classes on the clicked element so that the appropriate event gets called
    $(event.target).addClass("active").removeClass("inactive");
    
    // for each category on each instance of Stroller, ultimately return
    // if the clicked category is present on the instance or remove it from
    // Stroller and put it into a new instance of PurgatoryItem.
    // this is better than setting a flag on the Stroller instance because
    // going forward, we can rely on all records in Stroller being active
    // and do not have to do checks or suppress events
    Stroller.each(function(item) {
      var num = item.categories.length,
          text = $(event.target).text();
      for (var i = 0; i < num; i++) {
        if (item.categories[i] === text) {
          var match = 'yes';
        }
      }
      if (match) {
        return;
      }
      else {
        PurgatoryItem.create({
          // preserve what category it was deleted from for easy
          // toggling back if the user brings back this category
          deactiveCat: text,
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
  
  categoryDeactivate: function() {
    // toggle classes on the clicked element so that the appropriate event gets called
    $(event.target).addClass("inactive").removeClass("active");
    
    // for each instance of PurgatoryItem that once again meets the active criteria,
    // create a Stroller instance and remove its PurgatoryItem instance
    PurgatoryItem.each(function(record) {
      var cat = $(event.target).text();
        if (record.deactiveCat === cat) {
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