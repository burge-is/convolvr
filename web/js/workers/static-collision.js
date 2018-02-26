(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/*  static collision detection worker */

var distance2d = function distance2d(a, b) {
	return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[2] - b[2], 2));
},
    distance2dCompare = function distance2dCompare(a, b, n) {
	// more efficient version of distance2d()
	return Math.pow(a[0] - b[0], 2) + Math.pow(a[2] - b[2], 2) < n * n;
},
    distance3dCompare = function distance3dCompare(a, b, n) {
	// ..faster than using Math.sqrt()
	return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2) < n * n;
};

var observer = {
	position: [0, 0, 0],
	prevPos: [0, 0, 0],
	velocity: [0, 0, 0],
	vrHeight: 1.66
},
    voxelList = [],
    voxels = [];

self.update = function () {

	var distance = 0,
	    position = observer.position,
	    innerBox = [false, false],
	    velocity = observer.velocity,
	    vrHeight = observer.vrHeight,
	    collision = false,
	    yPos = 0,
	    voxel = null,
	    ent = null,
	    entRadius = 10,
	    structure = null,
	    bounds = [0, 0],
	    voxel = null,
	    delta = [0, 0],
	    oPos = [],
	    speed = 0,
	    e = 0,
	    i = 0,
	    v = 0;

	for (i = 0; i < voxelList.length; i++) {
		voxel = voxelList[i];

		if (!!!voxel || !!!voxel.position) continue;
		if (!!voxel && distance2dCompare(position, voxel.position, 180)) {
			// do collisions on voxels & structures... just walls at first..
			if (voxel.loaded == undefined) {
				voxel.loaded = true;
				self.postMessage('{"command": "load entities", "data":{"coords":"' + voxel.cell[0] + '.' + voxel.cell[1] + '.' + voxel.cell[2] + '"}}');
			}
			if (distance2dCompare(position, voxel.position, 60)) {

				var alt = voxel.altitude || 0;

				yPos = voxel.position[1];
				if (distance2dCompare(position, voxel.position, 24.5)) {
					if (position[1] > yPos - 21 + vrHeight && position[1] < 14.25 + yPos + (vrHeight != 0 ? vrHeight + 0.25 : 0)) {
						collision = true;
						self.postMessage('{"command": "platform collision", "data":{"type":"top", "position":[' + voxel.position[0] + ',' + yPos + ',' + voxel.position[2] + '] }}');
					}
				}
				if (!!voxel.entities && voxel.entities.length > 0) {
					collision = self.checkStaticCollisions(voxel, position);
				}
			}
		}
	}

	if (!collision) observer.prevPos = [observer.position[0], observer.position[1], observer.position[2]];

	self.postMessage('{"command": "update"}');
	self.updateLoop = setTimeout(function () {
		self.update();
	}, 15);
};

self.checkStaticCollisions = function (voxel, position) {
	var e = voxel.entities.length - 1,
	    ent = null,
	    entRadius = 10,
	    collision = false;

	while (e >= 0) {
		ent = voxel.entities[e];
		entRadius = ent.boundingRadius;
		if (!!!ent || !!!ent.components) {
			console.warn("Problem with entity! ", e, ent);continue;
		}
		if (distance3dCompare(position, [ent.position[0] - entRadius / 2.0, ent.position[1], ent.position[2] - entRadius / 2.0], (entRadius * 1.6 || 3) + 2.5)) {

			ent.components.map(function (entComp) {
				var boundingRadius = entComp.boundingRadius * 1.2 || Math.max(entComp.props.geometry.size[0], entComp.props.geometry.size[2]) * 1.2;

				if (!!entComp.props.floor) {
					var rootPos = ent.position.map(function (v) {
						return v - ent.boundingRadius / 2.0;
					});
					if (distance2dCompare(position, [rootPos[0] + entComp.position[0], 0, rootPos[2] + entComp.position[2]], boundingRadius * 1.7)) {
						var verticalOffset = position[1] + 2 - (entComp.position[1] + ent.position[1]); //  + entComp.geometry ? entComp.geometry.size[1] : 1
						if (verticalOffset > 0 && verticalOffset < 5) {
							self.postMessage(JSON.stringify({
								command: "floor collision", data: {
									position: entComp.position,
									floorData: entComp.props.floor
								}
							}));
							collision = true;
						}
					}
				} else if (distance3dCompare(position, [ent.position[0] + entComp.position[0], ent.position[1] + entComp.position[1], ent.position[2] + entComp.position[2]], boundingRadius)) {
					collision = true;
					self.postMessage(JSON.stringify({ command: "entity-user collision", data: { position: entComp.position } }));
				}
			});
		}
		e -= 1;
	}
	return collision;
};

self.onmessage = function (event) {

	var message = JSON.parse(event.data),
	    data = message.data,
	    user = observer,
	    voxel = null,
	    toRemove = null,
	    items = [],
	    entities = [],
	    c = 0,
	    p = 0;

	if (message.command == "update") {
		// user.prevPos = [user.position[0], user.position[1], user.position[2]];
		user.position = data.position;
		user.velocity = data.velocity;
		user.vrHeight = data.vrHeight;
		//self.postMessage(JSON.stringify(self.observer));
	} else if (message.command == "add voxels") {
		self.addVoxels(message, data);
	} else if (message.command == "remove voxels") {
		self.removeVoxels(message, data);
	} else if (message.command == "add entity") {
		self.addEntity();
	} else if (message.command == "remove entity") {
		self.removeEntity(message, data);
	} else if (message.command == "update entity" || message.command == "update telemetry") {
		if (message.command == "update entity") {
			self.updateEntity(message, data);
		} else {
			self.updateTelemetry(message, data);
		}
	} else if (message.command == "clear") {
		voxels = [];
		voxelList = [];
	} else if (message.command == "start") {
		self.update();
	} else if (message.command == "stop") {
		self.stop();
	} else if (message.command == "log") {
		if (data == "") {
			self.postMessage('{"command":"log","data":[' + user.position[0] + ',' + user.position[1] + ',' + user.position[2] + ']}');
			self.postMessage('{"command":"log","data":' + JSON.stringify(voxels) + '}');
		}
	}
};

