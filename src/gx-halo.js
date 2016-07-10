/*
* gx-halo.js
*
* A circular menu wheel, with symbols.
*/
/*jshint devel:true */

(function () {
  "use strict";

  assert(true);
  assert(Gx);

  var RAD_TO_DEG = 180.0 / Math.PI;
  var DEG_TO_RAD = 1/RAD_TO_DEG;

  //--- GxHalo -> Gx
  //
  // Use:
  //    new GxHalo(parent, 20, 50, [o1, o2, ...])
  //
  // 'r1':    Inner radius
  // 'r2':    Outer radius
  // 'spread_deg':  Spread of each menu item (optional)
  //              If provided, one can make menus which are arc-like, instead of covering the whole circle (default).
  //
  // 'oN':
  //    .el:  The initial (or only) element
  //    .el2: The alternative element, swapped when clicked (optional)
  //    .f:   The callback function
  //            Note: setting a menu entry to '.selected' or not is intentionally left to the callback
  //
  // Members:
  //    ._spread_rad: Number
  //
  // Methods:
  //    ._rot:      Place a single menu item to its place
  //    .rotDeg:    Override of the 'Gx' rotation, rotating also the menu items so they remain upright.
  //
  var GxHalo = function (parent, r1, r2, spread_deg, choices) {    // (SVG.Container, Number, Number, Number, array of {el: SVG.Elem, el2: [SVG.Elem], f: () ->}) ->
    var self= this;

    var g = parent.group();

    spread_deg = spread_deg || (360 / choices.length);

    var spread_rad = DEG_TO_RAD * spread_deg;

    g.circle(2*r1).center(0,0).addClass("debug");
    g.circle(2*r2).center(0,0).addClass("debug");

    var rMid = (r1+r2)/2.0;

    // Make a group with arc path and the inner stuff.
    //
    // Returns the subgroup, for rotation and assigning the click handling
    //
    // Note: All this could be within the 'forEach' scope, instead of separate function.
    //
    var addG = function (_g,x,i) {   // (SVG.G, {el: SVG.Element, el2: [SVG.Element], f: () ->, disabled: [Boolean]}, Int) -> SVG.G
      var el = x.el,
        el2 = x.el2,
        f = x.f,
        disabled = x.disabled || false;

      var gg= _g.group();

      // Make the arc path at 0 rad.
      //
      var a = Math.cos(spread_rad/2),
        b = Math.sin(spread_rad/2);

      var rx1= r1*a,
        ry1= r1*b,
        rx2= r2*a,
        ry2= r2*b;

      var arc = gg.path( "M"+rx2+","+(-ry2)+
        "A"+r2+","+r2+",0,0,1,"+rx2+","+ry2+     // larger arc, clockwise
        "L"+rx1+","+ry1+
        "A"+r1+","+r1+",0,0,0,"+rx1+","+(-ry1)+  // smaller arc, counter-clockwise
        "z"
      );

      arc.addClass("arc");   // to be able to limit styling to us

      // Angle of the center
      //
      var rad = (function () {    // scope
        var ii= i - (choices.length)/2 +0.5;
        return Math.PI + spread_rad * ii;
      })();

      arc.rotate( rad * RAD_TO_DEG, 0,0 );

      // Calculate the position for the icon.
      //
      var dx = rMid * Math.cos(rad);
      var dy = rMid * Math.sin(rad);

      // tbd. Some of the menu items are groups. 'svg.js' handling of them (or SVG itself) is elaborate, since it does
      //    not allow transformations on the groups, it seems. We'd like to a) point the origin for the groups, b) then
      //    here position simply by using '.move'. To be worked on once we, hopefully, break free from 'svg.js'. AKa100716
      //
      el.center(dx,dy);

      if (el2) {
        el2.center(dx,dy);
      }

      // Add the elements to the group
      //
      gg.add(arc);
      gg.add(el);

      if (el2) {
        gg.add(el2.hide());
      }

      // Initial disabled state
      //
      if (disabled) {
        gg.addClass("disabled");
      }

      // Click handler
      //
      gg.click( function (ev) {

        if (gg.hasClass("disabled")) {
          // nothing
        } else {
          // If there are two icons, swap them
          //
          if (el2) {
            if (el.visible()) {
              el.hide();
              el2.show();
            } else {
              el2.hide();
              el.show();
            }
          }

          // tbd. Should we do the call so that 'gg' is the 'this'. AKa100716
          f();
        }
      });

      // Prevent default browser action (such as selecting text in the background body)
      //
      // Note: Calling '.preventDefault' on the 'click' event is not sufficient.
      //
      gg.mousedown( function (ev) {
        ev.preventDefault();
      });

      gg.touchstart( function (ev) {
        ev.preventDefault();
      });
    }

    // Add sections, one per elem
    //
    choices.forEach( function (x,i) {
      addG(g,x,i);
    });

    Gx.call( this, parent, g, "gxHalo" );

    this.rotDeg(0);   // place the arcs and menu items to their initial places

    this.origin(0,0);
  };

  GxHalo.prototype = Object.create(Gx.prototype);

  // tbd. If there are methods, add them here.

  // --- Methods ---

  assert( Gx.prototype.rotDeg );    // check there is a method we are overriding

  // Override Gx's 'rotDeg' so that the menu entries stay vertically aligned. Base (rad 0) is east.
  //
  // This can be used by client code to rotate, but also *needs* to be called once, after 'gxHalo' creation, to put
  // the things in right places.
  //
  // Note: We don't want to use regular rotation for the icons, but rather make sure they remain upright. That *could*
  //    be the default behaviour for 'use' and symbols, but we had other problems getting that to work. AKa100716
  //
  GxHalo.prototype.rotDeg = function (deg) {    // (Number) -> ()
    var self= this;

    //var gs = self.children();   // the groups that cover 'path' for arc and the menu icon

    // tbd.
  }

  // tbd. Where and how we want to use the menu is still open (from 'SVG.Doc' or any 'Gx'?). AKa190616
  //
  SVG.extend( SVG.Doc, {
    gxHalo: function (r1, r2, widthDeg, choices) {  // (Number, Number, Number, array of { el: SVG.Element, el2: SVG.Element, f: () -> }) -> GxHalo
      return new GxHalo(this, r1, r2, widthDeg, choices);
    }
  });

})();