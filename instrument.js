"use strict";

var runAnimation = false;

var renderer, scene, camera, controls, headlight;
var cameraSet = [];

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

var pianoWhiteKeyLength = Math.abs(keyLengthSpacing) * 0.85;
var pianoWhiteKeyWidth = pianoWhiteKeyLength * 1.2/6.1;
var pianoWhiteKeyWidthSpacing = 1.07 * pianoWhiteKeyWidth;
var pianoWhiteKeyThickness = pianoWhiteKeyWidth * 2/3;
var pianoBlackKeyLength = pianoWhiteKeyLength * 4/6.1;
var pianoBlackKeyWidth = pianoWhiteKeyWidth * 0.5;
var pianoBlackKeyThickness = pianoWhiteKeyThickness * 2;
// constant vectors
var pianoWhiteKeyOffset;
var pianoBlackKeyOffset;
var pianoWhiteKeyScale;
var pianoBlackKeyScale;
// starting with left edge of C, center Z location along the 7 white keys
var pianoSpacing = [ 0.5, 1, 1.5, 2, 2.5, 3.5, 4, 4.5, 5, 5.5, 6, 6.5 ];

var numKeys = 88;

var notesIndex = 0;

var ballRadius = 2;
// or set these to zero if you don't like the balls scattering on the keys
var ballScatterWidth = keyWidth - 2 * ballRadius;
var ballScatterHeight = keyLength - 2 * ballRadius;

// should not be larger than crossbarRadius
var connectorRadius = 0.3 * ballRadius;

// how much does a ball add to the height of a key? The right part is "correct", preserving volume. 1.5 is fudge.
var scaleCount = 1.5 * ((4/3)*Math.PI*ballRadius*ballRadius*ballRadius)/(keyLength*keyWidth);

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

// key animations at start
var keysDone = false;

var keys = [];
var balls = [];
var ballPool = [];
var whackers = [];
var whackerPool = [];
var connectors = [];
var connectorPool = [];

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

var prevNoteTime = 999999999;
var prevBall;

var ballGeo, dropperGeo, whackerArmGeo, whackerPlateGeo, connectorGeo;
var ballMtl, dropperMtl, whackerMtl, whackerPlateMtl;

var tempVec;
var tempTarget;
var tempColor;
var uniformScaleVec;
var zeroVec;
var yAxis;
var rotationAxis;
var rotMatrix;
var scaleMatrix;


// when set true, animation no longer changes
var debugFreezeFrame = false;
// look for time jump
//var debugPrevTime = 0;
//var totalConnectors = 0;

var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;

var keyFrames = [];
var interpKeyFrame = [];

var TIME_START = 0;
var TIME_END = 1;
var FOV = 2;
var POS_X = 3;
var POS_Y = 4;
var POS_Z = 5;
var TARGET_X = 6;
var TARGET_Y = 7;
var TARGET_Z = 8;
var UP_X = 9;
var UP_Y = 10;
var UP_Z = 11;
var INTERPOLATION = 12;
var CAM = 13;
var DISTANCE = 14;

var INTERP_LINEAR = 0;
var INTERP_QUADRATIC = 1;
var INTERP_QUAD_DIST = 2;

