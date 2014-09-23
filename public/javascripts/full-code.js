//INSTANTIATE THREE JS SCENE WITH TWO VIEWPORTS AND NORMAL TORUS IN MIDDLE

//create 3D canvas - guess this is the ThreeJs stage setup
var container1, container2, scene1, scene2, renderer1, renderer2, camera1, camera2, light1, light2, torus1, torus2;
var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;

container1 = document.querySelector('.viewport-1');
container2 = document.querySelector('.viewport-2');

WIDTH = window.innerWidth/2;
HEIGHT = window.innerHeight/2;

var width = WIDTH;
var height = HEIGHT;

VIEW_ANGLE = 10;
ASPECT = WIDTH / HEIGHT;
NEAR = 1;
FAR = 10000;

// Setup scene
scene1 = new THREE.Scene();
scene2 = new THREE.Scene();

renderer1 = new THREE.WebGLRenderer({antialias: true});

renderer1.setSize(WIDTH, HEIGHT);
renderer1.shadowMapEnabled = true;
renderer1.shadowMapSoft = true;
renderer1.shadowMapType = THREE.PCFShadowMap;
renderer1.shadowMapAutoUpdate = true;

container1.appendChild(renderer1.domElement);

renderer2 = new THREE.WebGLRenderer({antialias: true});

renderer2.setSize(WIDTH, HEIGHT);
renderer2.shadowMapEnabled = true;
renderer2.shadowMapSoft = true;
renderer2.shadowMapType = THREE.PCFShadowMap;
renderer2.shadowMapAutoUpdate = true;

container2.appendChild(renderer2.domElement);

camera1 = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
camera2 = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

camera1.rotation.order = 'YZX';
camera1.position.set(60, 10, 1);
camera1.lookAt(scene1.position);
scene1.add(camera1);

camera2.rotation.order = 'YZX';
camera2.position.set(60, 10, -1);
camera2.lookAt(scene2.position);
scene2.add(camera2);

renderer1.setClearColor( 0xffffff, 1);
renderer2.setClearColor( 0xffffff, 1);

light1 = new THREE.DirectionalLight(0xffffff);

light1.position.set(0, 300, 0);
light1.castShadow = true;
light1.shadowCameraLeft = -60;
light1.shadowCameraTop = -60;
light1.shadowCameraRight = 60;
light1.shadowCameraBottom = 60;
light1.shadowCameraNear = 1;
light1.shadowCameraFar = 1000;
light1.shadowBias = -0.0001;
light1.shadowMapWidth = light1.shadowMapHeight = 1024;
light1.shadowDarkness = 0.7;

light2 = new THREE.DirectionalLight(0xffffff);

light2.position.set(0, 300, 0);
light2.castShadow = true;
light2.shadowCameraLeft = -60;
light2.shadowCameraTop = -60;
light2.shadowCameraRight = 60;
light2.shadowCameraBottom = 60;
light2.shadowCameraNear = 1;
light2.shadowCameraFar = 1000;
light2.shadowBias = -0.0001;
light2.shadowMapWidth = light2.shadowMapHeight = 1024;
light2.shadowDarkness = 0.7;

scene1.add(light1);
scene2.add(light2);

var size = 10;
var step = 1;
var gridHelper1 = new THREE.GridHelper( size, step );

gridHelper1.position = new THREE.Vector3( 5, 0, 0 );

var gridHelper2 = new THREE.GridHelper( size, step );

gridHelper2.position = new THREE.Vector3( 5, 0, 0 );

scene1.add( gridHelper1 );
scene2.add( gridHelper2 );

var geometry1, geometry2, material1, material2;

geometry1 = new THREE.TorusGeometry(2, 1, 12, 12);
geometry2 = new THREE.TorusGeometry(2, 1, 12, 12);

material1 = new THREE.MeshNormalMaterial( );
material2 = new THREE.MeshNormalMaterial( );

torus1 = new THREE.Mesh( geometry1, material1 );
torus2 = new THREE.Mesh( geometry2, material2 );

torus1.position.set(2, 2, 0);
torus2.position.set(2, 2, 0);

torus1.rotation.y += 90;

torus2.rotation.y += 90;

scene1.add( torus1 );
scene2.add( torus2 );


//RETRIEVE ACCELEROMETER DATA

// var acc = {
//   x:0,
//   y:0,
//   z:0
// };

// if (window.DeviceOrientationEvent) {
//   window.addEventListener('deviceorientation', getDeviceRotation, false);
// }else{
//   $(".accelerometer").html("NOT SUPPORTED")
// }

// function getDeviceRotation(e){
//   $(".accelerometer").html(e.beta+", "+e.gamma+", "+e.alpha)
// }


//SMOOTH DATA RECEIVED WITH KALMAN FILTER


//UPDATE SCENE WITH NEW RENDER POSITION

// Add DeviceOrientation Controls
controls1 = new DeviceOrientationController( camera1, renderer1.domElement );
controls1.connect();

setupControllerEventHandlers( controls1 );


controls2 = new DeviceOrientationController( camera2, renderer2.domElement );
controls2.connect();

setupControllerEventHandlers( controls2 );

function setupControllerEventHandlers( controls ) {

  // Listen for manual rotate interaction

  controls.addEventListener( 'rotatestart', function () {
    controllerEl.innerText = 'Manual Rotate';
  });

  controls.addEventListener( 'rotateend', function () {
    controllerEl.innerText = controllerDefaultText;
  });
}

// Render loop
function render() {
  controls1.update();
  controls2.update();
  renderer1.render( scene1, camera1 );
  renderer2.render( scene2, camera2 );
  requestAnimationFrame(render );
}

render()