self.addVoxels = function (message, data) {
	voxelList = voxelList.concat(data);
	data.map(function (v) {
		voxels[v.cell.join(".")] = v;
	});
};

self.removeVoxels = function (message, data) {
	var toRemove = null,
	    voxel = null,
	    c = 0,
	    p = data.length - 1;

	while (p >= 0) {
		toRemove = data[p];
		c = voxelList.length - 1;

		while (c >= 0) {
			voxel = voxelList[c];
			if (voxel != null && voxel.cell[0] == toRemove.cell[0] && voxel.cell[1] == toRemove.cell[1] && voxel.cell[2] == toRemove.cell[2]) {
				voxelList.splice(c, 1);
				voxels[voxel.cell.join(".")] = null;
			}
			c--;
		}
		p--;
	}
};

self.addEntity = function (message, data) {
	if (!data) {
		console.warn("no data for addEntity");
		return;
	}
	if (!!!voxels[data.coords.join(".")]) {
		voxels[data.coords.join(".")] = { entities: [], cell: data.coords };
	}
	var entities = voxels[data.coords.join(".")].entities;

	entities.push(data.entity);
};

self.removeEntity = function (message, data) {
	var entities = voxels[data.coords.join(".")].entities;

	if (entities != null) {
		var c = entities.length - 1;

		while (c >= 0) {
			if (entities[c].id == data.entityId) {
				voxels[data.coords.join(".")].entities.splice(c, 1);
				c = -1;
			}
			c--;
		}
	}
};

self.updateEntity = function (message, data) {
	var cell = data.coords.join(".");

	if (!data || !data.coords) {
		console.warn("no data to update entity");
		return;
	}
	if (!voxels[cell]) {
		console.warn("can't update entity with no voxel");
		return;
	}
	var entities = voxels[cell].entities;

	if (entities != null) {
		var c = entities.length - 1;

		while (c >= 0) {
			if (entities[c].id == data.entityId) {
				entities[c] = data.entity;
				c = -1;
			}
			c--;
		}
	}
};

self.updateTelemetry = function (message, data) {

	console.warn("physics worker: updateTelemetry()", message, data);
	if (!data || !data.coords) {
		console.warn("no data to update entity");
		return;
	}
	var cell = data.coords.join(".");

	if (!voxels[cell]) {
		console.warn("can't update entity with no voxel");
		return;
	}
	var entities = voxels[cell].entities,
	    oldCell = message.data.oldCoords.join("."),
	    oldEntities = voxels[oldCell];

	if (oldCell != cell) {
		var c = oldEntities.length - 1;

		while (c >= 0) {
			var movedEnt = oldEntities[c];
			if (movedEnt.id == data.entityId) {
				oldEntities.splice(oldEntities.indexOf(movedEnt), 1);
				entities.push(movedEnt);
				console.log("physics worker: update telemetry: moved between voxels");
				movedEnt.position = data.position;
				if (data.quaternion) {
					movedEnt.quaternion = data.quaternion;
				}
				c = -1;
			}
		}
	} else {
		if (entities != null) {
			var _c = entities.length - 1;

			while (_c >= 0) {
				if (entities[_c].id == data.entityId) {
					console.info("physics worker: update telemetry");
					entities[_c].position = data.position;
					if (data.quaternion) {
						entities[_c].quaternion = data.quaternion;
					}
					_c = -1;
				}
				_c--;
			}
		}
	}
};

