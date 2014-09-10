var container, scene, renderer,  camera, light;
var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;

container = document.querySelector('.viewport');

WIDTH = window.innerWidth/2;
HEIGHT = window.innerHeight/2;

var width = WIDTH;
var height = HEIGHT;

VIEW_ANGLE = 10;
ASPECT = WIDTH / HEIGHT;
NEAR = 1;
FAR = 10000;

//SETUP THREE JS LIB
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(WIDTH, HEIGHT);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMapType = THREE.PCFShadowMap;
renderer.shadowMapAutoUpdate = true;
container.appendChild(renderer.domElement);

camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
camera.position.set(60, 10, 1);
camera.lookAt(scene.position);
scene.add(camera);

renderer.setClearColor( 0xffffff, 1);

light = new THREE.DirectionalLight(0xffffff);

light.position.set(0, 300, 0);
light.castShadow = true;
light.shadowCameraLeft = -60;
light.shadowCameraTop = -60;
light.shadowCameraRight = 60;
light.shadowCameraBottom = 60;
light.shadowCameraNear = 1;
light.shadowCameraFar = 1000;
light.shadowBias = -0.0001;
light.shadowMapWidth = light.shadowMapHeight = 1024;
light.shadowDarkness = 0.7;

scene.add(light);

var size = 10;
var step = 1;
var gridHelper = new THREE.GridHelper( size, step );

gridHelper.position = new THREE.Vector3( 7, -2, 0 );

scene.add( gridHelper );

var geometry = new THREE.CubeGeometry( 6, 6, 6, 3, 3, 3 );
var material = new THREE.MeshBasicMaterial( {color: 0x000000, wireframe:true} );


var mesh = new THREE.Mesh(geometry, material);

var cube = new THREE.BoxHelper( mesh );

scene.add( cube );

var acc = {
  x:0,
  y:0,
  z:0
};

//QUATERNION CONVERSION LIB

var degtorad = Math.PI / 180; // Degree-to-Radian conversion

function getBaseQuaternion( alpha, beta, gamma ) {
  var _x = beta  ? beta- degtorad : 0; // beta value
  var _y = gamma ? gamma * degtorad : 0; // gamma value
  var _z = alpha ? alpha * degtorad : 0; // alpha value

  var cX = Math.cos( _x/2 );
  var cY = Math.cos( _y/2 );
  var cZ = Math.cos( _z/2 );
  var sX = Math.sin( _x/2 );
  var sY = Math.sin( _y/2 );
  var sZ = Math.sin( _z/2 );

  //
  // ZXY quaternion construction.
  //

  var w = cX * cY * cZ - sX * sY * sZ;
  var x = sX * cY * cZ - cX * sY * sZ;
  var y = cX * sY * cZ + sX * cY * sZ;
  var z = cX * cY * sZ + sX * sY * cZ;

  return [ w, x, y, z ];
}

function getScreenTransformationQuaternion( screenOrientation ) {
  var orientationAngle = screenOrientation ? screenOrientation * degtorad : 0;

  var minusHalfAngle = - orientationAngle / 2;

  // Construct the screen transformation quaternion
  var q_s = [
    Math.cos( minusHalfAngle ),
    0,
    0,
    Math.sin( minusHalfAngle )
  ];

  return q_s;
}

function getWorldTransformationQuaternion() {
  var worldAngle = 90 * degtorad;

  var minusHalfAngle = - worldAngle / 2;

  // Construct the world transformation quaternion
  var q_w = [
    Math.cos( minusHalfAngle ),
    Math.sin( minusHalfAngle ),
    0,
    0
  ];

  return q_w;
}

function quaternionMultiply( a, b ) {
  var w = a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3];
  var x = a[1] * b[0] + a[0] * b[1] + a[2] * b[3] - a[3] * b[2];
  var y = a[2] * b[0] + a[0] * b[2] + a[3] * b[1] - a[1] * b[3];
  var z = a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1];

  return [ w, x, y, z ];
}

function computeQuaternion() {
  // var quaternion = getBaseQuaternion(
  //   deviceOrientationData.alpha,
  //   deviceOrientationData.beta,
  //   deviceOrientationData.gamma
  // ); // q


  var quaternion = getBaseQuaternion(
    acc.x,
    acc.y,
    acc.z
  ); // q


  var worldTransform = getWorldTransformationQuaternion(); // q_w

  var worldAdjustedQuaternion = quaternionMultiply( quaternion, worldTransform ); // q'_w

  //var screenTransform = getScreenTransformationQuaternion( currentScreenOrientation ); // q_s

  //var finalQuaternion = quaternionMultiply( worldAdjustedQuaternion, screenTransform ); // q'_s

  return worldAdjustedQuaternion; // [ w, x, y, z ]
}


if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', getDeviceRotation, false);
}else{
  $(".accelerometer-data").html("NOT SUPPORTED")
}

function getDeviceRotation(evt){ 
    // gamma is the left-to-right tilt in degrees, where right is positive
    // beta is the front-to-back tilt in degrees, where front is positive
    // alpha is the compass direction the device is facing in degrees
    acc.y = evt.beta;
    acc.z = evt.gamma;
    acc.x = evt.alpha;

    $(".accelerometer-data").html("x:" +acc.x+", y:" +acc.y+", z:" +acc.z);
}


function outputValues(){
  var qR = computeQuaternion();
  $(".quaternion").html("x:" +qR[0]+", y:" +qR[1]+", z:" +qR[2]+", w:"+ qR[3] );

  requestAnimationFrame(outputValues);
}

outputValues();
// 

//CALL RENDER TO UPDATE POSITION OF THREE JS CAMERA
function render() {

  var rotation = new THREE.Euler( 0, 0, 0, 'YXZ' );
 
  var qR = computeQuaternion();
  var tmpQuat = new THREE.Quaternion(qR[0],qR[1],+qR[2],qR[3]);

  var xRot = rotation.setFromQuaternion( tmpQuat, 'XYZ' ).x;
  var yRot = rotation.setFromQuaternion( tmpQuat, 'XYZ' ).y;
  var zRot = rotation.setFromQuaternion( tmpQuat, 'XYZ' ).z;

  $(".rotation-quat").html("x:" +xRot+", y:" +yRot+", z:" +zRot );
   
  // camera.rotation.x = xRot;
  // camera.rotation.y = yRot;
  // camera.rotation.z = zRot;

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

render();