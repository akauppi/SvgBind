/*
* gx.draggable-test.js
*/
/*global: SVG, svg, assert, describe, it, beforeEach, afterEach*/
/*jshint devel: true */

var assert = chai.assert;
chai.should();

describe('gx.draggable', function () {    // test 'gx.draggable.js' features

  var DEG2RAD = Math.PI / 180.0;

  beforeEach(function () {
    svg.clear();
  });
  afterEach(function () {
  });

  var SIDE= 30;

  var r;
  function create() {
    return svg.gx( function(g) { r= g.rect(SIDE,SIDE); } )
            .origin( SIDE/2, SIDE/2 );
  }

  // Simulate dragging on 'r'
  //
  // Note: The effects of the dispatched events are available right after returning from the function (ie. handling
  //      the events seems to be synchronous).
  //
  var simulateDrag= function (dx,dy) {    // (Num,Num) ->

    // See:
    //    MouseEvent documentation (Mozilla) -> https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
    //    Simulating Mouse Events in JavaScript -> http://marcgrabanski.com/simulating-mouse-click-events-in-javascript/
    //
    // 'svg.rx.js' uses the following events:
    //    "mousedown" (caught at the element level)
    //      .button: 0
    //      .clientX
    //      .clientY
    //    "mousemove" (caught at the window level)
    //      .button 0
    //      .clientX
    //      .clientY
    //    "mouseup" (caught at the window level)
    //      .button 0
    //
    var r_native = r.native();

    // Note: The correctness of our '.clientX' and 'clientY' coordinates is not that important: the dragging code will
    //    not check whether the coordinates actually fell within the borders of the SVG element. It just uses the diff
    //    to the next coordinates to do dragging (also, there's no scaling involved).
    //
    var CX= 0, CY= 0;   // the constants don't matter

    r_native.dispatchEvent(
      new MouseEvent( 'mousedown', {
        button: 0,      // 0: primary button
        bubbles: true,
        clientX: CX,
        clientY: CY
      })
    );

    window.dispatchEvent(
      new MouseEvent( 'mousemove', {
        button: 0,
        bubbles: true,
        clientX: CX+dx,
        clientY: CY+dy
      })
    );

    window.dispatchEvent(
      new MouseEvent( 'mouseup', {
        button: 0,
        bubbles: true
      })
    );
  }

  it ('should be possible to drag a\'Gx\'', function () {
    var X= 100,
      Y= 100,
      DX= 34,
      DY= 56;

    var gx= create().pos(X,Y);

    // Make it draggable
    //
    // Note: This gets exercised also if manually dragging the element, after tests.
    //
    gx.draggable( function(x,y) {
      //console.log( "Dragging", x,y );
    });

    simulateDrag(DX,DY);

    // The dispatched events seem to be acted upon right away: no need for asynchronic waiting here.

    // tbd. Change the control like below, once 'transformBack' works. AKa080516

    var sbox= r.sbox();

    sbox.x.should.be.closeTo( X+DX-SIDE/2, 0.01 );
    sbox.y.should.be.closeTo( Y+DY-SIDE/2, 0.01 );
  });

  it ('should be possible to drag it (when rotated)', function () {
    var X= 100,
      Y= 100,
      DX= 34,
      DY= 56,
      DEG= 15;

    var gx= create().pos(X,Y).rotDeg(DEG);

    // Make it draggable
    //
    gx.draggable( function(x,y) {
      //console.log( "Dragging", x,y );
    });

    simulateDrag(DX,DY);

    // The dispatched events seem to be acted upon right away: no need for asynchronic waiting here.

    var o= r.transformBack( r.cx(), r.cy() );

    o.x.should.be.closeTo( X+DX, 0.01 );
    o.y.should.be.closeTo( Y+DY, 0.01 );
  });

});