function init() {
  WIDTH = $('.rest').width() - 5;
  HEIGHT = $('.rest').height() - 5;
  VIEW_ANGLE = 45;
  ASPECT = WIDTH / HEIGHT;
  NEAR = 0.1;
  FAR = 1000;

  //console.log('Size: ' + WIDTH + ' ' + HEIGHT);

  tempVec = new THREE.Vector3();
  tempTarget = new THREE.Vector3();
  tempColor = new THREE.Color();
  uniformScaleVec = new THREE.Vector3(1,1,1);
  zeroVec = new THREE.Vector3(0,0,0);
  yAxis = new THREE.Vector3(0,1,0);
  rotationAxis = new THREE.Vector3();

  rotMatrix = new THREE.Matrix4();
  scaleMatrix = new THREE.Matrix4();

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
  ballMtl = new THREE.MeshPhysicalMaterial({ color: ballColor, roughness: 0.3, metalness: 0.5 });
  dropperGeo = new THREE.CylinderBufferGeometry(dropperRadius, ballRadius, dropperPartHeight, 20, 1);
  dropperMtl = new THREE.MeshPhysicalMaterial({ color: dropperColor });
  whackerArmGeo = new THREE.CylinderBufferGeometry(whackerRadius, whackerRadius, whackerArmHeight, 10, 1);
  whackerPlateGeo = new THREE.CylinderBufferGeometry(whackerPlateRadius, whackerPlateRadius, whackerPlateHeight, 30, 1);
  whackerMtl = new THREE.MeshPhysicalMaterial({ color: whackerColor });
  whackerPlateMtl = new THREE.MeshPhysicalMaterial({ color: whackerPlateColor, roughness: 0.64, metalness: 0.67 });
  connectorGeo = new THREE.CylinderBufferGeometry(connectorRadius, connectorRadius, 1, 20, 1, true);

  if (runAnimation) {
    var xOff = 4 * keyLengthSpacing + keyLengthOffset;
    camera.position.x = xOff;
    camera.position.y = 200;
    camera.position.z = 0;
    camera.up.set(1,0,0);
    camera.lookAt(new THREE.Vector3(xOff, 0, 0));
  } else {
    camera.position.x = -210;
    camera.position.y = 150;
    camera.position.z = 170;
    camera.lookAt(new THREE.Vector3((keyLengthOffset + keyLengthSpacing*7 - keyLength/2)/2, 0, 0));
  }

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.setClearColor( 0x444444 );

  // attach the render-supplied DOM element
  $('#turk').append(renderer.domElement);

  // and the camera
  scene.add(camera);

  addControls();

  window.addEventListener( 'resize', onWindowResize, false );

  fillScene();
  setUpAnimation();
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function addControls() {
  if (!runAnimation) {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.rotateSpeed = 3;
    controls.zoomSpeed = 1;
    controls.panSpeed = 1;

    controls.target.set( (keyLengthOffset + keyLengthSpacing*7 - keyLength/2)/2, 0.8*housingOuterRadius, 0 );

    //var radius = 100 * 0.75; // scalar value used to determine relative zoom distances
    //controls.minDistance = radius * 0.1;
    //controls.maxDistance = radius * 25;

    //controls.keys = [65, 83, 68]; // [ rotateKey, zoomKey, panKey ]
  }
}

function setUpAnimation() {
  if ( runAnimation ) {
    // center of keyboard in X
    var xOff = 4 * keyLengthSpacing + keyLengthOffset;
    var xOff2 = 0 * keyLengthSpacing + keyLengthOffset;
    var xOff3 = 8 * keyLengthSpacing + keyLengthOffset;
    //                times   fov   position                  target                  up        type of transition to next
    // top view
    keyFrames.push( [ -6,  0,  45,  xOff,         200,     0,  xOff, -ballRadius, 0,   1, 0, 0,  INTERP_QUADRATIC, null, 0] );
    // rotate 90
    keyFrames.push( [  4,  5,  45,  xOff,         160,     0,  xOff, -ballRadius, 0,   0, 0,-1,  INTERP_QUAD_DIST, null, 0] );
    // side view up close
    keyFrames.push( [  8,  8,  45,  xOff, -ballRadius,   -70,  xOff, -ballRadius, 0,   0, 1, 0,  INTERP_LINEAR, null, 0] );
    // pull back
    keyFrames.push( [ 11, 11,  45,  xOff, -ballRadius,  -200,  xOff, -ballRadius, 0,   0, 1, 0,  INTERP_QUADRATIC, null, 0] );
    // flip view
    keyFrames.push( [ 15, 16,  45,  xOff,  -ballRadius, -200,  xOff, -ballRadius, 0,   0,-1, 0,  INTERP_LINEAR, null, 0] );
    // pull "up" (down)
    keyFrames.push( [ 22, 22,  45,  xOff2, -200-ballRadius, -100,  xOff, -ballRadius, 0,   0,-1, 0,  INTERP_QUAD_DIST, null, 0] );
    // rotate around
    keyFrames.push( [ 28, 40,  45,  xOff2, -200-ballRadius, 100,  xOff, -ballRadius, 0,   0,-1, 0,  INTERP_QUAD_DIST, null, 0] );

    for ( var i = 0; i < keyFrames.length; i++ ) {
      var keyFrame = keyFrames[i];
      initKeyFrameCamera(keyFrame);
    }

    // values don't matter, except for camera.
    interpKeyFrame = [ 0, 0, 45,  xOff,  200,    0,  xOff, -ballRadius*5, 0,   1, 0, 0,  INTERP_LINEAR, null];
    initKeyFrameCamera(interpKeyFrame);
  }
}

function initKeyFrameCamera( keyFrame )
{
  var cam = new THREE.PerspectiveCamera(keyFrame[FOV], ASPECT, NEAR, FAR);
  cam.position.set( keyFrame[POS_X], keyFrame[POS_Y], keyFrame[POS_Z] );
  cam.up.set( keyFrame[UP_X], keyFrame[UP_Y], keyFrame[UP_Z] );
  tempVec.set( keyFrame[TARGET_X], keyFrame[TARGET_Y], keyFrame[TARGET_Z] );
  cam.lookAt( tempVec );
  keyFrame[CAM] = cam;

  // distance between pos and target
  tempVec.set( keyFrame[POS_X], keyFrame[POS_Y], keyFrame[POS_Z] );
  tempTarget.set( keyFrame[TARGET_X], keyFrame[TARGET_Y], keyFrame[TARGET_Z] );
  keyFrame[DISTANCE] = tempVec.sub( tempTarget ).length();
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
  var dirLight = new THREE.DirectionalLight( 0xbbbbbb, 1 );
  dirLight.position.set( 0, dropperHeight+dropperPartHeight+1, 0 );
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 0;
  dirLight.shadow.camera.far = dropperHeight+dropperPartHeight+housingCapOuterRadius + 2;
  dirLight.shadow.camera.right = housingCapOuterRadius + 1;
  dirLight.shadow.camera.left = keyLengthOffset + keyLengthSpacing*8 - keyLength/2 - 1;
  // actually left, looking down keys at housing
  // measurement assumes housing is wider than the set of keys
  dirLight.shadow.camera.top  = housingWidth/2 + housingThickness + 1;
  dirLight.shadow.camera.bottom = -dirLight.shadow.camera.top;
  dirLight.shadow.mapSize.width = 3000;
  // make height proportional to width so that shadow pixels are "square"
  dirLight.shadow.mapSize.height = parseInt(dirLight.shadow.mapSize.width *
    (dirLight.shadow.camera.top-dirLight.shadow.camera.bottom)/(dirLight.shadow.camera.right-dirLight.shadow.camera.left));
  scene.add( dirLight );

  // debug aid: shows light's camera bounds.
  //scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

  headlight = new THREE.PointLight(0xdddddd);

  headlight.position.copy(camera.position);

  scene.add(headlight);

  var dirLight = new THREE.DirectionalLight( 0x777777, 1 );
  dirLight.position.set( 0, -200, 0 );
  scene.add( dirLight );


/*light2.position.x = 200;
  light2.position.y = 200;
  light2.position.z = -500;

  var light3 = new THREE.DirectionalLight(0xeeeeee);

  light3.position.x = -400;
  light3.position.y = -200;
  light3.position.z = 300;

  scene.add(light3);
 */
}

function addDropper() {
  // cross bar
  var crossbar = new THREE.Mesh(
    new THREE.CylinderBufferGeometry( crossbarRadius, crossbarRadius, numDroppers*dropperWidth, 10, 1),
    dropperMtl
  );
  crossbar.position.set(0, dropperHeight, 0);
  crossbar.rotation.set(Math.PI/2, 0, 0);
  setAsStatic(crossbar);
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
    setAsStatic(dropper);
    scene.add(dropper);
  }
}

