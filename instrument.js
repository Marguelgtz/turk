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
var tubeColor = 0xD1D1D1;

var cannonBaseRadius = 10;
var cannonTopRadius = 15;
var cannonThickness = 3;
var cannonHeight = 40;

var shortestKeyLength = 15;
var longestKeyLength = 40;
var keyLength = 7;
var keyWidth = 5;
var keyThickness = 2;
var keyLengthSpacing = -keyLength - 4;
var keyLengthOffset = -50;
var keyWidthSpacing = keyWidth + 4;
var keyWidthOffset = -keyWidthSpacing * 5.5;

var numKeys = 88;

var keyRadius = 100;

var bucketRadiusToCannon = 140;
var bucketPositionOffset = 0.2;

var bucketBaseRadius = 3;
var bucketTopRadius = 5;
var bucketHeight = 12;
var bucketThickness = 1;

var darkBaseRadius = bucketBaseRadius + 0.5;
var darkBaseHeight = 1;
var blackColor = 0x000000;

var tubeRadius = 3;

var numCentralizingPipes = 7;

var ballRadius = 2;

var ballHangtime = 100;
var G = -0.1;

var initVelocity = -G * ballHangtime / 2;
var firingAngle = Math.acos(keyRadius / (ballHangtime * initVelocity));
var velocityOut = Math.cos(firingAngle) * initVelocity;

var bounceHangtime = 48;

var bounceVelocity = -G * bounceHangtime / 2;
var bounceAngle = Math.acos((bucketRadiusToCannon - keyRadius) / (bounceHangtime * bounceVelocity));
var bounceOut   = Math.cos(bounceAngle) * bounceVelocity;

var currentDropper = 0;
var numDroppers = 10;
var dropperWidth = 10;
var dropperWidthOffset = -dropperWidth * (numDroppers-1) / 2;
var dropperHeight = 100;

var whackerHeight = 30;
var bounceHeight = 70;

var keys = [];
var balls = [];

var ballHeadstart = 1730;
var ballFadeDuration = 300;

var dropStart = -ballHeadstart;
var dropEnd, bounceApex;
var hitStart = 0;
var hitEnd = ballFadeDuration;

var timeInSong = -startDelay;
var localStartTime;

var sphereGeo;
var sphereMtl;

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
  bounceApex = dropStart * span3/spanSum;

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer( {antialias: true} );
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene = new THREE.Scene();
  
  sphereGeo = new THREE.SphereGeometry(ballRadius, 20, 10); // more symmetrical is having something like 24, 12
  sphereMtl = new THREE.MeshPhongMaterial({ color: ballColor });

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
  var light1 = new THREE.PointLight(0xFFFFFF);

  light1.position.x = 0;
  light1.position.y = 500;
  light1.position.z = 500;

  scene.add(light1);

  var light2 = new THREE.PointLight(0xFFFFFF);

  light2.position.x = 0;
  light2.position.y = 500;
  light2.position.z = -500;

  scene.add(light2);
}

function addDropper() {
}

function addKeys() {
  for (var i = 0; i < numKeys; i++) {
    // 8 rows of 12 keys each, 4 at highest range
    var key = new THREE.Mesh(
      new THREE.CubeGeometry(keyLength, keyThickness, keyWidth),
      new THREE.MeshPhongMaterial({ color: brassColor })
    );

    keyPosition( i, key.position );

    scene.add(key);

    keys.push(key);
  }
}

function keyPosition(id, pos) {
  pos.x = parseInt( id / 12 ) * keyLengthSpacing + keyLengthOffset;
  pos.z = ( id % 12 ) * keyWidthSpacing + keyWidthOffset;
  // put top of key at y == 0, for simplicity
  pos.y = -keyThickness/2;
}

function addHousing() {
}

function animate() {
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
  darkenKeys();

  renderer.render(scene, camera);
}

function Ball(keyTarget,dropper,t) {
  this.target = keyTarget;
  this.start = new THREE.Vector3(0, dropperHeight, dropper * dropperWidth + dropperWidthOffset);
  this.end = new THREE.Vector3();
  keyPosition( keyTarget, this.end );
  this.time = t;
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
  if (notes.length == 0)
    return;

  while (notes[0].time < t + ballHeadstart) {
    // TODO: test if ball time has passed - don't add it, if so; just remove note
    addBall(notes[0].note - MIDI.pianoKeyOffset, currentDropper, notes[0].time);
    notes.splice(0, 1);
    currentDropper++;
    if ( currentDropper >= numDroppers ) {
      currentDropper = 0;
    }

    if (notes.length === 0) {
      return;
    }
  }
}

function moveBalls(t) {
  var x,y,z, timeDiff;
  for (var i = balls.length - 1; i >= 0; i--) {
    var ball = balls[i];
    var animTime = t - ball.time;

    // compute location of ball in one of three zones:
    // 1) dropping from dropper: dropStart to dropEnd
    // 2) bouncing from whacker: dropEnd to hitStart
    // 3) sinking into key: hitStart to hitEnd
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
    } else if (animTime < hitEnd) {
      // ball sinking into key
      ball.object.position.copy(ball.end);
      timeDiff = (animTime-hitStart)/(hitEnd-hitStart);
      //if ( ball.object.visible ) {
        //ball.object.visible = false;  // TODO - make key grow, ball sink, etc.
      //}
      ball.object.position.y = -timeDiff * ballRadius;
      // still sinking
      makeKeyGlow(ball.target);
    } else {
      // delete ball, we're at end of life
      scene.remove(ball.object);
      // remove ball from array
      balls.splice(i, 1);
    }
  }
}

function makeKeyGlow(key) {
  keys[key].material.color.setHex(transitionColors[transitionColors.length - 1]);
}

function darkenKeys() {
  for (var i = 0; i < numKeys; i++) {
    var key = keys[i];

    var state = transitionColors.indexOf(key.material.color.getHex());
    if (state === 0) {
      continue;
    } else {
      key.material.color.setHex(transitionColors[state - 1]);
    }
  }
}

function resetTimer(songTime) {
  timeInSong = songTime;
  localStartTime = Date.now();
}

function addControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    var radius = 100 * 0.75; // scalar value used to determine relative zoom distances
    controls.rotateSpeed = 1;
    controls.zoomSpeed = 1;
    controls.panSpeed = 1;

    controls.minDistance = radius * 1.1;
    controls.maxDistance = radius * 25;

    controls.keys = [65, 83, 68]; // [ rotateKey, zoomKey, panKey ]
}

init();
fillScene();
animate();