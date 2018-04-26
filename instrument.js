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

var keys = [];
var balls = [];
var queue = [];

var ballHeadstart = 1730;

var timeInSong = -startDelay;
var lastUpdatedTime;

var sphereGeo, tubeGeo, cylGeoTop, cylGeoBottom, spokeGeo;

function init() {
  var WIDTH = $('.rest').width() - 5,
      HEIGHT = $('.rest').height() - 5,
      VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

  console.log('Size: ' + WIDTH + ' ' + HEIGHT);

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer( {antialias: true} );
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene = new THREE.Scene();
  
  sphereGeo = new THREE.SphereGeometry(ballRadius, 20, 10); // more symmetrical is having something like 24, 12
  sphereMtl = new THREE.MeshPhongMaterial({ color: ballColor });

  camera.position.y = 50;
  camera.position.x = -220;
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

    key.position.x = parseInt( i / 12 ) * keyLengthSpacing + keyLengthOffset;
    key.position.z = ( i % 12 ) * keyWidthSpacing + keyWidthOffset;
    // put top of key at y == 0, for simplicity
    key.position.y = -keyThickness/2;

    scene.add(key);

    keys.push(key);
  }
}

function addHousing() {
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (musicPlaying) {
    throwBallsToMusic();
  }

  moveBalls();
  darkenKeys();

  renderer.render(scene, camera);
}

function Ball(keyTarget) {
  this.target = keyTarget;
  this.angle = 2 * Math.PI * keyTarget / numKeys;
  this.velocityUp = initVelocity * Math.sin(firingAngle);
  this.cannon = new THREE.Mesh(
    sphereGeo,
    sphereMtl
  );
  this.cannon.position.y = 0;
  this.object = new THREE.Object3D();
  this.object.add(this.cannon);
  this.object.rotation.y = this.angle;
}

function addBall(keyTarget) {
  var ball = new Ball(keyTarget);

  queue.push(Date.now());

  balls.push(ball);

  scene.add(ball.object);
}

// where the magic happens
function throwBallsToMusic() {
  if (notes.length == 0)
    return;

  lastUpdatedTime = lastUpdatedTime || Date.now();

  var delta = 0.01;
  
  var interpolatedTime = Date.now() - lastUpdatedTime;
  
  var currTime = timeInSong + interpolatedTime;

  while (notes[0].time < currTime + ballHeadstart) {
    addBall(notes[0].note - MIDI.pianoKeyOffset);
    notes.splice(0, 1);

    if (notes.length === 0) {
      return;
    }
  }
}

function moveBalls() {
  for (var i = balls.length - 1; i >= 0; i--) {
    var ball = balls[i];

    // if ball is below Y plane
    if (ball.cannon.position.y < 0) {
      // if ball is at or beyond bucket, remove it
      if (ball.cannon.position.x >= bucketRadiusToCannon) {
        scene.remove(ball.object);
        // remove ball from array
        balls.splice(i, 1);
        continue;
      } else {
        // must be first bounce event
        // time from now to when ball was added
        ballHeadstart = Date.now() - queue.shift(1);

        makeKeyGlow(ball.target);

        // and bounce back up!
        ball.velocityUp = bounceVelocity * Math.sin(bounceAngle);
        ball.cannon.position.y = 0;
      }
    }

    // subtract gravity from velocity
    ball.velocityUp += G;

    if (ball.cannon.position.x < bucketRadiusToCannon) {
      ball.cannon.position.y += ball.velocityUp;
      ball.cannon.position.x += velocityOut;
    } else {
      ball.cannon.position.y += ball.velocityUp;
      ball.cannon.position.x += bounceOut;
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
  lastUpdatedTime = Date.now();
}

function addControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    var radius = 100 * 0.75; // scalar value used to determine relative zoom distances
    controls.rotateSpeed = 1;
    controls.zoomSpeed = 0.1;
    controls.panSpeed = 1;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;

    controls.minDistance = radius * 1.1;
    controls.maxDistance = radius * 25;

    controls.keys = [65, 83, 68]; // [ rotateKey, zoomKey, panKey ]
}

init();
fillScene();
animate();