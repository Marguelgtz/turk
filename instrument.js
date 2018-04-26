"use strict";

var renderer, scene, camera, controls;

var transitionColors = [
  0xCC6600,
  0xD17519,
  0xD68533,
  0xDB944D,
  0xE0A366,
  0xE6B280,
  0xEBC299,
  0xF0D1B2,
  0xF5E0CC,
  0xFAF0E6
];

var brassColor = transitionColors[0];
var ballColor = 0xD4D4BF;

var keyLength = 7;
var keyWidth = 5;
var keyThickness = 2;
var keyLengthSpacing = -keyLength - 4;
var keyLengthOffset = -150;
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

var whackerHeight = 30;
var whackerRadius = 1;

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

var sphereGeo, dropperGeo, dropperSphereGeo, whackerArmGeo;
var sphereMtl, dropperMtl;

function init() {
  var WIDTH = $('.rest').width() - 5,
      HEIGHT = $('.rest').height() - 5,
      VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

  console.log('Size: ' + WIDTH + ' ' + HEIGHT);

  // Determine how much time is spent falling, bouncing up, and bouncing down
  var span1 = Math.sqrt(dropperHeight - whackerHeight);
  var span2 = Math.sqrt(bounceHeight - whackerHeight);
  var span3 = Math.sqrt(bounceHeight);
  var spanSum = span1 + span2 + span3;
  dropEnd = dropStart * (span2 + span3)/spanSum;
  whackEnd = dropEnd/2;
  bounceApex = dropStart * span3/spanSum;

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer( {antialias: true} );
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene = new THREE.Scene();
  
  sphereGeo = new THREE.SphereGeometry(ballRadius, 20, 10);
  sphereMtl = new THREE.MeshPhongMaterial({ color: ballColor });
  dropperGeo = new THREE.CylinderGeometry(dropperRadius, ballRadius, dropperPartHeight, 20, 1);
  dropperMtl = sphereMtl;
  whackerArmGeo = new THREE.CylinderGeometry(whackerRadius, whackerRadius, whackerHeight, 8, 1);

  camera.position.x = -190;
  camera.position.y = 120;
  camera.position.z = 170;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  $('#turk').append(renderer.domElement);

  // and the camera
  scene.add(camera);

  addControls();

  // draw!
  renderer.render(scene, camera);
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
  var light1 = new THREE.DirectionalLight(0xFFFFFF);

  light1.position.x = 0;
  light1.position.y = 500;
  light1.position.z = 0;

  scene.add(light1);

  var light2 = new THREE.DirectionalLight(0xbbbbbb);

  light2.position.x = 200;
  light2.position.y = -200;
  light2.position.z = -500;

  scene.add(light2);

  var light3 = new THREE.DirectionalLight(0xbbbbbb);

  light3.position.x = -300;
  light3.position.y = -300;
  light3.position.z = 400;

  scene.add(light3);
}

function addDropper() {
  // cross bar
  var crossbarRadius = 0.3 * ballRadius;
  var crossbar = new THREE.Mesh(
    new THREE.CylinderGeometry( crossbarRadius, crossbarRadius, numDroppers*dropperWidth, 10, 1),
    dropperMtl
  );
  crossbar.position.set(0, dropperHeight + dropperPartHeight/2 - crossbarRadius, 0);
  crossbar.rotation.set(Math.PI/2, 0, 0);
  scene.add(crossbar);

  for (var i = 0; i < numDroppers; i++) {
    var dropper = new THREE.Mesh(
      dropperGeo,
      dropperMtl
    );
    dropper.position.set(0, dropperHeight, i * dropperWidth + dropperWidthOffset);
    scene.add(dropper);
  }
}

function addKeys() {
  for (var i = 0; i < numKeys; i++) {
    // 8 rows of 12 keys each, 4 at highest range
    var key = new THREE.Mesh(
      new THREE.CubeGeometry(keyLength, keyThickness, keyWidth),
      new THREE.MeshPhongMaterial({ color: brassColor })
    );

    // bit lazy here, adding properties to the Mesh itself
    key.ballCount = 0;
    key.frameBallCount = 0;
    key.lastTap = 0;

    // key "unhighlighted" color
    switch( parseInt( i / 12 ) ) {
      case 0:
      key.r = 144; key.g = 25; key.b = 255;
      break;
      case 1:
      key.r = 25; key.g = 79; key.b = 255;
      break;
      case 2:
      key.r = 25; key.g = 252; key.b = 255;
      break;
      case 3:
      key.r = 25; key.g = 255; key.b = 85;
      break;
      case 4:
      key.r = 139; key.g = 255; key.b = 25;
      break;
      case 5:
      key.r = 255; key.g = 198; key.b = 25;
      break;
      case 6:
      key.r = 255; key.g = 25; key.b = 25;
      break;
      case 7:
      key.r = 255; key.g = 25; key.b = 193;
      break;
    }
    key.r /= 255;
    key.g /= 255;
    key.b /= 255;
    // is it a black key? darken
    var keyType = i % 12;
    if ( keyType === 1 || keyType === 4 || keyType === 6 || keyType === 9 || keyType === 11 ) {
      // not gamma corrected, but so be it.
      var blackScale = 0.6;
      key.r *= blackScale;
      key.g *= blackScale;
      key.b *= blackScale;
    }
    key.material.color.setRGB(key.r, key.g, key.b);

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
}

function animate() {
  // hack - better would be to get a signal from when the music player plays TODO
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

  if (musicPlaying) {
    addBallsToMusic(currTime);
  }

  moveBalls(currTime);
  moveWhackers(currTime);
  darkenKeys(currTime);

  renderer.render(scene, camera);

  prevNotesLength = notes.length;
}

function Ball(keyTarget,dropper,t) {
  this.target = keyTarget;
  this.start = new THREE.Vector3(0, dropperHeight, dropper * dropperWidth + dropperWidthOffset);
  this.end = new THREE.Vector3();
  keyPosition( keyTarget, this.end );
  this.time = t;
  this.hit = false;
  this.object = new THREE.Mesh(
    sphereGeo,
    sphereMtl
  );
  this.object.position.copy( this.start );
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
  this.target = keyTarget;
  this.time = t;
  this.arm = new THREE.Mesh(
    whackerArmGeo,
    sphereMtl
  );
  this.arm.position.y = -whackerHeight/2;
  this.object = new THREE.Object3D();
  this.object.add(this.arm);
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
      y = bounceHeight - bounceHeight * timeApex*timeApex;
      ball.object.position.set(x,y,z);
    } else if (animTime < hitSunk) {
      // ball sinking into key
      ball.object.position.copy(ball.end);
      timeDiff = (animTime-hitStart)/(hitSunk-hitStart);
      ball.object.position.y = -timeDiff * 2 * ballRadius;
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
  var x,y,z, timeDiff;
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
  resetKeyCounts();
  darkenKeys(0);
}

function resetTimer(songTime) {
  timeInSong = songTime;
  localStartTime = Date.now();
}

function addControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    var radius = 100 * 0.75; // scalar value used to determine relative zoom distances
    controls.rotateSpeed = 3;
    controls.zoomSpeed = 1;
    controls.panSpeed = 1;

    //controls.minDistance = radius * 0.1;
    //controls.maxDistance = radius * 25;

    controls.keys = [65, 83, 68]; // [ rotateKey, zoomKey, panKey ]
}

init();
fillScene();
animate();