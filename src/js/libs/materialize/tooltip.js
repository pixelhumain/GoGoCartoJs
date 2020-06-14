(function ($) {

    $.fn.hideTooltip = function (options) {
      $('#' + $(this).attr('data-tooltip-id')).hide();
    };

    $.fn.tooltip = function (options) {
        var timeout = null,
        counter = null,
        started = false,
        counterInterval = null,
        margin = 5;

      // Defaults
      var defaults = {
        delay: 350
      };

      // Remove tooltip from the activator
      if (options === "remove") {
        this.each(function(){
          $('#' + $(this).attr('data-tooltip-id')).remove();
        });
        return false;
      }

      options = $.extend(defaults, options);


      return this.each(function(){
        var tooltipId = Materialize.guid();
        var origin = $(this);
        origin.attr('data-tooltip-id', tooltipId);

        // Create Text span
        var tooltip_text = $('<span></span>').text(origin.attr('data-tooltip'));

        // Create tooltip
        var newTooltip = $('<div></div>');
        newTooltip.addClass('material-tooltip gogo-section-content-opposite').append(tooltip_text)
          .appendTo($('body'))
          .attr('id', tooltipId);

       //Destroy previously binded events
      origin.off('mouseenter.tooltip mouseleave.tooltip');
        // Mouse In
      origin.on({
        'mouseenter.tooltip': function(e) {
          var tooltip_delay = origin.data("delay");
          tooltip_delay = (tooltip_delay === undefined || tooltip_delay === '') ? options.delay : tooltip_delay;
          counter = 0;
          counterInterval = setInterval(function(){
            counter += 10;
            if (counter >= tooltip_delay && started === false) {
              started = true;
              newTooltip.css({ display: 'block', left: '0px', top: '0px' });

              // Set Tooltip text
              newTooltip.children('span').text(origin.attr('data-tooltip'));

              // Tooltip positioning
              var originWidth = origin.outerWidth(true);
              var originHeight = origin.outerHeight(true);
              var tooltipPosition =  origin.attr('data-position');
              var tooltipHeight = newTooltip.outerHeight();
              var tooltipWidth = newTooltip.outerWidth();
              var tooltipVerticalMovement = '0px';
              var tooltipHorizontalMovement = '0px';
              var scale_factor = 8;

              newTooltip.addClass('position-' + tooltipPosition);

              if (tooltipPosition === "top") {
              // Top Position
              newTooltip.css({
                top: origin.offset().top - tooltipHeight - margin,
                left: origin.offset().left + originWidth/2 - tooltipWidth/2
              });
              tooltipVerticalMovement = '-5px';
              }
              // Left Position
              else if (tooltipPosition === "left") {
                newTooltip.css({
                  top: origin.offset().top + originHeight/2 - tooltipHeight/2,
                  left: origin.offset().left - tooltipWidth - margin
                });
                tooltipHorizontalMovement = '-5px';
              }
              // Right Position
              else if (tooltipPosition === "right") {
                newTooltip.css({
                  top: origin.offset().top + originHeight/2 - tooltipHeight/2,
                  left: origin.offset().left + originWidth + margin
                });
                tooltipHorizontalMovement = '+5px';
              }
              else {
                // Bottom Position
                newTooltip.css({
                  top: origin.offset().top + origin.outerHeight() + margin,
                  left: origin.offset().left + originWidth/2 - tooltipWidth/2
                });
                tooltipVerticalMovement = '+5px';
              }

              // Calculate Scale to fill
              scale_factor = tooltipWidth / 8;
              if (scale_factor < 8) {
                scale_factor = 8;
              }
              if (tooltipPosition === "right" || tooltipPosition === "left") {
                scale_factor = tooltipWidth / 10;
                if (scale_factor < 6)
                  scale_factor = 6;
              }
              newTooltip.css('opacity', 1);
              newTooltip.css('marginTop', tooltipVerticalMovement);
              newTooltip.css('marginLeft', tooltipHorizontalMovement);
            }
          }, 10); // End Interval

        // Mouse Out
        },
        'mouseleave.tooltip': function(){
          // Reset State
          clearInterval(counterInterval);
          counter = 0;

          newTooltip.css('display', 'none');
          // set property back
          newTooltip.css('opacity', .5);
          newTooltip.css('marginTop', 0);
          newTooltip.css('marginLeft', 0);
          started = false;
        }
        });
    });
  };

  $(document).ready(function(){
     $('.tooltipped').tooltip();
   });
}( jQuery ));
