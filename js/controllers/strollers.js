var Strollers = Spine.Controller.sub({
  events: {
    // I shouldn't need to be doing this, but have to work out why the right way isn't working. see below.
    "click .delete": "click",
    //"click .delete": "delete"
  },
  
  init: function() {
    // this.item.bind("destroy", this.proxy(this.destroy));
    Stroller.bind("refresh change", this.counter);
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
  
  counter: function() {
    $("#counter").html(Stroller.all().length);
  }
  
});