self.stop = function () {
	clearTimeout(self.updateLoop);
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXHdvcmtlcnNcXHN0YXRpYy1jb2xsaXNpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7QUFFQSxJQUFJLGFBQWEsU0FBYixVQUFhLENBQUUsQ0FBRixFQUFLLENBQUwsRUFBWTtBQUN6QixRQUFPLEtBQUssSUFBTCxDQUFXLEtBQUssR0FBTCxDQUFXLEVBQUUsQ0FBRixJQUFLLEVBQUUsQ0FBRixDQUFoQixFQUF1QixDQUF2QixJQUE2QixLQUFLLEdBQUwsQ0FBVyxFQUFFLENBQUYsSUFBSyxFQUFFLENBQUYsQ0FBaEIsRUFBdUIsQ0FBdkIsQ0FBeEMsQ0FBUDtBQUNELENBRkg7QUFBQSxJQUdFLG9CQUFvQixTQUFwQixpQkFBb0IsQ0FBRSxDQUFGLEVBQUssQ0FBTCxFQUFRLENBQVIsRUFBZTtBQUFFO0FBQ3BDLFFBQU8sS0FBSyxHQUFMLENBQVcsRUFBRSxDQUFGLElBQUssRUFBRSxDQUFGLENBQWhCLEVBQXVCLENBQXZCLElBQTZCLEtBQUssR0FBTCxDQUFXLEVBQUUsQ0FBRixJQUFLLEVBQUUsQ0FBRixDQUFoQixFQUF1QixDQUF2QixDQUE3QixHQUEyRCxJQUFFLENBQXBFO0FBQ0EsQ0FMSDtBQUFBLElBTUUsb0JBQW9CLFNBQXBCLGlCQUFvQixDQUFFLENBQUYsRUFBSyxDQUFMLEVBQVEsQ0FBUixFQUFlO0FBQUU7QUFDcEMsUUFBUSxLQUFLLEdBQUwsQ0FBVyxFQUFFLENBQUYsSUFBSyxFQUFFLENBQUYsQ0FBaEIsRUFBdUIsQ0FBdkIsSUFBNkIsS0FBSyxHQUFMLENBQVcsRUFBRSxDQUFGLElBQUssRUFBRSxDQUFGLENBQWhCLEVBQXVCLENBQXZCLENBQTdCLEdBQTBELEtBQUssR0FBTCxDQUFXLEVBQUUsQ0FBRixJQUFLLEVBQUUsQ0FBRixDQUFoQixFQUF1QixDQUF2QixDQUEzRCxHQUEyRixJQUFFLENBQXBHO0FBQ0EsQ0FSSDs7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QSxPQUFJLFNBQVMsRUFBVCxJQUFlLEtBQUssUUFBeEIsRUFBa0M7QUFDakMsZ0JBQVksTUFBWixDQUFtQixZQUFZLE9BQVosQ0FBb0IsUUFBcEIsQ0FBbkIsRUFBa0QsQ0FBbEQ7QUFDQSxhQUFTLElBQVQsQ0FBYyxRQUFkO0FBQ0EsWUFBUSxHQUFSLENBQVksd0RBQVo7QUFDQSxhQUFTLFFBQVQsR0FBb0IsS0FBSyxRQUF6QjtBQUNBLFFBQUksS0FBSyxVQUFULEVBQXFCO0FBQ3BCLGNBQVMsVUFBVCxHQUFzQixLQUFLLFVBQTNCO0FBQ0E7QUFDRCxRQUFJLENBQUMsQ0FBTDtBQUNBO0FBQ0Q7QUFFRCxFQWpCRCxNQWlCTztBQUNOLE1BQUksWUFBWSxJQUFoQixFQUFzQjtBQUNyQixPQUFJLEtBQUksU0FBUyxNQUFULEdBQWtCLENBQTFCOztBQUVBLFVBQU8sTUFBSyxDQUFaLEVBQWU7QUFDZCxRQUFJLFNBQVMsRUFBVCxFQUFZLEVBQVosSUFBa0IsS0FBSyxRQUEzQixFQUFxQztBQUNwQyxhQUFRLElBQVIsQ0FBYSxrQ0FBYjtBQUNBLGNBQVMsRUFBVCxFQUFZLFFBQVosR0FBdUIsS0FBSyxRQUE1QjtBQUNBLFNBQUksS0FBSyxVQUFULEVBQXFCO0FBQ3BCLGVBQVMsRUFBVCxFQUFZLFVBQVosR0FBeUIsS0FBSyxVQUE5QjtBQUNBO0FBQ0QsVUFBSSxDQUFDLENBQUw7QUFDQTtBQUNEO0FBQ0E7QUFDRDtBQUNEO0FBQ0QsQ0FuREQ7O0FBcURBLEtBQUssSUFBTCxHQUFZLFlBQU07QUFDakIsY0FBYyxLQUFLLFVBQW5CO0FBQ0EsQ0FGRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiAgc3RhdGljIGNvbGxpc2lvbiBkZXRlY3Rpb24gd29ya2VyICovXHJcblxyXG5sZXQgZGlzdGFuY2UyZCA9ICggYSwgYiApID0+IHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoIE1hdGgucG93KCAoYVswXS1iWzBdKSwgMiApICsgTWF0aC5wb3coIChhWzJdLWJbMl0pLCAyICkgKVxyXG4gIH0sXHJcbiAgZGlzdGFuY2UyZENvbXBhcmUgPSAoIGEsIGIsIG4gKSA9PiB7IC8vIG1vcmUgZWZmaWNpZW50IHZlcnNpb24gb2YgZGlzdGFuY2UyZCgpXHJcblx0ICByZXR1cm4gTWF0aC5wb3coIChhWzBdLWJbMF0pLCAyICkgKyBNYXRoLnBvdyggKGFbMl0tYlsyXSksIDIgKSA8IChuKm4pXHJcbiAgfSxcclxuICBkaXN0YW5jZTNkQ29tcGFyZSA9ICggYSwgYiwgbiApID0+IHsgLy8gLi5mYXN0ZXIgdGhhbiB1c2luZyBNYXRoLnNxcnQoKVxyXG5cdCAgcmV0dXJuIChNYXRoLnBvdyggKGFbMF0tYlswXSksIDIgKSArIE1hdGgucG93KCAoYVsxXS1iWzFdKSwgMiApICsgTWF0aC5wb3coIChhWzJdLWJbMl0pLCAyICkgKSA8IChuKm4pXHJcbiAgfVxyXG5cclxubGV0IG9ic2VydmVyID0ge1xyXG5cdFx0cG9zaXRpb246IFswLCAwLCAwXSxcclxuXHRcdHByZXZQb3M6IFswLCAwLCAwXSxcclxuXHRcdHZlbG9jaXR5OiBbMCwgMCwgMF0sXHJcblx0XHR2ckhlaWdodDogMS42NlxyXG5cdH0sXHJcblx0dm94ZWxMaXN0ID0gW10sXHJcblx0dm94ZWxzID0gW11cclxuXHJcbnNlbGYudXBkYXRlID0gKCApID0+IHtcclxuXHJcblx0dmFyIGRpc3RhbmNlID0gMCxcclxuXHRcdHBvc2l0aW9uIFx0ID0gb2JzZXJ2ZXIucG9zaXRpb24sXHJcblx0XHRpbm5lckJveCBcdCA9IFtmYWxzZSwgZmFsc2VdLFxyXG5cdFx0dmVsb2NpdHkgXHQgPSBvYnNlcnZlci52ZWxvY2l0eSxcclxuXHRcdHZySGVpZ2h0IFx0ID0gb2JzZXJ2ZXIudnJIZWlnaHQsXHJcblx0XHRjb2xsaXNpb24gXHQgPSBmYWxzZSxcclxuXHRcdHlQb3MgXHRcdCA9IDAsXHJcblx0XHR2b3hlbCBcdFx0ID0gbnVsbCxcclxuXHRcdGVudCBcdFx0ID0gbnVsbCxcclxuXHRcdGVudFJhZGl1cyAgICA9IDEwLFxyXG5cdFx0c3RydWN0dXJlIFx0ID0gbnVsbCxcclxuXHRcdGJvdW5kcyBcdFx0ID0gWzAsIDBdLFxyXG5cdFx0dm94ZWwgXHRcdCA9IG51bGwsXHJcblx0XHRkZWx0YSBcdFx0ID0gWzAsIDBdLFxyXG5cdFx0b1BvcyBcdFx0ID0gW10sXHJcblx0XHRzcGVlZCBcdFx0ID0gMCxcclxuXHRcdGUgXHRcdFx0ID0gMCxcclxuXHRcdGkgXHRcdFx0ID0gMCxcclxuXHRcdHYgXHRcdFx0ID0gMFxyXG5cclxuXHRmb3IgKCBpID0gMDsgaSA8IHZveGVsTGlzdC5sZW5ndGg7IGkgKysgKSB7XHJcblx0XHR2b3hlbCA9IHZveGVsTGlzdFsgaSBdXHJcblxyXG5cdFx0aWYgKCAhISF2b3hlbCB8fCAhISF2b3hlbC5wb3NpdGlvbikgY29udGludWVcclxuXHRcdGlmICggISF2b3hlbCAmJiBkaXN0YW5jZTJkQ29tcGFyZSggcG9zaXRpb24sIHZveGVsLnBvc2l0aW9uLCAxODAgKSApIHsgXHQvLyBkbyBjb2xsaXNpb25zIG9uIHZveGVscyAmIHN0cnVjdHVyZXMuLi4ganVzdCB3YWxscyBhdCBmaXJzdC4uXHJcblx0XHRcdGlmICggdm94ZWwubG9hZGVkID09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0XHR2b3hlbC5sb2FkZWQgPSB0cnVlXHJcblx0XHRcdFx0c2VsZi5wb3N0TWVzc2FnZSgne1wiY29tbWFuZFwiOiBcImxvYWQgZW50aXRpZXNcIiwgXCJkYXRhXCI6e1wiY29vcmRzXCI6XCInK3ZveGVsLmNlbGxbMF0rJy4nK3ZveGVsLmNlbGxbMV0rJy4nK3ZveGVsLmNlbGxbMl0rJ1wifX0nKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIGRpc3RhbmNlMmRDb21wYXJlKCBwb3NpdGlvbiwgdm94ZWwucG9zaXRpb24sIDYwICkgKSB7XHJcblxyXG5cdFx0XHRcdGxldCBhbHQgPSB2b3hlbC5hbHRpdHVkZSB8fCAwXHJcblxyXG5cdFx0XHRcdHlQb3MgPSB2b3hlbC5wb3NpdGlvblsxXVxyXG5cdFx0XHRcdGlmICggZGlzdGFuY2UyZENvbXBhcmUoIHBvc2l0aW9uLCB2b3hlbC5wb3NpdGlvbiwgMjQuNSApICkge1xyXG5cdFx0XHRcdFx0aWYgKCBwb3NpdGlvblsxXSA+IHlQb3MgLSAyMSArIHZySGVpZ2h0ICAmJiBwb3NpdGlvblsxXSA8IDE0LjI1K3lQb3MgKyAodnJIZWlnaHQgIT0gMCA/IHZySGVpZ2h0KzAuMjUgOiAwKSApIHtcclxuXHRcdFx0XHRcdFx0Y29sbGlzaW9uID0gdHJ1ZVxyXG5cdFx0XHRcdFx0XHRzZWxmLnBvc3RNZXNzYWdlKCd7XCJjb21tYW5kXCI6IFwicGxhdGZvcm0gY29sbGlzaW9uXCIsIFwiZGF0YVwiOntcInR5cGVcIjpcInRvcFwiLCBcInBvc2l0aW9uXCI6WycgKyB2b3hlbC5wb3NpdGlvblswXSArICcsJyArIHlQb3MgKyAnLCcgKyB2b3hlbC5wb3NpdGlvblsyXSArICddIH19Jyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmICggISF2b3hlbC5lbnRpdGllcyAmJiB2b3hlbC5lbnRpdGllcy5sZW5ndGggPiAwICkge1xyXG5cdFx0XHRcdFx0Y29sbGlzaW9uID0gc2VsZi5jaGVja1N0YXRpY0NvbGxpc2lvbnMoIHZveGVsLCBwb3NpdGlvbiApXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRpZiAoICFjb2xsaXNpb24gKVxyXG5cdFx0b2JzZXJ2ZXIucHJldlBvcyA9IFsgb2JzZXJ2ZXIucG9zaXRpb25bMF0sIG9ic2VydmVyLnBvc2l0aW9uWzFdLCBvYnNlcnZlci5wb3NpdGlvblsyXSBdXHJcblxyXG5cdHNlbGYucG9zdE1lc3NhZ2UoJ3tcImNvbW1hbmRcIjogXCJ1cGRhdGVcIn0nKVxyXG5cdHNlbGYudXBkYXRlTG9vcCA9IHNldFRpbWVvdXQoICgpID0+IHtcclxuXHRcdHNlbGYudXBkYXRlKClcclxuXHR9LCAxNSlcclxufVxyXG5cclxuc2VsZi5jaGVja1N0YXRpY0NvbGxpc2lvbnMgPSAoIHZveGVsLCBwb3NpdGlvbiApID0+IHtcclxuXHRsZXQgZSA9IHZveGVsLmVudGl0aWVzLmxlbmd0aCAtIDEsXHJcblx0XHRlbnQgPSBudWxsLFxyXG5cdFx0ZW50UmFkaXVzID0gMTAsXHJcblx0XHRjb2xsaXNpb24gPSBmYWxzZVxyXG5cclxuXHR3aGlsZSAoZSA+PSAwKSB7XHJcblx0XHRlbnQgPSB2b3hlbC5lbnRpdGllc1tlXVxyXG5cdFx0ZW50UmFkaXVzID0gZW50LmJvdW5kaW5nUmFkaXVzXHJcblx0XHRpZiAoISEhZW50IHx8ICEhIWVudC5jb21wb25lbnRzKSB7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIlByb2JsZW0gd2l0aCBlbnRpdHkhIFwiLCBlLCBlbnQpOyBjb250aW51ZVxyXG5cdFx0fVxyXG5cdFx0aWYgKGRpc3RhbmNlM2RDb21wYXJlKFxyXG5cdFx0XHRwb3NpdGlvbixcclxuXHRcdFx0W2VudC5wb3NpdGlvblswXSAtIGVudFJhZGl1cy8yLjAsIGVudC5wb3NpdGlvblsxXSxcclxuXHRcdFx0ZW50LnBvc2l0aW9uWzJdIC0gZW50UmFkaXVzLzIuMF0sIChlbnRSYWRpdXMgKiAxLjYgfHwgMykgKyAyLjVcclxuXHRcdCkpIHtcclxuXHJcblx0XHRcdGVudC5jb21wb25lbnRzLm1hcChlbnRDb21wID0+IHtcclxuXHRcdFx0XHRsZXQgYm91bmRpbmdSYWRpdXMgPSBlbnRDb21wLmJvdW5kaW5nUmFkaXVzICogMS4yIHx8XHJcblx0XHRcdFx0ICAgIE1hdGgubWF4KGVudENvbXAucHJvcHMuZ2VvbWV0cnkuc2l6ZVswXSwgZW50Q29tcC5wcm9wcy5nZW9tZXRyeS5zaXplWzJdKSAqIDEuMlxyXG5cclxuXHRcdFx0XHRpZiAoISFlbnRDb21wLnByb3BzLmZsb29yKSB7XHJcblx0XHRcdFx0XHRsZXQgcm9vdFBvcyA9IGVudC5wb3NpdGlvbi5tYXAoIHYgPT4gdi1lbnQuYm91bmRpbmdSYWRpdXMgLyAyLjAgKVxyXG5cdFx0XHRcdFx0aWYgKGRpc3RhbmNlMmRDb21wYXJlKFxyXG5cdFx0XHRcdFx0XHRwb3NpdGlvbixcclxuXHRcdFx0XHRcdFx0W3Jvb3RQb3NbMF0gKyBlbnRDb21wLnBvc2l0aW9uWzBdLCAwLCByb290UG9zWzJdICsgZW50Q29tcC5wb3NpdGlvblsyXV0sXHJcblx0XHRcdFx0XHRcdGJvdW5kaW5nUmFkaXVzICogMS43XHJcblx0XHRcdFx0XHQpKSB7XHJcblx0XHRcdFx0XHRcdGxldCB2ZXJ0aWNhbE9mZnNldCA9IChwb3NpdGlvblsxXSArIDIgLSAoZW50Q29tcC5wb3NpdGlvblsxXSArIGVudC5wb3NpdGlvblsxXSApKSAvLyAgKyBlbnRDb21wLmdlb21ldHJ5ID8gZW50Q29tcC5nZW9tZXRyeS5zaXplWzFdIDogMVxyXG5cdFx0XHRcdFx0XHRpZiAodmVydGljYWxPZmZzZXQgPiAwICYmIHZlcnRpY2FsT2Zmc2V0IDwgNSkge1xyXG5cdFx0XHRcdFx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoe1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29tbWFuZDogXCJmbG9vciBjb2xsaXNpb25cIiwgZGF0YToge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbjogZW50Q29tcC5wb3NpdGlvbixcclxuXHRcdFx0XHRcdFx0XHRcdFx0Zmxvb3JEYXRhOiBlbnRDb21wLnByb3BzLmZsb29yXHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSkpXHJcblx0XHRcdFx0XHRcdFx0Y29sbGlzaW9uID0gdHJ1ZVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIGlmIChkaXN0YW5jZTNkQ29tcGFyZShcclxuXHRcdFx0XHRcdHBvc2l0aW9uLFxyXG5cdFx0XHRcdFx0W2VudC5wb3NpdGlvblswXSArIGVudENvbXAucG9zaXRpb25bMF0sIGVudC5wb3NpdGlvblsxXSArIGVudENvbXAucG9zaXRpb25bMV0sIGVudC5wb3NpdGlvblsyXSArIGVudENvbXAucG9zaXRpb25bMl1dLFxyXG5cdFx0XHRcdFx0Ym91bmRpbmdSYWRpdXNcclxuXHRcdFx0XHQpKSB7XHJcblx0XHRcdFx0XHRjb2xsaXNpb24gPSB0cnVlXHJcblx0XHRcdFx0XHRzZWxmLnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogXCJlbnRpdHktdXNlciBjb2xsaXNpb25cIiwgZGF0YTogeyBwb3NpdGlvbjogZW50Q29tcC5wb3NpdGlvbiB9IH0pKVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0XHRlIC09IDFcclxuXHR9XHJcblx0cmV0dXJuIGNvbGxpc2lvblxyXG59XHJcblxyXG5zZWxmLm9ubWVzc2FnZSA9ICggZXZlbnQgKSA9PiB7XHJcblxyXG5cdHZhciBtZXNzYWdlICA9IEpTT04ucGFyc2UoIGV2ZW50LmRhdGEgKSxcclxuXHRcdGRhdGEgXHQgPSBtZXNzYWdlLmRhdGEsXHJcblx0XHR1c2VyIFx0ID0gb2JzZXJ2ZXIsXHJcblx0XHR2b3hlbCBcdCA9IG51bGwsXHJcblx0XHR0b1JlbW92ZSA9IG51bGwsXHJcblx0XHRpdGVtcyBcdCA9IFtdLFxyXG5cdFx0ZW50aXRpZXMgPSBbXSxcclxuXHRcdGMgXHRcdCA9IDAsXHJcblx0XHRwIFx0XHQgPSAwXHJcblxyXG5cdGlmICggbWVzc2FnZS5jb21tYW5kID09IFwidXBkYXRlXCIgKSB7XHJcblx0XHQvLyB1c2VyLnByZXZQb3MgPSBbdXNlci5wb3NpdGlvblswXSwgdXNlci5wb3NpdGlvblsxXSwgdXNlci5wb3NpdGlvblsyXV07XHJcblx0XHR1c2VyLnBvc2l0aW9uID0gZGF0YS5wb3NpdGlvblxyXG5cdFx0dXNlci52ZWxvY2l0eSA9IGRhdGEudmVsb2NpdHlcclxuXHRcdHVzZXIudnJIZWlnaHQgPSBkYXRhLnZySGVpZ2h0XHJcblx0XHQvL3NlbGYucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoc2VsZi5vYnNlcnZlcikpO1xyXG5cdH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcImFkZCB2b3hlbHNcIiApIHtcclxuXHRcdHNlbGYuYWRkVm94ZWxzKCBtZXNzYWdlLCBkYXRhIClcclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJyZW1vdmUgdm94ZWxzXCIgKSB7XHJcblx0XHRzZWxmLnJlbW92ZVZveGVscyggbWVzc2FnZSwgZGF0YSApXHJcblx0fSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwiYWRkIGVudGl0eVwiICkge1xyXG5cdFx0c2VsZi5hZGRFbnRpdHkoKVxyXG4gIFx0fSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwicmVtb3ZlIGVudGl0eVwiICkge1xyXG4gICAgXHRzZWxmLnJlbW92ZUVudGl0eSggbWVzc2FnZSwgZGF0YSApXHJcblx0fSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwidXBkYXRlIGVudGl0eVwiIHx8IG1lc3NhZ2UuY29tbWFuZCA9PSBcInVwZGF0ZSB0ZWxlbWV0cnlcIiApIHtcclxuXHRcdGlmICggbWVzc2FnZS5jb21tYW5kID09IFwidXBkYXRlIGVudGl0eVwiICkge1xyXG5cdFx0XHRzZWxmLnVwZGF0ZUVudGl0eSggbWVzc2FnZSwgZGF0YSApXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRzZWxmLnVwZGF0ZVRlbGVtZXRyeSggbWVzc2FnZSwgZGF0YSApXHJcblx0XHR9XHJcblx0fSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwiY2xlYXJcIiApIHtcclxuXHRcdHZveGVscyA9IFtdXHJcblx0XHR2b3hlbExpc3QgPSBbXVxyXG5cdH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcInN0YXJ0XCIgKSB7XHJcblx0XHRzZWxmLnVwZGF0ZSgpXHJcblx0fSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwic3RvcFwiICkge1xyXG5cdFx0c2VsZi5zdG9wKClcclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJsb2dcIiApIHtcclxuXHRcdGlmIChkYXRhID09IFwiXCIpIHtcclxuXHRcdFx0c2VsZi5wb3N0TWVzc2FnZSgne1wiY29tbWFuZFwiOlwibG9nXCIsXCJkYXRhXCI6WycgKyB1c2VyLnBvc2l0aW9uWzBdICsgJywnICsgdXNlci5wb3NpdGlvblsxXSArICcsJyArIHVzZXIucG9zaXRpb25bMl0gKyAnXX0nKTtcclxuXHRcdFx0c2VsZi5wb3N0TWVzc2FnZSgne1wiY29tbWFuZFwiOlwibG9nXCIsXCJkYXRhXCI6JyArIEpTT04uc3RyaW5naWZ5KHZveGVscykrICd9Jyk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuc2VsZi5hZGRWb3hlbHMgPSAobWVzc2FnZSwgZGF0YSkgPT4ge1xyXG5cdHZveGVsTGlzdCA9IHZveGVsTGlzdC5jb25jYXQoZGF0YSlcclxuXHRkYXRhLm1hcCggdiA9PiB7XHJcblx0XHR2b3hlbHNbIHYuY2VsbC5qb2luKFwiLlwiKSBdID0gdlxyXG5cdH0pXHJcbn1cclxuXHJcbnNlbGYucmVtb3ZlVm94ZWxzID0gKG1lc3NhZ2UsIGRhdGEpID0+IHtcclxuXHRsZXQgdG9SZW1vdmUgPSBudWxsLFxyXG5cdFx0dm94ZWwgPSBudWxsLFxyXG5cdFx0YyBcdFx0ID0gMCxcclxuXHRcdHAgXHRcdCA9IGRhdGEubGVuZ3RoIC0xXHJcblxyXG5cdHdoaWxlICggcCA+PSAwICkge1xyXG5cdFx0dG9SZW1vdmUgPSBkYXRhW3BdXHJcblx0XHRjID0gdm94ZWxMaXN0Lmxlbmd0aC0xXHJcblxyXG5cdFx0d2hpbGUgKCBjID49IDAgKSB7XHJcblx0XHRcdHZveGVsID0gdm94ZWxMaXN0WyBjIF1cclxuXHRcdFx0aWYgKCB2b3hlbCAhPSBudWxsICYmIHZveGVsLmNlbGxbMF0gPT0gdG9SZW1vdmUuY2VsbFswXSAmJiB2b3hlbC5jZWxsWzFdID09IHRvUmVtb3ZlLmNlbGxbMV1cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCYmIHZveGVsLmNlbGxbMl0gPT0gdG9SZW1vdmUuY2VsbFsyXSApIHtcclxuXHRcdFx0XHR2b3hlbExpc3Quc3BsaWNlKCBjLCAxIClcclxuXHRcdFx0XHR2b3hlbHNbIHZveGVsLmNlbGwuam9pbihcIi5cIildID0gbnVsbFxyXG5cdFx0XHR9XHJcblx0XHRcdGMtLVxyXG5cdFx0fVxyXG5cdFx0cCAtLVxyXG5cdH1cclxufVxyXG5cclxuc2VsZi5hZGRFbnRpdHkgPSAobWVzc2FnZSwgZGF0YSkgPT4ge1xyXG5cdGlmICghZGF0YSkge1xyXG5cdFx0Y29uc29sZS53YXJuKFwibm8gZGF0YSBmb3IgYWRkRW50aXR5XCIpXHJcblx0XHRyZXR1cm5cclxuXHR9XHJcblx0aWYgKCEhISB2b3hlbHNbZGF0YS5jb29yZHMuam9pbihcIi5cIildKSB7XHJcblx0XHR2b3hlbHNbZGF0YS5jb29yZHMuam9pbihcIi5cIildID0geyBlbnRpdGllczogW10sIGNlbGw6IGRhdGEuY29vcmRzIH1cclxuXHR9XHJcblx0bGV0IGVudGl0aWVzID0gdm94ZWxzW2RhdGEuY29vcmRzLmpvaW4oXCIuXCIpXS5lbnRpdGllcztcclxuXHJcblx0ZW50aXRpZXMucHVzaCggZGF0YS5lbnRpdHkgKVxyXG59XHJcblxyXG5zZWxmLnJlbW92ZUVudGl0eSA9ICggbWVzc2FnZSwgZGF0YSApID0+IHtcclxuXHRsZXQgZW50aXRpZXMgPSB2b3hlbHNbIGRhdGEuY29vcmRzLmpvaW4oXCIuXCIpIF0uZW50aXRpZXM7XHJcblxyXG5cdGlmICggZW50aXRpZXMgIT0gbnVsbCApIHtcclxuXHRcdGxldCBjID0gZW50aXRpZXMubGVuZ3RoLTE7XHJcblxyXG5cdFx0d2hpbGUgKCBjID49IDAgKSB7XHJcblx0XHRcdGlmICggZW50aXRpZXNbY10uaWQgPT0gZGF0YS5lbnRpdHlJZCApIHtcclxuXHRcdFx0XHR2b3hlbHNbIGRhdGEuY29vcmRzLmpvaW4oXCIuXCIpIF0uZW50aXRpZXMuc3BsaWNlKGMsIDEpXHJcblx0XHRcdFx0YyA9IC0xXHJcblx0XHRcdH1cclxuXHRcdFx0Yy0tXHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5zZWxmLnVwZGF0ZUVudGl0eSA9IChtZXNzYWdlLCBkYXRhKSA9PiB7XHJcblx0bGV0IGNlbGwgPSAgZGF0YS5jb29yZHMuam9pbihcIi5cIik7XHJcblxyXG5cdGlmICghZGF0YSB8fCAhZGF0YS5jb29yZHMpIHtcclxuXHRcdGNvbnNvbGUud2FybihcIm5vIGRhdGEgdG8gdXBkYXRlIGVudGl0eVwiKVxyXG5cdFx0cmV0dXJuXHJcblx0fVxyXG5cdGlmICggIXZveGVsc1tjZWxsXSApIHtcclxuXHRcdGNvbnNvbGUud2FybihcImNhbid0IHVwZGF0ZSBlbnRpdHkgd2l0aCBubyB2b3hlbFwiKVxyXG5cdFx0cmV0dXJuXHJcblx0fVxyXG5cdGxldCBlbnRpdGllcyA9IHZveGVsc1sgY2VsbCBdLmVudGl0aWVzXHJcblxyXG5cdGlmICggZW50aXRpZXMgIT0gbnVsbCApIHtcclxuXHRcdGxldCBjID0gZW50aXRpZXMubGVuZ3RoLTE7XHJcblxyXG5cdFx0d2hpbGUgKCBjID49IDAgKSB7XHJcblx0XHRcdGlmIChlbnRpdGllc1sgYyBdLmlkID09IGRhdGEuZW50aXR5SWQpIHtcclxuXHRcdFx0XHRlbnRpdGllc1sgYyBdID0gZGF0YS5lbnRpdHlcclxuXHRcdFx0XHRjID0gLTFcclxuXHRcdFx0fVxyXG5cdFx0XHRjLS1cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbnNlbGYudXBkYXRlVGVsZW1ldHJ5ID0gKG1lc3NhZ2UsIGRhdGEpID0+IHtcclxuXHRcclxuXHRjb25zb2xlLndhcm4oXCJwaHlzaWNzIHdvcmtlcjogdXBkYXRlVGVsZW1ldHJ5KClcIiwgbWVzc2FnZSwgZGF0YSlcclxuXHRpZiAoIWRhdGEgfHwgIWRhdGEuY29vcmRzKSB7XHJcblx0XHRjb25zb2xlLndhcm4oXCJubyBkYXRhIHRvIHVwZGF0ZSBlbnRpdHlcIilcclxuXHRcdHJldHVyblxyXG5cdH1cclxuXHRsZXQgY2VsbCA9ICBkYXRhLmNvb3Jkcy5qb2luKFwiLlwiKTtcclxuXHJcblx0aWYgKCAhdm94ZWxzW2NlbGxdICkge1xyXG5cdFx0Y29uc29sZS53YXJuKFwiY2FuJ3QgdXBkYXRlIGVudGl0eSB3aXRoIG5vIHZveGVsXCIpXHJcblx0XHRyZXR1cm5cclxuXHR9XHJcblx0bGV0IGVudGl0aWVzID0gdm94ZWxzWyBjZWxsIF0uZW50aXRpZXMsXHJcblx0XHRvbGRDZWxsID0gbWVzc2FnZS5kYXRhLm9sZENvb3Jkcy5qb2luKFwiLlwiKSxcclxuXHRcdG9sZEVudGl0aWVzID0gdm94ZWxzW29sZENlbGxdO1xyXG5cclxuXHRpZiAob2xkQ2VsbCAhPSBjZWxsKSB7XHJcblx0XHRsZXQgYyA9IG9sZEVudGl0aWVzLmxlbmd0aCAtIDE7XHJcblxyXG5cdFx0d2hpbGUgKGMgPj0gMCkge1xyXG5cdFx0XHRsZXQgbW92ZWRFbnQgPSBvbGRFbnRpdGllc1tjXVxyXG5cdFx0XHRpZiAobW92ZWRFbnQuaWQgPT0gZGF0YS5lbnRpdHlJZCkge1xyXG5cdFx0XHRcdG9sZEVudGl0aWVzLnNwbGljZShvbGRFbnRpdGllcy5pbmRleE9mKG1vdmVkRW50KSwgMSlcclxuXHRcdFx0XHRlbnRpdGllcy5wdXNoKG1vdmVkRW50KVxyXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwicGh5c2ljcyB3b3JrZXI6IHVwZGF0ZSB0ZWxlbWV0cnk6IG1vdmVkIGJldHdlZW4gdm94ZWxzXCIpXHJcblx0XHRcdFx0bW92ZWRFbnQucG9zaXRpb24gPSBkYXRhLnBvc2l0aW9uXHJcblx0XHRcdFx0aWYgKGRhdGEucXVhdGVybmlvbikge1xyXG5cdFx0XHRcdFx0bW92ZWRFbnQucXVhdGVybmlvbiA9IGRhdGEucXVhdGVybmlvbjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YyA9IC0xXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0fSBlbHNlIHtcclxuXHRcdGlmIChlbnRpdGllcyAhPSBudWxsKSB7XHJcblx0XHRcdGxldCBjID0gZW50aXRpZXMubGVuZ3RoIC0gMTtcclxuXHRcdFx0XHJcblx0XHRcdHdoaWxlIChjID49IDApIHtcclxuXHRcdFx0XHRpZiAoZW50aXRpZXNbY10uaWQgPT0gZGF0YS5lbnRpdHlJZCkge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5pbmZvKFwicGh5c2ljcyB3b3JrZXI6IHVwZGF0ZSB0ZWxlbWV0cnlcIilcclxuXHRcdFx0XHRcdGVudGl0aWVzW2NdLnBvc2l0aW9uID0gZGF0YS5wb3NpdGlvblxyXG5cdFx0XHRcdFx0aWYgKGRhdGEucXVhdGVybmlvbikge1xyXG5cdFx0XHRcdFx0XHRlbnRpdGllc1tjXS5xdWF0ZXJuaW9uID0gZGF0YS5xdWF0ZXJuaW9uO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YyA9IC0xXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGMtLVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5zZWxmLnN0b3AgPSAoKSA9PiB7XHJcblx0Y2xlYXJUaW1lb3V0KCBzZWxmLnVwZGF0ZUxvb3AgKVxyXG59XHJcbiJdfQ==