function setAsStatic(obj) {
  // never moves, so avoid having three.js constantly update it
  obj.matrixAutoUpdate = false;
  obj.updateMatrix();
}

function addKeys() {
  pianoWhiteKeyOffset = new THREE.Vector3(0,0,0);
  // the 1.05 and 0.95 are to avoid z-fighting, letting the black keys poke through the back and bottom a little.
  pianoBlackKeyOffset = new THREE.Vector3(1.05 * (pianoWhiteKeyLength-pianoBlackKeyLength)/2, 0.95 * (pianoBlackKeyThickness-pianoWhiteKeyThickness)/2, 0);
  pianoWhiteKeyScale = new THREE.Vector3(pianoWhiteKeyLength/keyLength, pianoWhiteKeyThickness/keyThickness, pianoWhiteKeyWidth/keyWidth);
  pianoBlackKeyScale = new THREE.Vector3(pianoBlackKeyLength/keyLength, pianoBlackKeyThickness/keyThickness, pianoBlackKeyWidth/keyWidth);
    
  for (var i = 0; i < numKeys; i++) {
    // 9 rows of 12 keys each, 3 at lowest range and 1 at highest range
    var key = new THREE.Mesh(
      new THREE.BoxBufferGeometry(keyLength, keyThickness, keyWidth),
      new THREE.MeshPhysicalMaterial( {roughness: 1.0} )
    );

    // bit lazy here, adding properties to the Mesh itself
    key.ballCount = 0;
    key.frameBallCount = 0;
    key.lastTap = 0;
    key.number = i;
    key.black = false;

    // key "unhighlighted" color
    // is it a black key? darken
    var blackScale = 0.5;
    var keyType = i % 12;
    if ( keyType === 1 || keyType === 4 || keyType === 6 || keyType === 9 || keyType === 11 ) {
      // not gamma corrected, but so be it.
      key.black = true;
      blackScale *= 0.4;
    }

    // you could play with .75 to cycle the colors
    key.material.color.setHSL((1.75-i/100)%1, 1, blackScale );
    key.r = key.material.color.r;
    key.g = key.material.color.g;
    key.b = key.material.color.b;
    //key.castShadow = true;  // doesn't cast shadows on anything, so not needed
    key.receiveShadow = true;

    keyPosition( i, key.position );
    setKeyDepth(key);
    key.final_position = new THREE.Vector3();
    key.final_position.copy(key.position);
    createPianoKey(key);

    scene.add(key);

    keys.push(key);
  }
}

