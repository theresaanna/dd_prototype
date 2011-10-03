var Results = Spine.Controller.sub({
  init: function(item) {
    //cheating
    $("img.main").remove();
    $(".breadcrumb").addClass('open');
    this.render(this.el);
  },
  
  render: function(el) {
    Stroller.each(function(stroller) {
      el.append($("#stroller-list").tmpl({name: stroller.name, brand: stroller.brand, price: stroller.price}));
    })
  }
  
});