(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*  static collision detection worker */

"use strict";

var distance2d = function (a, b) {

	return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[2] - b[2], 2));
},
    distance2dCompare = function (a, b, n) {
	// more efficient version of distance2d()

	return Math.pow(a[0] - b[0], 2) + Math.pow(a[2] - b[2], 2) < n * n;
},
    distance3dCompare = function (a, b, n) {
	// ..faster than using Math.sqrt()

	return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2) < n * n;
};

var observer = {
	position: [0, 0, 0],
	prevPos: [0, 0, 0],
	velocity: [0, 0, 0],
	vrHeight: 0
},
    voxelList = [],
    voxels = [];

self.update = function () {

	var distance = 0,
	    objPos = [],
	    position = observer.position,
	    innerBox = [false, false],
	    velocity = observer.velocity,
	    vrHeight = observer.vrHeight,
	    closeToVenue = false,
	    collision = false,
	    cKey = "",
	    yPos = 0,
	    size = 50000,
	    obj = null,
	    ent = null,
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

		obj = voxelList[i];

		if (!!obj && distance2dCompare(position, obj.position, 2500000)) {
			// do collisions on voxels & structures... just walls at first..

			if (obj.loaded == undefined) {

				obj.loaded = true;
				self.postMessage("{\"command\": \"load entities\", \"data\":{\"coords\":\"" + obj.cell[0] + "." + obj.cell[1] + "." + obj.cell[2] + "\"}}");
			}

			if (distance2dCompare(position, obj.position, 900000)) {

				var alt = obj.altitude || 0;
				yPos = obj.position[1];

				if (distance2dCompare(position, obj.position, 528000)) {

					if (position[1] > yPos - 300000 + vrHeight && position[1] < yPos + 452000 + vrHeight) {

						collision = true;
						self.postMessage("{\"command\": \"platform collision\", \"data\":{\"type\":\"top\", \"position\":[" + obj.position[0] + "," + yPos + "," + obj.position[2] + "] }}");
					}

					if (!!obj.entities && obj.entities.length > 0) {

						e = obj.entities.length - 1;

						while (e >= 0) {

							ent = obj.entities[e];

							if (distance3dCompare(position, ent.position, (ent.boundingRadius || 100000) + 10000)) {

								ent.components.map(function (entComp) {

									if (distance3dCompare(position, entComp.position, entComp.boundingRadius || 28000)) {

										collision = true;

										if (!!entComp.props.floor) {

											self.postMessage(JSON.stringify({ command: "floor collision", data: {
													position: entComp.position,
													floorData: entComp.props.floor
												} }));
										} else {

											self.postMessage(JSON.stringify({ command: "entity-user collision", data: { position: entComp.position } }));
										}
									}
								});
							}

							e--;
						}
					}
				}
			}
		}
	}

	if (!collision) {
		observer.prevPos = [observer.position[0], observer.position[1], observer.position[2]];
	}

	self.postMessage("{\"command\": \"update\"}");
	self.updateLoop = setTimeout(function () {
		self.update();
	}, 15);
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
		user.vrHeight = data.vrHeight
		//self.postMessage(JSON.stringify(self.observer));
		;
	} else if (message.command == "add voxels") {

		voxelList = voxelList.concat(data);

		data.map(function (v) {
			voxels[v.cell.join(".")] = v;
		});
	} else if (message.command == "remove voxels") {

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
	} else if (message.command == "add entity") {

		entities = voxels[data.coords.join(".")].entities;

		!!entities && voxels[data.coords.join("x")].entities.push(data.entity);
	} else if (message.command == "remove entity") {

		entities = voxels[data.coords.join(".")].entities;

		if (entities != null) {

			c = entities.length - 1;

			while (c >= 0) {

				if (entities[c].id == data.entityId) {

					voxels[data.coords.join(".")].entities.splice(c, 1);
					c = -1;
				}

				c--;
			}
		}
	} else if (message.command == "update entity") {

		entities = voxels[data.coords.join(".")].entities;

		if (entities != null) {

			c = entities.length - 1;

			while (c >= 0) {

				if (entities[c].id == data.entityId) {

					entities[c] = data.entity;
					c = -1;
				}

				c--;
			}
		}
	} else if (message.command == "clear") {

		voxels = [];
	} else if (message.command == "start") {

		self.update();
	} else if (message.command == "stop") {

		self.stop();
	} else if (message.command == "log") {

		if (data == "") {
			self.postMessage("{\"command\":\"log\",\"data\":[" + user.position[0] + "," + user.position[1] + "," + user.position[2] + "]}");
			self.postMessage("{\"command\":\"log\",\"data\":" + JSON.stringify(voxels) + "}");
		}
	}
};