function createPianoKey(key)
{
  key.piano = new Object();
  key.piano.position = new THREE.Vector3();
  // the tricky bit: computing the key location
  var id = key.number + 9;
  // subtract off the 5, which is what the 9 offset causes for the first key
  var relPos = parseInt( id / 12 ) * 7 + pianoSpacing[ id % 12 ] - 5;
  // there are 52 white keys, so middle is 26
  key.piano.position.set( 4 * keyLengthSpacing + keyLengthOffset, key.final_position.y, relPos * pianoWhiteKeyWidthSpacing - pianoWhiteKeyWidthSpacing*26 );
  key.piano.offset = key.black ? pianoBlackKeyOffset : pianoWhiteKeyOffset;
  key.piano.scale = key.black ? pianoBlackKeyScale : pianoWhiteKeyScale;
}

function keyPosition(id, pos) {
  // add 9 so that beginning keys A A# B appear at end of line
  id += 9;
  pos.x = parseInt( id / 12 ) * keyLengthSpacing + keyLengthOffset;
  pos.z = ( id % 12 ) * keyWidthSpacing + keyWidthOffset;
  pos.y = -ballRadius;
}

function setKeyDepth(key) {
  var heightAdjust = scaleCount * (key.ballCount + key.frameBallCount);
  key.scale.y = heightAdjust+1;
  key.position.y = -ballRadius - keyThickness/2 - heightAdjust;
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
  setAsStatic(housing);
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
  setAsStatic(housingCap1);
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
  setAsStatic(housingCap2);
  scene.add(housingCap2);
  
  var spindle = new THREE.Mesh(
    new THREE.CylinderBufferGeometry( spindleRadius, spindleRadius, housingWidth + 4*housingThickness, 24, 1),
    whackerMtl
  );
  spindle.rotation.set(Math.PI/2, 0, 0);
  spindle.castShadow = true;
  spindle.receiveShadow = true;
  setAsStatic(spindle);
  scene.add(spindle);
}

function Ball() {
  //this.dropper = dropper;
  this.target = 0;
  this.time = 0;
  this.hit = false;
  this.start = new THREE.Vector3();
  this.end = new THREE.Vector3();
  this.object = new THREE.Mesh(
    ballGeo,
    ballMtl
  );
  this.free = false;
}

function initBall(ball,keyTarget,dropper,t) {
  ball.target = keyTarget;
  ball.start.set(0, dropperHeight, dropper * dropperWidth + dropperWidthOffset);
  keyPosition( keyTarget, ball.end );
  // jitter the end position a bit, so you can see multiple ball hits (thanks, Andrew)
  ball.end.x += (Math.random()-0.5) * ballScatterHeight;
  ball.end.z += (Math.random()-0.5) * ballScatterWidth;
  ball.time = t;
  ball.hit = false;
  ball.free = false;
  ball.object.position.copy( ball.start );
  // shadow gets turned off at end, so make sure it's on if ball is from pool
  ball.object.castShadow = true;

  // receiving can look bad, see debugFreezeFrame t=5000 for Flight of the Bumblebees, I think it's a bias bug?
  //ball.object.receiveShadow = true;
}

function assignBall(keyTarget,dropper,t) {
  var ball;
  if ( ballPool.length === 0 ) {
    ball = new Ball();
  } else {
    ball = ballPool.pop();
  }
  initBall(ball,keyTarget,dropper,t);
  return ball;
}

