var Strollers = Spine.Controller.sub({
  events: {
    "click .delete": "click",
    "click .category": "category"
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
    // for some reason, every Stroller record gets erased if I do it the way that it should work
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
  
  category: function() {
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
        item.destroy();
      }
    });
  },
  
});