self.stop = function () {

	clearTimeout(self.updateLoop);
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Db2RlL3NyYy9naXRodWIuY29tL1NwYWNlSGV4YWdvbi9jb252b2x2ci9jbGllbnQvc3JjL2pzL3dvcmtlcnMvc3RhdGljLWNvbGxpc2lvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDRUEsSUFBSSxVQUFVLEdBQUcsVUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFNOztBQUV6QixRQUFPLElBQUksQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUUsQ0FBRSxDQUFBO0NBRTVFO0lBQ0QsaUJBQWlCLEdBQUcsVUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBTTs7O0FBRWxDLFFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUUsR0FBSSxDQUFDLEdBQUMsQ0FBQyxBQUFDLENBQUE7Q0FFdEU7SUFDRCxpQkFBaUIsR0FBRyxVQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFNOzs7QUFFbEMsUUFBTyxBQUFDLElBQUksQ0FBQyxHQUFHLENBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUMsQ0FBQyxDQUFD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QVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMxSCxPQUFJLENBQUMsV0FBVyxDQUFDLGdDQUEwQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUUsR0FBRyxDQUFDLENBQUM7R0FDM0U7RUFFRDtDQUNELENBQUM7O0FBRUYsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFNOztBQUVqQixhQUFZLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFBO0NBRS9CLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogIHN0YXRpYyBjb2xsaXNpb24gZGV0ZWN0aW9uIHdvcmtlciAqL1xyXG5cclxubGV0IGRpc3RhbmNlMmQgPSAoIGEsIGIgKSA9PiB7XHJcblxyXG4gICAgcmV0dXJuIE1hdGguc3FydCggTWF0aC5wb3coIChhWzBdLWJbMF0pLCAyICkgKyBNYXRoLnBvdyggKGFbMl0tYlsyXSksIDIgKSApXHJcblxyXG4gIH0sXHJcbiAgZGlzdGFuY2UyZENvbXBhcmUgPSAoIGEsIGIsIG4gKSA9PiB7IC8vIG1vcmUgZWZmaWNpZW50IHZlcnNpb24gb2YgZGlzdGFuY2UyZCgpXHJcblxyXG5cdCAgcmV0dXJuIE1hdGgucG93KCAoYVswXS1iWzBdKSwgMiApICsgTWF0aC5wb3coIChhWzJdLWJbMl0pLCAyICkgPCAobipuKVxyXG5cclxuICB9LFxyXG4gIGRpc3RhbmNlM2RDb21wYXJlID0gKCBhLCBiLCBuICkgPT4geyAvLyAuLmZhc3RlciB0aGFuIHVzaW5nIE1hdGguc3FydCgpXHJcblxyXG5cdCAgcmV0dXJuIChNYXRoLnBvdyggKGFbMF0tYlswXSksIDIgKSArIE1hdGgucG93KCAoYVsxXS1iWzFdKSwgMiApICsgTWF0aC5wb3coIChhWzJdLWJbMl0pLCAyICkgKSA8IChuKm4pXHJcblxyXG4gIH1cclxuXHJcbmxldCBvYnNlcnZlciA9IHtcclxuXHRcdHBvc2l0aW9uOiBbMCwgMCwgMF0sXHJcblx0XHRwcmV2UG9zOiBbMCwgMCwgMF0sXHJcblx0XHR2ZWxvY2l0eTogWzAsIDAsIDBdLFxyXG5cdFx0dnJIZWlnaHQ6IDBcclxuXHR9LFxyXG5cdHZveGVsTGlzdCA9IFtdLFxyXG5cdHZveGVscyA9IFtdXHJcblxyXG5zZWxmLnVwZGF0ZSA9ICggKSA9PiB7XHJcblxyXG5cdHZhciBkaXN0YW5jZSA9IDAsXHJcblx0XHRvYmpQb3MgPSBbXSxcclxuXHRcdHBvc2l0aW9uID0gb2JzZXJ2ZXIucG9zaXRpb24sXHJcblx0XHRpbm5lckJveCA9IFtmYWxzZSwgZmFsc2VdLFxyXG5cdFx0dmVsb2NpdHkgPSBvYnNlcnZlci52ZWxvY2l0eSxcclxuXHRcdHZySGVpZ2h0ID0gb2JzZXJ2ZXIudnJIZWlnaHQsXHJcblx0XHRjbG9zZVRvVmVudWUgPSAgZmFsc2UsXHJcblx0XHRjb2xsaXNpb24gPSBmYWxzZSxcclxuXHRcdGNLZXkgPSBcIlwiLFxyXG5cdFx0eVBvcyA9IDAsXHJcblx0XHRzaXplID0gNTAwMDAsXHJcblx0XHRvYmogPSBudWxsLFxyXG5cdFx0ZW50ID0gbnVsbCxcclxuXHRcdHN0cnVjdHVyZSA9IG51bGwsXHJcblx0XHRib3VuZHMgPSBbMCwgMF0sXHJcblx0XHR2b3hlbCA9IG51bGwsXHJcblx0XHRkZWx0YSA9IFswLCAwXSxcclxuXHRcdG9Qb3MgPSBbXSxcclxuXHRcdHNwZWVkID0gMCxcclxuXHRcdGUgPSAwLFxyXG5cdFx0aSA9IDAsXHJcblx0XHR2ID0gMFxyXG5cclxuXHRmb3IgKCBpID0gMDsgaSA8IHZveGVsTGlzdC5sZW5ndGg7IGkgKysgKSB7XHJcblxyXG5cdFx0b2JqID0gdm94ZWxMaXN0WyBpIF1cclxuXHJcblx0XHRpZiAoICEhb2JqICAmJiBkaXN0YW5jZTJkQ29tcGFyZSggcG9zaXRpb24sIG9iai5wb3NpdGlvbiwgMjUwMDAwMCApICkgeyBcdC8vIGRvIGNvbGxpc2lvbnMgb24gdm94ZWxzICYgc3RydWN0dXJlcy4uLiBqdXN0IHdhbGxzIGF0IGZpcnN0Li5cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRpZiAoIG9iai5sb2FkZWQgPT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG9iai5sb2FkZWQgPSB0cnVlXHJcblx0XHRcdFx0c2VsZi5wb3N0TWVzc2FnZSgne1wiY29tbWFuZFwiOiBcImxvYWQgZW50aXRpZXNcIiwgXCJkYXRhXCI6e1wiY29vcmRzXCI6XCInK29iai5jZWxsWzBdKycuJytvYmouY2VsbFsxXSsnLicrb2JqLmNlbGxbMl0rJ1wifX0nKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICggZGlzdGFuY2UyZENvbXBhcmUoIHBvc2l0aW9uLCBvYmoucG9zaXRpb24sIDkwMDAwMCApICkge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0bGV0IGFsdCA9IG9iai5hbHRpdHVkZSB8fCAwXHJcblx0XHRcdFx0XHR5UG9zID0gb2JqLnBvc2l0aW9uWzFdXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKCBkaXN0YW5jZTJkQ29tcGFyZSggcG9zaXRpb24sIG9iai5wb3NpdGlvbiwgNTI4MDAwICkgKSB7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYgKCBwb3NpdGlvblsxXSA+IHlQb3MgLSAzMDAwMDAgKyB2ckhlaWdodCAgJiYgcG9zaXRpb25bMV0gPCB5UG9zICsgNDUyMDAwICsgdnJIZWlnaHQgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRjb2xsaXNpb24gPSB0cnVlXHJcblx0XHRcdFx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoJ3tcImNvbW1hbmRcIjogXCJwbGF0Zm9ybSBjb2xsaXNpb25cIiwgXCJkYXRhXCI6e1widHlwZVwiOlwidG9wXCIsIFwicG9zaXRpb25cIjpbJyArIG9iai5wb3NpdGlvblswXSArICcsJyArICh5UG9zICkgKyAnLCcgKyBvYmoucG9zaXRpb25bMl0gKyAnXSB9fScpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYgKCAhIW9iai5lbnRpdGllcyAmJiBvYmouZW50aXRpZXMubGVuZ3RoID4gMCApIHtcclxuXHJcblx0XHRcdFx0XHRcdGUgPSBvYmouZW50aXRpZXMubGVuZ3RoIC0gMVxyXG5cclxuXHRcdFx0XHRcdFx0d2hpbGUgKCBlID49IDAgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGVudCA9IG9iai5lbnRpdGllc1sgZSBdXHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICggZGlzdGFuY2UzZENvbXBhcmUoIHBvc2l0aW9uLCBlbnQucG9zaXRpb24sIChlbnQuYm91bmRpbmdSYWRpdXN8fDEwMDAwMCkrMTAwMDApICkgeyBcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRlbnQuY29tcG9uZW50cy5tYXAoIGVudENvbXAgPT4ge1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCBkaXN0YW5jZTNkQ29tcGFyZSggcG9zaXRpb24sIGVudENvbXAucG9zaXRpb24sIGVudENvbXAuYm91bmRpbmdSYWRpdXMgfHwgMjgwMDApICkge1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb2xsaXNpb24gPSB0cnVlXHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICggISEgZW50Q29tcC5wcm9wcy5mbG9vciApIHsgXHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2VsZi5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoIHtjb21tYW5kOiBcImZsb29yIGNvbGxpc2lvblwiLCBkYXRhOiB7IFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbjogZW50Q29tcC5wb3NpdGlvbiwgXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZsb29yRGF0YTogZW50Q29tcC5wcm9wcy5mbG9vclxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fX0pKVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoIEpTT04uc3RyaW5naWZ5KCB7Y29tbWFuZDogXCJlbnRpdHktdXNlciBjb2xsaXNpb25cIiwgZGF0YTp7IHBvc2l0aW9uOiBlbnRDb21wLnBvc2l0aW9uIH19ICkgKVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0fSlcclxuXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRlIC0tXHJcblxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRpZiAoICFjb2xsaXNpb24gKSB7XHJcblx0XHRvYnNlcnZlci5wcmV2UG9zID0gWyBvYnNlcnZlci5wb3NpdGlvblswXSwgb2JzZXJ2ZXIucG9zaXRpb25bMV0sIG9ic2VydmVyLnBvc2l0aW9uWzJdIF1cclxuXHR9XHJcblxyXG5cdHNlbGYucG9zdE1lc3NhZ2UoJ3tcImNvbW1hbmRcIjogXCJ1cGRhdGVcIn0nKTtcclxuXHRzZWxmLnVwZGF0ZUxvb3AgPSBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcblx0XHRzZWxmLnVwZGF0ZSgpO1xyXG5cdH0sIDE1KTtcclxufVxyXG5cclxuc2VsZi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoIGV2ZW50ICkgeyBcclxuXHJcblx0dmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKCBldmVudC5kYXRhICksXHJcblx0XHRkYXRhID0gbWVzc2FnZS5kYXRhLFxyXG5cdFx0dXNlciA9IG9ic2VydmVyLFxyXG5cdFx0dm94ZWwgPSBudWxsLFxyXG5cdFx0dG9SZW1vdmUgPSBudWxsLFxyXG5cdFx0aXRlbXMgPSBbXSxcclxuXHRcdGVudGl0aWVzID0gW10sXHJcblx0XHRjID0gMCxcclxuXHRcdHAgPSAwXHJcblx0XHRcclxuXHRpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcInVwZGF0ZVwiICkge1xyXG5cdFx0Ly8gdXNlci5wcmV2UG9zID0gW3VzZXIucG9zaXRpb25bMF0sIHVzZXIucG9zaXRpb25bMV0sIHVzZXIucG9zaXRpb25bMl1dO1xyXG5cdFx0dXNlci5wb3NpdGlvbiA9IGRhdGEucG9zaXRpb25cclxuXHRcdHVzZXIudmVsb2NpdHkgPSBkYXRhLnZlbG9jaXR5XHJcblx0XHR1c2VyLnZySGVpZ2h0ID0gZGF0YS52ckhlaWdodFxyXG5cdFx0Ly9zZWxmLnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHNlbGYub2JzZXJ2ZXIpKTtcclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJhZGQgdm94ZWxzXCIgKSB7XHJcblxyXG5cdFx0dm94ZWxMaXN0ID0gdm94ZWxMaXN0LmNvbmNhdChkYXRhKVxyXG5cclxuXHRcdGRhdGEubWFwKCB2ID0+IHtcclxuXHRcdFx0dm94ZWxzWyB2LmNlbGwuam9pbihcIi5cIikgXSA9IHZcclxuXHRcdH0pXHJcblxyXG5cdH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcInJlbW92ZSB2b3hlbHNcIiApIHtcclxuXHJcblx0XHRwID0gZGF0YS5sZW5ndGggLTFcclxuXHJcblx0XHR3aGlsZSAoIHAgPj0gMCApIHtcclxuXHJcblx0XHRcdHRvUmVtb3ZlID0gZGF0YVtwXVxyXG5cdFx0XHRjID0gdm94ZWxMaXN0Lmxlbmd0aC0xXHJcblxyXG5cdFx0XHR3aGlsZSAoIGMgPj0gMCApIHtcclxuXHJcblx0XHRcdFx0dm94ZWwgPSB2b3hlbExpc3RbIGMgXVxyXG5cclxuXHRcdFx0XHRpZiAoIHZveGVsICE9IG51bGwgJiYgdm94ZWwuY2VsbFswXSA9PSB0b1JlbW92ZS5jZWxsWzBdICYmIHZveGVsLmNlbGxbMV0gPT0gdG9SZW1vdmUuY2VsbFsxXSAgJiYgdm94ZWwuY2VsbFsyXSA9PSB0b1JlbW92ZS5jZWxsWzJdICkge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR2b3hlbExpc3Quc3BsaWNlKCBjLCAxIClcclxuXHRcdFx0XHRcdHZveGVsc1sgdm94ZWwuY2VsbC5qb2luKFwiLlwiKV0gPSBudWxsXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRjLS1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHAgLS1cclxuXHJcblx0XHR9XHJcblxyXG5cdH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcImFkZCBlbnRpdHlcIiApIHtcclxuXHJcbiAgICBlbnRpdGllcyA9IHZveGVsc1tkYXRhLmNvb3Jkcy5qb2luKFwiLlwiKV0uZW50aXRpZXNcclxuXHJcbiAgICAhISBlbnRpdGllcyAmJiB2b3hlbHNbZGF0YS5jb29yZHMuam9pbihcInhcIildLmVudGl0aWVzLnB1c2goIGRhdGEuZW50aXR5IClcclxuXHJcbiAgfSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwicmVtb3ZlIGVudGl0eVwiICkge1xyXG5cclxuICAgIFx0ZW50aXRpZXMgPSB2b3hlbHNbIGRhdGEuY29vcmRzLmpvaW4oXCIuXCIpIF0uZW50aXRpZXNcclxuXHJcblx0XHRpZiAoIGVudGl0aWVzICE9IG51bGwgKSB7XHJcblxyXG5cdFx0XHRjID0gZW50aXRpZXMubGVuZ3RoLTFcclxuXHJcblx0XHRcdHdoaWxlICggYyA+PSAwICkge1xyXG5cclxuXHRcdFx0XHRpZiAoIGVudGl0aWVzW2NdLmlkID09IGRhdGEuZW50aXR5SWQgKSB7XHJcblxyXG5cdFx0XHRcdFx0dm94ZWxzWyBkYXRhLmNvb3Jkcy5qb2luKFwiLlwiKSBdLmVudGl0aWVzLnNwbGljZShjLCAxKVxyXG5cdFx0XHRcdFx0YyA9IC0xXHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Yy0tXHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJ1cGRhdGUgZW50aXR5XCIgKSB7XHJcblxyXG5cdFx0ZW50aXRpZXMgPSB2b3hlbHNbIGRhdGEuY29vcmRzLmpvaW4oXCIuXCIpIF0uZW50aXRpZXNcclxuXHJcblx0XHRpZiAoIGVudGl0aWVzICE9IG51bGwgKSB7XHJcblxyXG5cdFx0XHRjID0gZW50aXRpZXMubGVuZ3RoLTFcclxuXHJcblx0XHRcdHdoaWxlICggYyA+PSAwICkge1xyXG5cclxuXHRcdFx0XHRpZiAoZW50aXRpZXNbIGMgXS5pZCA9PSBkYXRhLmVudGl0eUlkKSB7XHJcblxyXG5cdFx0XHRcdFx0ZW50aXRpZXNbIGMgXSA9IGRhdGEuZW50aXR5XHJcblx0XHRcdFx0XHRjID0gLTFcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRjLS1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcImNsZWFyXCIgKSB7XHJcblxyXG5cdFx0dm94ZWxzID0gW11cclxuXHJcblx0fSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwic3RhcnRcIiApIHtcclxuXHJcblx0XHRzZWxmLnVwZGF0ZSgpXHJcblxyXG5cdH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcInN0b3BcIiApIHtcclxuXHJcblx0XHRzZWxmLnN0b3AoKVxyXG5cclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJsb2dcIiApIHtcclxuXHJcblx0XHRpZiAoZGF0YSA9PSBcIlwiKSB7XHJcblx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoJ3tcImNvbW1hbmRcIjpcImxvZ1wiLFwiZGF0YVwiOlsnICsgdXNlci5wb3NpdGlvblswXSArICcsJyArIHVzZXIucG9zaXRpb25bMV0gKyAnLCcgKyB1c2VyLnBvc2l0aW9uWzJdICsgJ119Jyk7XHJcblx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoJ3tcImNvbW1hbmRcIjpcImxvZ1wiLFwiZGF0YVwiOicgKyBKU09OLnN0cmluZ2lmeSh2b3hlbHMpKyAnfScpO1xyXG5cdFx0fVxyXG5cclxuXHR9XHJcbn07XHJcblxyXG5zZWxmLnN0b3AgPSAoKSA9PiB7XHJcblxyXG5cdGNsZWFyVGltZW91dCggc2VsZi51cGRhdGVMb29wIClcclxuXHJcbn1cclxuIl19