function addBall(keyTarget,dropper,t) {
  var ball;
  ball = assignBall(keyTarget,dropper,t);

  balls.push(ball);

  scene.add(ball.object);
}

// add balls if time to do so
function addBallsToMusic(t) {
  // is note's playing time less the head start less that the current time
  if (notes && notes.length > notesIndex) {

    while (notes[notesIndex].time - ballHeadstart < t ) {
      // if ball time has passed - don't add it, if so; just remove note
      var note = notes[notesIndex];
      var keyID = note.note - MIDI.pianoKeyOffset;

      // debug: to force a particular octave, e.g. the highest, 7*12
      //keyID = 7*12 + keyID % 12;
      //keyID = keyID % 12;

      if (note.time + hitEnd > t ) {
        addBall(keyID, currentDropper, note.time);
        addWhacker(keyID, currentDropper, note.time);
        // if notes are within 10/1000ths of a second, consider it a chord
        if ( prevBall && prevNoteTime + 0 >= note.time ) {
          // previous note's time matches this note's, so make a connector
          addConnector( prevBall, balls[balls.length-1])
        }
        prevNoteTime = note.time;
        prevBall = balls[balls.length-1];
      } else {
        // note the ball's effect on the key
        extendKeyFully(keyID);
      }
      // remove note from note list
      //notes.splice(0, 1);
      // better is to change starting count, vs. messing with memory
      notesIndex++;

      // note ball is added at current dropper, in order, then we increment
      // (if we know which finger is pressing the key, use that instead)
      currentDropper++;
      if ( currentDropper >= numDroppers ) {
        currentDropper = 0;
      }

      if (++notesIndex >= notes.length) {
        return;
      }
    }
  }
}

function Connector() {
  this.ball1 = 0;
  this.ball2 = 0;
  this.object = new THREE.Mesh(
    connectorGeo,
    // separate material for each, as we change transparency on fade out
    new THREE.MeshPhysicalMaterial({ color: ballColor, roughness: 0.3, metalness: 0.5 })
  );
  this.object.castShadow = true;
  this.object.receiveShadow = true;
  // we compute our own transform each frame
  this.object.matrixAutoUpdate = false;
  this.free = false;
}

function initConnector(connector, ball1, ball2) {
  connector.ball1 = ball1;
  connector.ball2 = ball2;
  // reset material, if this is a pooled ball, already faded out
  connector.object.material.opacity = 1.0;
  connector.object.material.transparency = false;
  connector.free = false;
}

function assignConnector(ball1, ball2)
{
  var connector;
  if ( connectorPool.length === 0 ) {
    connector = new Connector();
  } else {
    connector = connectorPool.pop();
  }
  initConnector(connector,ball1, ball2);
  return connector;
}

function addConnector(ball1, ball2) {
  var connector = assignConnector(ball1, ball2);

  connectors.push(connector);

  scene.add(connector.object);
  //console.log("total connectors: " + totalConnectors++ );
}

function Whacker() {
  this.arm = new THREE.Mesh(
    whackerArmGeo,
    whackerMtl
  );
  this.arm.castShadow = true;
  // having these receive shadows is distracting, IMO
  //this.arm.receiveShadow = true;

  this.target = 0;
  this.dropper = 0;
  this.time = 0;

  this.plate = new THREE.Mesh(
    whackerPlateGeo,
    whackerPlateMtl
  );
  this.plate.castShadow = true;
  this.plate.receiveShadow = true;
  
  this.object = new THREE.Object3D();
  this.object.add(this.arm);
  this.object.add(this.plate);

  this.free = false;
}

function initWhacker(whacker,keyTarget,dropper,t) {
  // take direction to end point and come up with half angle and azimuth, more or less
  var z = parseInt(keyTarget/12);
  var zrot = Math.PI/24 + z * 3*Math.PI/(7*24);

  // shorten real arm so that hit location is better against sphere's surface
  var adjustedWhackerHeight = whackerArmHeight - (ballRadius+whackerPlateHeight/2)/Math.cos(zrot);

  keyPosition( keyTarget, tempVec );
  tempVec.z -= dropper * dropperWidth + dropperWidthOffset;

  whacker.target = keyTarget;
  whacker.dropper = dropper; // only used for debugging
  whacker.time = t;

  whacker.arm.position.y = -adjustedWhackerHeight/2;
  whacker.arm.scale.y = adjustedWhackerHeight / whackerHeight;

  whacker.plate.position.y = -adjustedWhackerHeight;
  whacker.plate.rotation.z = zrot;
  whacker.plate.rotation.x = -Math.atan2(tempVec.z,-tempVec.x)/2;
  whacker.plate.scale.x = 2.0;
  
  whacker.object.position.set(0, 0, dropper * dropperWidth + dropperWidthOffset);

  whacker.free = false;
}

