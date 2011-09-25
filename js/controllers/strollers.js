var Strollers = Spine.Controller.create({
   
  init: function() {
    this.el.bind("update", this.render);
  },
  
  template: function(item) {
    return $.tmpl($("#stroller-list").html(), item);
  },
  
  render: function() {
    this.el.append(this.template(this.item));
  },
  
});
// when we initialize the controller, we pass in a DOM element for it to bind to
var strollers = Strollers.init();
