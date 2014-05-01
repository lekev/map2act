(function(){
Template.__define__("layout", (function() {
  var self = this;
  var template = this;
  return [ Spacebars.include(self.lookupTemplate("nav")), "\n	", function() {
    return Spacebars.mustache(self.lookup("yield"));
  } ];
}));

})();