function assignWhacker(keyTarget,dropper,t) {
  var whacker;
  if ( whackerPool.length === 0 ) {
    whacker = new Whacker();
  } else {
    whacker = whackerPool.pop();
  }
  initWhacker(whacker,keyTarget,dropper,t);
  return whacker;
}

function addWhacker(keyTarget,dropper,t) {
  var whacker = assignWhacker(keyTarget,dropper,t);

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

function lerpClamp(t, min, max) {
  var val = Math.min(Math.max(t, min), max);
  return ( val - min ) / ( max - min );
};

function moveBalls(t) {
  var x,y,z, timeDiff;
  for (var i = balls.length - 1; i >= 0; i--) {
    var ball = balls[i];
    var animTime = t - ball.time;

    // case 0: sometimes the clock gets set back when syncing, so avoid
    // this case by keeping the ball in place.
    if (animTime < dropStart ) {
      animTime = dropStart;
    }

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
      // delete ball if necessary, we're at end of life
      if ( !ball.free ) {
        balls.splice(i,1);
        extendKeyFully(ball.target);
        scene.remove(ball.object);
        ball.free = true;
        ballPool.push(ball);
      }
    }
  }
}

// assume to be called after moveBalls, so that the balls are in positions
function moveConnectors(t) {
  var x,y,z, timeDiff;
  for (var i = connectors.length - 1; i >= 0; i--) {
    var connector = connectors[i];
    var animTime = t - connector.ball1.time;

    if (animTime < hitStart) {
      // transform
      cylinderEndpointsToTransform( connector.object, connector.ball1.object.position, connector.ball2.object.position );
    } else if (animTime < hitSunk) {
      timeDiff = (animTime-hitStart)/(hitSunk-hitStart);
      if ( timeDiff >= 1 ) {
        connector.object.visible = false;
      } else {
        // fade by transparency
        connector.object.material.transparent = true;
        connector.object.material.opacity = 1 - timeDiff;
        cylinderEndpointsToTransform( connector.object, connector.ball1.object.position, connector.ball2.object.position );
      }
    } else {
      // delete connector, we're at end of life
      if ( !connector.free ) {
        // remove connector from array
        connectors.splice(i, 1);
        scene.remove(connector.object);
        connector.free = true;
        connectorPool.push(connector);
      }
    }
  }
}

// Transform a unit-height cylinder of given radius to align with given axis and then move to center
function cylinderEndpointsToTransform( cyl, top, bottom )
{
  // done on creation:
  //cyl.matrixAutoUpdate = false;
  
  tempVec.addVectors( top, bottom );
  tempVec.divideScalar( 2.0 );

  // From left to right using frames: translate, then rotate, then scale; TRS.
  // So translate is first.
  cyl.matrix.makeTranslation( tempVec.x, tempVec.y, tempVec.z );

  // scale along Y axis
  tempVec.subVectors( top, bottom );  // desired cylinder axis direction
  scaleMatrix.makeScale( 1, tempVec.length(), 1)

  // take cross product of  and up vector to get axis of rotation
  // Needed later for dot product, just do it now.
  tempVec.normalize();
  rotationAxis.crossVectors( tempVec, yAxis );
  if ( rotationAxis.length() < 0.000001 )
  {
    // Special case: if rotationAxis is just about zero, set to X axis,
    // so that the angle can be given as 0 or PI. This works ONLY
    // because we know one of the two axes is +Y.
    rotationAxis.set( 1, 0, 0 );
  }
  rotationAxis.normalize();

  // take dot product of cylinder axis and up vector to get cosine of angle of rotation
  var theta = -Math.acos( tempVec.dot( yAxis ) );
  rotMatrix.makeRotationAxis( rotationAxis, theta );
  cyl.matrix.multiply( rotMatrix );
  
  cyl.matrix.multiply( scaleMatrix );
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
      if ( !whacker.free ) {
        // remove whacker from array
        whackers.splice(i, 1);
        scene.remove(whacker.object);
        whacker.free = true;
        whackerPool.push(whacker);
      }
    }
  }
}

