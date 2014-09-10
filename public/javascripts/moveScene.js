var container, scene, renderer,  camera, light;
var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;

container = document.querySelector('.viewport');

WIDTH = window.innerWidth/2;
HEIGHT = window.innerHeight/2;

var width = WIDTH;
var height = HEIGHT;

VIEW_ANGLE = 30;
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
var material = new THREE.MeshPhongMaterial( {color: 0x0000ff} );
// var mesh = new THREE.Mesh(geometry, material);
// var cube = new THREE.BoxHelper( mesh );

var cube = new THREE.Mesh(geometry, material);

scene.add( cube );

       
// old camera code camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

// Add DeviceOrientation Controls
controls = new DeviceOrientationController( camera, renderer.domElement );
controls.connect();

setupControllerEventHandlers( controls );

// Render loop
function animate() {
  controls.update();
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

// Demonstration of some DeviceOrientationController event handling
function setupControllerEventHandlers( controls ) {

  // Listen for manual rotate interaction

  controls.addEventListener( 'rotatestart', function () {
    controllerEl.innerText = 'Manual Rotate';
  });

  controls.addEventListener( 'rotateend', function () {
    controllerEl.innerText = controllerDefaultText;
  });
}

animate();
