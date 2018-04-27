"use strict";

var renderer, scene, camera, controls;

var ballColor = 0xD4D4BF;
var dropperColor = 0xD4D4BF;
var whackerColor = 0xA2A2A2;
var whackerPlateColor = 0xDEC600;
var housingColor = 0xFF7733;

var keyLength = 12;
var keyWidth = 5;
var keyThickness = 2;
var keyLengthSpacing = -keyLength - 4;
var keyLengthOffset = -70;
var keyWidthSpacing = keyWidth + 4;
var keyWidthOffset = -keyWidthSpacing * 5.5;

var numKeys = 88;

var ballRadius = 2;

// how much does a ball add to the height of a key?
var scaleCount = ((4/3)*Math.PI*ballRadius*ballRadius*ballRadius)/(keyLength*keyWidth);

var currentDropper = 0;
var numDroppers = 10;
var dropperWidth = 10;
var dropperRadius = 1.5 * ballRadius;
var dropperWidthOffset = -dropperWidth * (numDroppers-1) / 2;
var dropperHeight = 100;
var dropperPartHeight = 10;
var crossbarRadius = 0.3 * ballRadius;

var whackerHeight = 30;
var whackerRadius = 0.35 * ballRadius;
var whackerPlateHeight = 0.5 * ballRadius;
var whackerPlateRadius = 1.5 * ballRadius;
var whackerArmHeight = whackerHeight;

var housingThickness = 1;
var housingInnerRadius = whackerHeight + 3;
var housingOuterRadius = housingInnerRadius + housingThickness;
var housingCapOuterRadius = housingOuterRadius + housingThickness/2;
var housingWidth = numDroppers * dropperWidth + 8;
var spindleRadius = 0.3 * ballRadius;

// top of parabola
var bounceHeight = 70;

var keys = [];
var balls = [];
var whackers = [];

var ballHeadstart = 1730;
var ballFadeDuration = 1730;

var dropStart = -ballHeadstart;
var dropEnd, bounceApex, whackEnd;
var hitStart = 0;
var hitSunk = 0.4 * ballFadeDuration;
var hitEnd = ballFadeDuration;

var timeInSong = -startDelay;
var localStartTime;
var prevNotesLength = 999999999;

var ballGeo, dropperGeo, whackerArmGeo, whackerPlateGeo;
var ballMtl, dropperMtl, whackerMtl, whackerPlateMtl;

// when set true, animation no longer changes
var debugFreezeFrame = false;
// look for time jump
//var debugPrevTime = 0;