function clearBalls() {
  if ( balls && balls.length > 0 ) {
    for (var i = balls.length - 1; i >= 0; i--) {
      var ball = balls[i];
      scene.remove(ball.object);
      ballPool.push(ball);
      ball.free = true;
    }
    balls = [];
  }
  prevBall = undefined;
}

function clearWhackers() {
  if ( whackers && whackers.length > 0 ) {
    for (var i = whackers.length - 1; i >= 0; i--) {
      var whacker = whackers[i];
      scene.remove(whacker.object);
      whackerPool.push(whacker);
      whacker.free = true;
    }
    whackers = [];
  }
}

function clearConnectors() {
  if ( connectors && connectors.length > 0 ) {
    for (var i = connectors.length - 1; i >= 0; i--) {
      var connector = connectors[i];
      scene.remove(connector.object);
      connectorPool.push(connector);
      connector.free = true;
    }
    connectors = [];
  }
}

function animateKeys(t) {
  // initial keyboard to grid animation
  moveKeys(t);
  //debugFreezeFrame = true;

  if ( keysDone ) {
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
}

function moveKeys(t) {
  // 
  if ( !keysDone ) {
    if ( t > 0 ) {
      keysDone = true;
    }
    for (var i = 0; i < numKeys; i++) {
      // 9 rows of 12 keys each, 3 at lowest range and 1 at highest range
      var key = keys[i];

      // first move: keys pull apart vertically to separate octaves
      var animVerticalStart = -5*startDelay/6;
      var animVerticalEnd = -3.5*startDelay/6;
      var animHorizontalStart = -3.5*startDelay/6;
      var animHorizontalEnd = -1*startDelay/6;
      var animShapeStart = -2.5*startDelay/6;
      var animShapeEnd = -1*startDelay/6;
      var animColorStart = -3*startDelay/6;
      var animColorEnd = -0.5*startDelay/6;

      // set piano key position, lerp from it
      key.position.copy( key.piano.position );
      key.scale.copy( key.piano.scale );

      if ( t < animVerticalEnd ) {
        var vertInterp = lerpClamp( t, animVerticalStart, animVerticalEnd );
        vertInterp = tweenQuadraticInOut(vertInterp);
        tempVec.set( key.final_position.x, key.final_position.y, key.piano.position.z );
        key.position.lerp( tempVec, vertInterp );
      } else {
        // second move: key sets move into place horizontally
        var horizInterp = lerpClamp( t, animHorizontalStart, animHorizontalEnd );
        horizInterp = tweenQuadraticInOut(horizInterp);
        // start position
        key.position.x = key.final_position.x;
        tempVec.set( key.final_position.x, key.final_position.y, key.final_position.z );
        key.position.lerp( tempVec, horizInterp );
      }

      // transform: keys change shape
      var shapeInterp = lerpClamp( t, animShapeStart, animShapeEnd );
      shapeInterp = tweenQuadraticInOut(shapeInterp);
      key.scale.lerp( uniformScaleVec, shapeInterp);
      tempVec.copy(key.piano.offset);
      tempVec.lerp( zeroVec, shapeInterp);

      key.position.add(tempVec);

      // color shift: keys change to colors
      var colorInterp = lerpClamp( t, animColorStart, animColorEnd );
      colorInterp = tweenQuadraticInOut(colorInterp);
      key.material.color.setScalar( key.black ? 0.1 : 1.0 );
      tempColor.setRGB( key.r, key.g, key.b );
      key.material.color.lerp( tempColor, colorInterp );
    }
  }
}

function tweenQuadraticInOut(k) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k;
  }

  return - 0.5 * (--k * (k - 2) - 1);
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
  notesIndex = 0;
  clearBalls();
  clearWhackers();
  clearConnectors();
  resetKeyCounts();
  animateKeys(0);
  if ( notes.length > 0 ) {
    console.log("song length: " + parseInt(notes[notes.length-1].time/1000));
  }
}

function resetTimer(songTime) {
  timeInSong = songTime;
  localStartTime = Date.now();
}

