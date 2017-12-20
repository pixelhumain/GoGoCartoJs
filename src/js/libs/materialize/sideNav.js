(function ($) {

  var methods = {
    init : function(options) {
      var defaults = {
        menuWidth: 240,
        edge: 'left',
        closeOnClick: false
      };
      options = $.extend(defaults, options);

      console.log("sideNive init", options);

      var menu_id = $(this); 

      // Add Touch Area
      var dragTarget = $('.directory-menu-drag-target');
      
      

      

      // Touch Event
      var panning = false;
      var menuOut = false;

      

      
    },
    show : function() {
      this.trigger('click');
    },
    hide : function() {
      $('#directory-menu-overlay').trigger('click');
    }
  };


    $.fn.sideNav = function(methodOrOptions) {
      if ( methods[methodOrOptions] ) {
        return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        // Default to "init"
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.sideNav' );
      }
    }; // Plugin end
}( jQuery ));
