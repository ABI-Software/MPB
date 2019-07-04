var THREE = require('zincjs').THREE;

var RendererModule = function()  {
  (require('./BaseModule').BaseModule).call(this);
  this.scene = undefined;
  this.toolTip = undefined;
  this.rendererContainer = undefined;
  this.displayArea = undefined;
  this.graphicsHighlight = new (require("../utilities/graphicsHighlight").GraphicsHighlight)();
  this.zincRenderer = null;
}

RendererModule.prototype = Object.create((require('./BaseModule').BaseModule).prototype);

/**
 * This function will get the the first intersected object with name or
 * the first glyph object with name.
 */
RendererModule.prototype.getIntersectedObject = function(intersects) {
	if (intersects) {
		var intersected = undefined;
		for (var i = 0; i < intersects.length; i++) {
			if (intersects[i] !== undefined) {
				if (intersects[i].object && intersects[i].object.name) {					
					if (intersected === undefined)
						intersected = intersects[i];
					if (intersects[i].object.userData && 
					  (intersects[i].object.userData.isGlyph !== undefined)) {
						return intersects[i];
					}
				} 
				
			}
		}
		return intersected;
	}
	return undefined;
}

RendererModule.prototype.setHighlightedByObjects = function(objects, propagateChanges) {
  var changed = this.graphicsHighlight.setHighlighted(objects);
  if (changed && propagateChanges) {
    var eventType = require("../utilities/eventNotifier").EVENT_TYPE.HIGHLIGHTED;
    var annotations = [];
    for (var i = 0; i < objects.length; i++) {
    	if (objects[i].userData && objects[i].userData.userData && objects[i].userData.userData[0] !== undefined)
    		annotations[i] = objects[i].userData.userData[0];
    	else if (objects[i].name !== undefined) {
	        var annotation = new (require('../utilities/annotation').annotation)();
	        annotation.data = {species:undefined, system:undefined, part:objects[i].name, object:objects[i].userData};
	        annotations[i] = annotation;
    	}
    }
    this.publishChanges(annotations, eventType);
  }
  return changed;
}

RendererModule.prototype.setSelectedByObjects = function(objects, propagateChanges) {
  var changed = this.graphicsHighlight.setSelected(objects);
  if (changed && propagateChanges) {
    var eventType = require("../utilities/eventNotifier").EVENT_TYPE.SELECTED;
    var annotations = [];
    for (var i = 0; i < objects.length; i++) {
    	if (objects[i].userData && objects[i].userData.userData && objects[i].userData.userData[0] !== undefined)
    		annotations[i] = objects[i].userData.userData[0];
    	else if (objects[i].name !== undefined) {
	        var annotation = new (require('../utilities/annotation').annotation)();
	        annotation.data = {species:undefined, system:undefined, part:objects[i].name, object:objects[i].userData};
	        annotations[i] = annotation;
    	}
    }
    this.publishChanges(annotations, eventType);
  }
  return changed;
}

var addGlyphToArray = function(objects) {
    return function(glyph) {
      objects.push(glyph.getMesh());
    }
  }

RendererModule.prototype.findObjectsByGroupName = function(groupName) {
  var geometries = this.scene.findGeometriesWithGroupName(groupName);
  var objects = [];
  for (var i = 0; i < geometries.length; i ++ ) {
    objects.push(geometries[i].morph);
  }
  var glyphsets = this.scene.findGlyphsetsWithGroupName(groupName);
  for (var i = 0; i < glyphsets.length; i ++ ) {
    glyphsets[i].forEachGlyph(addGlyphToArray(objects));
  }
  
  return objects;
}

RendererModule.prototype.setHighlightedByGroupName = function(groupName, propagateChanges) {
  var objects = this.findObjectsByGroupName(groupName);
  return this.setHighlightedByObjects(objects, propagateChanges);
}

RendererModule.prototype.setSelectedByGroupName = function(groupName, propagateChanges) {
  var objects = this.findObjectsByGroupName(groupName);
  return this.setSelectedByObjects(objects, propagateChanges);
}

RendererModule.prototype.changeBackgroundColour = function(backgroundColourString) {
  var colour = new THREE.Color(backgroundColourString);
  if (this.zincRenderer) {
    var internalRenderer = this.zincRenderer.getThreeJSRenderer();
    internalRenderer.setClearColor( colour, 1 );
  }
}

RendererModule.prototype.resetView = function() {
  if (this.zincRenderer)
    this.zincRenderer.resetView();
}
  
RendererModule.prototype.viewAll = function() {
  if (this.zincRenderer)
    this.zincRenderer.viewAll();
}

/**
 * Start the animation and let the renderer to processs with
 * time progression
 */
RendererModule.prototype.playAnimation = function(flag) {
  if (this.zincRenderer)
    this.zincRenderer.playAnimation = flag;
}

/**
* Set the speed of playback
*/
RendererModule.prototype.setPlayRate = function(value) {
  if (this.zincRenderer)
    this.zincRenderer.setPlayRate(value);
}

/**
* Get the speed of playback
*/
RendererModule.prototype.getPlayRate = function(value) {
  if (this.zincRenderer)
    return this.zincRenderer.getPlayRate();
  else
    return 0.0;
}
  
  /** Initialise everything in the renderer, including the 3D renderer,
 *  and picker for the 3D renderer.
 * 
 */
RendererModule.prototype.initialiseRenderer = function(displayAreaIn) {
  if (this.zincRenderer === undefined || this.rendererContainer === undefined) {
    var returnedValue = (require("../utility").createRenderer)();
    this.zincRenderer = returnedValue["renderer"];
    this.rendererContainer = returnedValue["container"];
  }
  if (displayAreaIn) {
    this.displayArea = displayAreaIn;
    this.displayArea.appendChild( this.rendererContainer );
    if (this.zincRenderer) {
      this.zincRenderer.animate();
      if (this.toolTip === undefined)
        this.toolTip = new (require("../ui/tooltip").ToolTip)(this.displayArea);
    }
  } 
}

RendererModule.prototype.destroy = function() {
  if (this.zincRenderer) {
    this.zincRenderer.dispose();
    this.zincRenderer.getThreeJSRenderer().dispose();
    this.zincRenderer = undefined;
  }
  (require('./BaseModule').BaseModule).prototype.destroy.call( this );
}
 
exports.RendererModule = RendererModule;