function init() {
  var WIDTH = $('.rest').width() - 5,
      HEIGHT = $('.rest').height() - 5,
      VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

  //console.log('Size: ' + WIDTH + ' ' + HEIGHT);

  // Determine how much time is spent falling, bouncing up, and bouncing down
  var span1 = Math.sqrt(dropperHeight - whackerHeight);
  var span2 = Math.sqrt(bounceHeight - whackerHeight);
  var span3 = Math.sqrt(bounceHeight);
  var spanSum = span1 + span2 + span3;
  dropEnd = dropStart * (span2 + span3)/spanSum;
  whackEnd = dropStart - dropStart * 2 * span1/spanSum;
  bounceApex = dropStart * span3/spanSum;

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer( {antialias: true} );
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene = new THREE.Scene();
  
  ballGeo = new THREE.SphereBufferGeometry(ballRadius, 20, 10);
  ballMtl = new THREE.MeshPhysicalMaterial({ color: ballColor, roughness: 0.5, metalness: 0.5 });
  dropperGeo = new THREE.CylinderBufferGeometry(dropperRadius, ballRadius, dropperPartHeight, 20, 1);
  dropperMtl =new THREE.MeshPhysicalMaterial({ color: dropperColor });
  whackerArmGeo = new THREE.CylinderBufferGeometry(whackerRadius, whackerRadius, whackerArmHeight, 10, 1);
  whackerPlateGeo = new THREE.CylinderBufferGeometry(whackerPlateRadius, whackerPlateRadius, whackerPlateHeight, 30, 1);
  whackerMtl =new THREE.MeshPhysicalMaterial({ color: whackerColor });
  whackerPlateMtl =new THREE.MeshPhysicalMaterial({ color: whackerPlateColor, roughness: 0.64, metalness: 0.67 });

  camera.position.x = -210;
  camera.position.y = 150;
  camera.position.z = 170;
  //camera.lookAt(new THREE.Vector3(0, 0, 0));

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  // attach the render-supplied DOM element
  $('#turk').append(renderer.domElement);

  // and the camera
  scene.add(camera);

  addControls();

  controls.target.set( (keyLengthOffset + keyLengthSpacing*7 - keyLength/2)/2, 0.8*housingOuterRadius, 0 );

  window.addEventListener( 'resize', onWindowResize, false );

  fillScene();
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function addControls() {
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.screenSpacePanning = true;
  controls.rotateSpeed = 3;
  controls.zoomSpeed = 1;
  controls.panSpeed = 1;

  //var radius = 100 * 0.75; // scalar value used to determine relative zoom distances
  //controls.minDistance = radius * 0.1;
  //controls.maxDistance = radius * 25;

  //controls.keys = [65, 83, 68]; // [ rotateKey, zoomKey, panKey ]
}

function fillScene() {
  addLighting();
  // drops the balls
  addDropper();
  // catches the balls
  addKeys();
  // holds the whackers
  addHousing();
}

function addLighting() {
  var dirLight = new THREE.DirectionalLight( 0xeeeeee, 1 );
  dirLight.name = 'Dir. Light';
  dirLight.position.set( 0, dropperHeight+dropperPartHeight+1, 0 );
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 0;
  dirLight.shadow.camera.far = dropperHeight+dropperPartHeight+housingCapOuterRadius + 2;
  dirLight.shadow.camera.right = housingCapOuterRadius + 1;
  dirLight.shadow.camera.left = keyLengthOffset + keyLengthSpacing*7 - keyLength/2 - 1;
  // actually left, looking down keys at housing
  // measurement assumes housing is wider than the set of keys
  dirLight.shadow.camera.top	= housingWidth/2 + housingThickness + 1;
  dirLight.shadow.camera.bottom = -dirLight.shadow.camera.top;
  dirLight.shadow.mapSize.width = 3000;
  // make height proportional to width so that shadow pixels are "square"
  dirLight.shadow.mapSize.height = parseInt(dirLight.shadow.mapSize.width *
    (dirLight.shadow.camera.top-dirLight.shadow.camera.bottom)/(dirLight.shadow.camera.right-dirLight.shadow.camera.left));
  scene.add( dirLight );

  // debug aid: shows light's camera bounds.
  //scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

  var light2 = new THREE.DirectionalLight(0xbbbbbb);

  light2.position.x = 200;
  light2.position.y = 200;
  light2.position.z = -500;

  scene.add(light2);

  var light3 = new THREE.DirectionalLight(0xeeeeee);

  light3.position.x = -400;
  light3.position.y = -200;
  light3.position.z = 300;

  scene.add(light3);
}

function addDropper() {
  // cross bar
  var crossbar = new THREE.Mesh(
    new THREE.CylinderBufferGeometry( crossbarRadius, crossbarRadius, numDroppers*dropperWidth, 10, 1),
    dropperMtl
  );
  crossbar.position.set(0, dropperHeight + dropperPartHeight/2 - crossbarRadius, 0);
  crossbar.rotation.set(Math.PI/2, 0, 0);
  //crossbar.castShadow = true;
  //crossbar.receiveShadow = true;
  scene.add(crossbar);

  for (var i = 0; i < numDroppers; i++) {
    var dropper = new THREE.Mesh(
      dropperGeo,
      dropperMtl
    );
    dropper.position.set(0, dropperHeight, i * dropperWidth + dropperWidthOffset);
    //dropper.castShadow = true;
    //dropper.receiveShadow = true;
    scene.add(dropper);
  }
}

function addKeys() {
  for (var i = 0; i < numKeys; i++) {
    // 8 rows of 12 keys each, 4 at highest range
    var key = new THREE.Mesh(
      new THREE.BoxBufferGeometry(keyLength, keyThickness, keyWidth),
      new THREE.MeshPhysicalMaterial( {roughness: 1.0} )
    );

    // bit lazy here, adding properties to the Mesh itself
    key.ballCount = 0;
    key.frameBallCount = 0;
    key.lastTap = 0;

    // key "unhighlighted" color
    // is it a black key? darken
    var blackScale = 0.5;
    var keyType = i % 12;
    if ( keyType === 1 || keyType === 4 || keyType === 6 || keyType === 9 || keyType === 11 ) {
      // not gamma corrected, but so be it.
      blackScale *= 0.4;
    }

    // play with .75 to cycle the colors (could even animate it)
    key.material.color.setHSL((1.75-parseInt( i / 12 )/8)%1, 1, blackScale );
    key.r = key.material.color.r;
    key.g = key.material.color.g;
    key.b = key.material.color.b;
    //key.castShadow = true;  // doesn't cast shadows on anything, so not needed
    key.receiveShadow = true;

    keyPosition( i, key.position );
    setKeyDepth(key);

    scene.add(key);

    keys.push(key);
  }
}

function keyPosition(id, pos) {
  pos.x = parseInt( id / 12 ) * keyLengthSpacing + keyLengthOffset;
  pos.z = ( id % 12 ) * keyWidthSpacing + keyWidthOffset;
  pos.y = 0;
}

function addHousing() {
  var housingMtl = new THREE.MeshPhysicalMaterial({ color: housingColor, roughness: 0.64, metalness: 0.67 });

  var housing = new THREE.Mesh(
    // inner radius top, bottom, outer radius top, bottom, inner height, outer height,
    // radial segments, height segments, open-ended boolean, end segments (bevel), range angle, function [not set]
    new PipeGeometry(housingInnerRadius, housingInnerRadius, housingOuterRadius, housingOuterRadius, housingWidth, housingWidth,
      36, 1, false, 1, 1.5 * Math.PI),
    housingMtl
  );
  housing.rotation.set(Math.PI/2, 1.25*Math.PI, 0);
  //housing.castShadow = true;
  housing.receiveShadow = true;
  scene.add(housing);

  var housingCapGeo = new PipeGeometry(spindleRadius/2, spindleRadius/2, housingCapOuterRadius, housingCapOuterRadius, housingThickness, housingThickness,
    36, 1, false, 1, 1.5 * Math.PI);

  var housingCap1 = new THREE.Mesh(
    // inner radius top, bottom, outer radius top, bottom, inner height, outer height,
    // radial segments, height segments, open-ended boolean, end segments (bevel), range angle, function [not set]
    housingCapGeo, housingMtl
  );
  housingCap1.rotation.set(Math.PI/2, 1.25*Math.PI, 0);
  housingCap1.position.set(0,0,(housingWidth+housingThickness)/2);
  //housingCap1.castShadow = true;
  housingCap1.receiveShadow = true;
  scene.add(housingCap1);
  
  var housingCap2 = new THREE.Mesh(
    // inner radius top, bottom, outer radius top, bottom, inner height, outer height,
    // radial segments, height segments, open-ended boolean, end segments (bevel), range angle, function [not set]
    housingCapGeo, housingMtl
  );
  housingCap2.rotation.set(Math.PI/2, 1.25*Math.PI, 0);
  housingCap2.position.set(0,0,-(housingWidth+housingThickness)/2);
  //housingCap2.castShadow = true;
  housingCap2.receiveShadow = true;
  scene.add(housingCap2);
  
  var spindle = new THREE.Mesh(
    new THREE.CylinderBufferGeometry( spindleRadius, spindleRadius, housingWidth + 4*housingThickness, 10, 1),
    whackerMtl
  );
  spindle.rotation.set(Math.PI/2, 0, 0);
  spindle.castShadow = true;
  spindle.receiveShadow = true;
  scene.add(spindle);
}

function Ball(keyTarget,dropper,t) {
  this.target = keyTarget;
  //this.dropper = dropper;
  this.start = new THREE.Vector3(0, dropperHeight, dropper * dropperWidth + dropperWidthOffset);
  this.end = new THREE.Vector3();
  keyPosition( keyTarget, this.end );
  this.time = t;
  this.hit = false;
  this.object = new THREE.Mesh(
    ballGeo,
    ballMtl
  );
  this.object.position.copy( this.start );
  this.object.castShadow = true;
  // receiving can look bad, see debugFreezeFrame t=5000 for Flight of the Bumblebees, I think it's a bias bug?
  //this.object.receiveShadow = true;
}

function addBall(keyTarget,dropper,t) {
  var ball = new Ball(keyTarget,dropper,t);

  balls.push(ball);

  scene.add(ball.object);
}

// add balls if time to do so
function addBallsToMusic(t) {
  if (notes.length === 0)
    return;

  // is note's playing time less the head start less that the current time
  while (notes[0].time - ballHeadstart < t ) {
    // if ball time has passed - don't add it, if so; just remove note
    var keyID = notes[0].note - MIDI.pianoKeyOffset;

    // debug: to force a particular octave, e.g. the highest, 7*12
    //keyID = 7*12 + keyID % 12;
    //keyID = keyID % 12;

    if (notes[0].time + hitEnd > t ) {
      addBall(keyID, currentDropper, notes[0].time);
      addWhacker(keyID, currentDropper, notes[0].time);
    } else {
      // note the ball's effect on the key
      extendKeyFully(keyID);
    }
    // remove note from note list
    notes.splice(0, 1);

    // note ball is added at current dropper, in order, then we increment
    // (if we know which finger is pressing the key, use that instead)
    currentDropper++;
    if ( currentDropper >= numDroppers ) {
      currentDropper = 0;
    }

    if (notes.length === 0) {
      return;
    }
  }
}

function Whacker(keyTarget,dropper,t) {
  // take direction to end point and come up with half angle and azimuth, more or less
  var z = parseInt(keyTarget/12);
  var zrot = Math.PI/24 + z * 3*Math.PI/(7*24);

  // shorten real arm so that hit location is better against sphere's surface
  var adjustedWhackerHeight = whackerArmHeight - (ballRadius+whackerPlateHeight/2)/Math.cos(zrot);

  var vec = new THREE.Vector3();
  keyPosition( keyTarget, vec );
  vec.z -= dropper * dropperWidth + dropperWidthOffset;

  this.target = keyTarget;
  this.dropper = dropper; // only used for debugging
  this.time = t;
  this.arm = new THREE.Mesh(
    whackerArmGeo,
    whackerMtl
  );
  this.arm.position.y = -adjustedWhackerHeight/2;
  this.arm.scale.y = adjustedWhackerHeight / whackerHeight;
  this.arm.castShadow = true;
  // having these receive shadows is distracting, IMO
  //this.arm.receiveShadow = true;

  this.plate = new THREE.Mesh(
    whackerPlateGeo,
    whackerPlateMtl
  );
  this.plate.position.y = -adjustedWhackerHeight;
  this.plate.rotation.z = zrot;
  this.plate.rotation.x = -Math.atan2(vec.z,-vec.x)/2;
  this.plate.scale.x = 2.0;
  this.plate.castShadow = true;
  this.plate.receiveShadow = true;
  
  this.object = new THREE.Object3D();
  this.object.add(this.arm);
  this.object.add(this.plate);
  this.object.position.set(0, 0, dropper * dropperWidth + dropperWidthOffset);
}

function addWhacker(keyTarget,dropper,t) {
  var whacker = new Whacker(keyTarget,dropper,t);

  whackers.push(whacker);

  scene.add(whacker.object);
}

function extendKeyFraction(keyID,timeDiff)
{
  // the timeDiff is the height of the sphere,
  // so add the volume related to the height.
  keys[keyID].frameBallCount += 0.5*Math.cos((1-timeDiff)*Math.PI) + 0.5;
}

function extendKeyFully(keyID)
{
  keys[keyID].ballCount++;
}

function moveBalls(t) {
  var x,y,z, timeDiff;
  for (var i = balls.length - 1; i >= 0; i--) {
    var ball = balls[i];
    var animTime = t - ball.time;

    // compute location of ball in one of a few zones:
    // 1) dropping from dropper: dropStart to dropEnd
    // 2) bouncing from whacker: dropEnd to hitStart
    // 3) sinking into key: hitStart to hitEnd
    // 4) sunk, and key fading back to its normal color.
    if (animTime < dropEnd) {
      // dropping from dropper
      timeDiff = (animTime-dropStart)/(dropEnd-dropStart);
      y = dropperHeight - (dropperHeight-whackerHeight) * timeDiff*timeDiff;
      ball.object.position.set(ball.start.x,y,ball.start.z);
    } else if (animTime < hitStart) {
      // hit by whacker and continuing
      timeDiff = (animTime-dropEnd)/(hitStart-dropEnd);
      x = ball.start.x + (ball.end.x-ball.start.x) * timeDiff;
      z = ball.start.z + (ball.end.z-ball.start.z) * timeDiff;
      var timeApex = (animTime-bounceApex)/(hitStart-bounceApex);
      // avoid balls colliding by varying height a bit; also more visually interesting
      var hashrand = ((ball.time + ball.target * 14029)%88)/87;
      var localBounceHeight = bounceHeight + hashrand * 12 - 4;
      y = localBounceHeight - localBounceHeight * timeApex*timeApex;
      ball.object.position.set(x,y,z);
    } else if (animTime < hitSunk) {
      // ball sinking into key
      ball.object.position.copy(ball.end);
      // when sinking, it's nice to turn off the shadow
      ball.object.castShadow = false;
      timeDiff = (animTime-hitStart)/(hitSunk-hitStart);
      // simple sink:
      ball.object.position.y = -timeDiff * 2 * ballRadius;
      // melt variation:
      //ball.object.position.y = -timeDiff * ballRadius;
      //ball.object.scale.y = 1-timeDiff;
      if ( !ball.hit ) {
        ball.hit = true;
        keys[ball.target].lastTap = t;
      }
      extendKeyFraction(ball.target,timeDiff);
    } else {
      // delete ball, we're at end of life
      extendKeyFully(ball.target);
      scene.remove(ball.object);
      // remove ball from array
      balls.splice(i, 1);
    }
  }
}

function moveWhackers(t) {
  for (var i = whackers.length - 1; i >= 0; i--) {
    var whacker = whackers[i];
    var animTime = t - whacker.time;

    // compute location of ball in one of a few zones:
    // 1) dropping from dropper: dropStart to dropEnd
    // 2) bouncing from whacker: dropEnd to hitStart
    // 3) sinking into key: hitStart to hitEnd
    // 4) sunk, and key fading back to its normal color.
    if (animTime < whackEnd) {
      // spin the whacker
      var angle = 2 * Math.PI * (animTime-dropStart)/(whackEnd-dropStart);
      whacker.object.rotation.z = angle;
      // show ball hitting plate for a given dropper location
      //if (animTime > dropEnd && whacker.dropper === 4) {
      // freeze at a given moment
      //if ( t > 2000 ) {
      //  debugFreezeFrame = true;
      //}
    } else {
      // delete whacker, we're at end of life
      scene.remove(whacker.object);
      // remove ball from array
      whackers.splice(i, 1);
    }
  }
}

function clearBalls() {
  for (var i = balls.length - 1; i >= 0; i--) {
    var ball = balls[i];
    scene.remove(ball.object);
    // remove ball from array
    balls.splice(i, 1);
  }
}

function clearWhackers() {
  for (var i = whackers.length - 1; i >= 0; i--) {
    var whacker = whackers[i];
    scene.remove(whacker.object);
    // remove whacker from array
    whackers.splice(i, 1);
  }
}

function setKeyDepth(key) {
  var heightAdjust = scaleCount * (key.ballCount + key.frameBallCount);
  key.scale.y = heightAdjust+1;
  key.position.y = -ballRadius - keyThickness/2 - heightAdjust;
}

function darkenKeys(t) {
  for (var i = 0; i < numKeys; i++) {
    var key = keys[i];

    // take last time key was tapped and fade
    if ( key.lastTap > 0 ) {
      if ( key.lastTap + ballFadeDuration > t ) {
        var fadeTime = (t - key.lastTap) / ballFadeDuration;
        key.material.color.setRGB(
          (1-fadeTime) + fadeTime*key.r,
          (1-fadeTime) + fadeTime*key.g,
          (1-fadeTime) + fadeTime*key.b
        );
      } else {
        // set back to clear
        key.material.color.setRGB(key.r, key.g, key.b);
        key.lastTap = 0;
      }  
    }

    // compute key height from fraction and full.
    setKeyDepth(key);
    // reset after each frame
    key.frameBallCount = 0;
  }
}

function resetKeyCounts() {
  for (var i = 0; i < numKeys; i++) {
    var key = keys[i];
    key.ballCount = 0;
    key.frameBallCount = 0;
    key.lastTap = 0;
    key.material.color.setRGB(key.r, key.g, key.b);
  }
}

function newTune() {
  clearBalls();
  clearWhackers();
  resetKeyCounts();
  darkenKeys(0);
}

function resetTimer(songTime) {
  timeInSong = songTime;
  localStartTime = Date.now();
}

function animate() {
  // hack - better would be to get a signal from when the music player plays
  if ( prevNotesLength !== notes.length ) {
    newTune();
  }
  requestAnimationFrame(animate);

  controls.update();

  // first time called, establish what time it is when the song starts
  localStartTime = localStartTime || Date.now();
  
  var timeFromStart = Date.now() - localStartTime;
  
  // currTime is how far into the song itself we are
  var currTime = timeInSong + timeFromStart;

  if ( !debugFreezeFrame ) {

    // ugh - sometimes there are jumps backwards in time, causing weirdness with the animation TODO
    //if ( debugPrevTime > currTime ) {
    //  console.log(" TIME JUMP " + debugPrevTime + " to " + currTime );
    //}
    if (musicPlaying) {
      addBallsToMusic(currTime);
    }

    moveBalls(currTime);
    moveWhackers(currTime);
    darkenKeys(currTime);
    //debugPrevTime = currTime;
  }

  renderer.render(scene, camera);

  prevNotesLength = notes.length;
}

init();
animate();