function animateCamera(camera, currTime, retTarget) {
  currTime /= 1000;
  var done = false;
  var useQuat = false;
  // put time into seconds
  for ( var i = 0; i < keyFrames.length && !done; i++ ) {
    var keyFrame = keyFrames[i];
    if ( keyFrame[TIME_START] <= currTime && keyFrame[TIME_END] >= currTime ) {
      // easy: set to this camera
      setCameraFromKeyframe(camera, keyFrame, useQuat, retTarget);
      done = true;
    } else if ( i < keyFrames.length-1 ) {
      // look at next keyframe and see if there's an overlap
      if ( keyFrame[TIME_END] <= currTime && keyFrames[i+1][TIME_START] >= currTime ) {
        // interpolate between frames
        var nextKeyFrame = keyFrames[i+1];
        var interp = lerpClamp( currTime, keyFrame[TIME_END], nextKeyFrame[TIME_START] );
        if ( keyFrame[INTERPOLATION] === INTERP_QUADRATIC || keyFrame[INTERPOLATION] === INTERP_QUAD_DIST ) {
          interp = tweenQuadraticInOut(interp);
        }
        // interpolate position, target, and FOV linearly (as modified by tween)
        for ( var j = FOV; j <= UP_Z; j++ ) {
          interpKeyFrame[j] = keyFrame[j] + interp*(nextKeyFrame[j]-keyFrame[j] );
        }

        // now, we interpolate "up" by slerp
        interpKeyFrame[CAM].quaternion.copy( keyFrame[CAM].quaternion );
        interpKeyFrame[CAM].quaternion.slerp(nextKeyFrame[CAM].quaternion, interp);
        // now the quaternion is set
        useQuat = true;

        //keyFrame[QUAT], nextKeyFrame[QUAT] );
        if ( keyFrame[INTERPOLATION] === INTERP_QUAD_DIST ) {
          // maintain distance of position to target.
          var dist = keyFrame[DISTANCE] + interp*(nextKeyFrame[DISTANCE]-keyFrame[DISTANCE] );
          tempVec.set( interpKeyFrame[POS_X], interpKeyFrame[POS_Y], interpKeyFrame[POS_Z] );
          tempTarget.set( interpKeyFrame[TARGET_X], interpKeyFrame[TARGET_Y], interpKeyFrame[TARGET_Z] );
          tempVec.sub( tempTarget ).normalize().multiplyScalar(dist);
          tempTarget.add( tempVec );
          interpKeyFrame[POS_X] = tempTarget.x;
          interpKeyFrame[POS_Y] = tempTarget.y;
          interpKeyFrame[POS_Z] = tempTarget.z;
        }
        setCameraFromKeyframe(camera, interpKeyFrame, useQuat, retTarget );
        done = true;
      }
    }
  }
}

function setCameraFromKeyframe(camera, keyFrame, useQuat, retTarget) {
  retTarget.set( keyFrame[TARGET_X], keyFrame[TARGET_Y], keyFrame[TARGET_Z] );
  camera.fov = keyFrame[FOV];
  camera.position.set( keyFrame[POS_X], keyFrame[POS_Y], keyFrame[POS_Z] );
  if ( useQuat ) {
    // TODO This should only affect the up direction, not the target
    tempVec.set( 0,1,0 ); //keyFrame[UP_X], keyFrame[UP_Y], keyFrame[UP_Z] );
    tempVec.applyQuaternion( keyFrame[CAM].quaternion );
    camera.up.copy( tempVec );
    //camera.quaternion.copy( keyFrame[CAM].quaternion ); 
  } else {
    camera.up.set( keyFrame[UP_X], keyFrame[UP_Y], keyFrame[UP_Z] );
  }
  camera.lookAt( retTarget );
  camera.updateProjectionMatrix();
}

function animate() {

  headlight.position.copy(camera.position);

  // hack - better would be to get a signal from when the music player plays
  if ( prevNotesLength !== notes.length ) {
    // TODO - it'd be nice to reset time within this code file, too
    newTune();
  }
  requestAnimationFrame(animate);

  // first time called, establish what time it is when the song starts
  localStartTime = localStartTime || Date.now();
  
  var timeFromStart = Date.now() - localStartTime;
  
  // currTime is how far into the song itself we are
  var currTime = timeInSong + timeFromStart;

  if ( !debugFreezeFrame ) {

    if (runAnimation) {
      animateCamera(camera, currTime, tempTarget);
    } else {
      // TODO: it'd be nice to have controls take over if touched.
      controls.update();
      //controls.target.copy(tempTarget);
    }
  
    // ugh - sometimes there are jumps backwards in time, causing weirdness with the animation TODO
    //if ( debugPrevTime > currTime ) {
    //  console.log(" TIME JUMP " + debugPrevTime + " to " + currTime );
    //}
    addBallsToMusic(currTime);

    moveBalls(currTime);
    moveConnectors(currTime);
    moveWhackers(currTime);
    animateKeys(currTime);
    //debugPrevTime = currTime;
  }

  renderer.render(scene, camera);

  prevNotesLength = notes.length;
}

init();
animate();