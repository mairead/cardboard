/* global THREE, Leap */

var acc = {
  x:0,
  y:0,
  z:0
};

if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', getDeviceRotation, false);
}else{
  $(".accelerometer").html("NOT SUPPORTED")
}

//create 3D canvas - guess this is the ThreeJs stage setup
var container1, container2, scene1, scene2, renderer1, renderer2, camera1, camera2, light1, light2, loader1, loader2;
var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;

container1 = document.querySelector('.viewport-1');
container2 = document.querySelector('.viewport-2');

WIDTH = window.innerWidth/2;
HEIGHT = window.innerHeight/2;

var width = WIDTH;
var height = HEIGHT;

//set id for fingers once and assign bones
var fingers1 = [
  {id: 0, pointable: {}}, //middle
  {id: 0, pointable: {}}, //ring
  {id: 0, pointable: {}}, //index
  {id: 0, pointable: {}}, //little
  {id: 0, pointable: {}} //thumb
];

var fingers2 = [
  {id: 0, pointable: {}}, //middle
  {id: 0, pointable: {}}, //ring
  {id: 0, pointable: {}}, //index
  {id: 0, pointable: {}}, //little
  {id: 0, pointable: {}} //thumb
];
var fingersAssigned = false; //flag to determine if all fingers have been detected and assigned an ID


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

//gridHelper.rotation = new THREE.Euler( 15, 0, 0 );

scene1.add( gridHelper1 );
scene2.add( gridHelper2 );


var hand1, hand2;

//Instantiate new Mesh object by loading Blender JSON export
var loader1 = new THREE.JSONLoader();
var loader2 = new THREE.JSONLoader();

//load Hand model with ThreeJS Loader
loader1.load('javascripts/riggedhand.js', function (geometry, materials) {
  var material;

  hand1 = new THREE.SkinnedMesh(
    geometry,
    new THREE.MeshFaceMaterial(materials)
  );

  material = hand1.material.materials;

  for (var i = 0; i < materials.length; i++) {
    var mat = materials[i];

    mat.skinning = true;
  }

  //add bones from Hand into fingers array

  //middle
  fingers1[0].mainBone = hand1.bones[9];
  fingers1[0].phalanges = [hand1.bones[10], hand1.bones[11]];

  //ring
  fingers1[1].mainBone = hand1.bones[5];
  fingers1[1].phalanges = [hand1.bones[6], hand1.bones[7]];

  //index
  fingers1[2].mainBone = hand1.bones[13];
  fingers1[2].phalanges = [hand1.bones[14], hand1.bones[15]];

  //little
  fingers1[3].mainBone = hand1.bones[17];
  fingers1[3].phalanges = [hand1.bones[18], hand1.bones[19]];

  //thumb
  fingers1[4].mainBone = hand1.bones[2];
  fingers1[4].phalanges = [hand1.bones[3]];

  scene1.add(hand1);

  render();


  // Init Leap 
  Leap.loop(function (frame) {
    animate(frame, hand1); // pass frame and hand model
  });
});


//load Hand model with ThreeJS Loader
loader2.load('javascripts/riggedhand.js', function (geometry, materials) {
  var material;

  hand2 = new THREE.SkinnedMesh(
    geometry,
    new THREE.MeshFaceMaterial(materials)
  );

  material = hand2.material.materials;

  for (var i = 0; i < materials.length; i++) {
    var mat = materials[i];

    mat.skinning = true;
  }

  //add bones from Hand into fingers array

  //middle
  fingers2[0].mainBone = hand2.bones[9];
  fingers2[0].phalanges = [hand2.bones[10], hand2.bones[11]];

  //ring
  fingers2[1].mainBone = hand2.bones[5];
  fingers2[1].phalanges = [hand2.bones[6], hand2.bones[7]];

  //index
  fingers2[2].mainBone = hand2.bones[13];
  fingers2[2].phalanges = [hand2.bones[14], hand2.bones[15]];

  //little
  fingers2[3].mainBone = hand2.bones[17];
  fingers2[3].phalanges = [hand2.bones[18], hand2.bones[19]];

  //thumb
  fingers2[4].mainBone = hand2.bones[2];
  fingers2[4].phalanges = [hand2.bones[3]];

  scene2.add(hand2);

  render();


  // Init Leap 
  Leap.loop(function (frame) {
    animate(frame, hand2); // pass frame and hand model
  });
});

//animate is called after the Hand model has been loaded by ThreeJs
//This is recalled with each Leap frame receieved with the Leap.loop
//This contains all the positioning code for moving the Hand mesh around
function animate (frame, handMesh) {


  if (frame.hands.length > 0) {


    //set IDs at beginning for fingers
    if(!fingersAssigned){
      //if all 5 pointables are available
      if (frame.pointables.length === 5) {
        //assign the current ID to the fingers array
        for (var i = frame.pointables.length - 1; i >= 0; i--) {
          fingers1[i].id = frame.pointables[i].id;
          fingers2[i].id = frame.pointables[i].id;
          //console.log("ASSIGNED ID: ", fingers[i].id)
        };
        fingersAssigned = true; //set flag to prevent IDs being reassigned
      }
    }

    //Setting palm position and rotation to position of hand mesh on screen
    var hand = frame.hands[0];

    var position = leapToScene( frame , hand.palmPosition );//ensures hand appears within Leap Js interaction box
    handMesh.position = position; // apply position

    var rotation = {
      z: hand.pitch(),
      y: hand.yaw(),
      x: hand.roll()
    }

    //Rotate the main bone of the hand and palm around the hand rotation
    handMesh.bones[0].rotation.set(rotation.x, rotation.y, rotation.z); //pitch is in reverse. The user's position is in the negative z axis

    //For each finger in the hand set the rotation of the main finger bone, and the smaller phalanx bones

    for (var i = fingers1.length - 1; i >= 0; i--) {
      //console.log("FINGER ID: ", fingers[i].id)

      fingers1[i].fingerVisible = false;
      fingers2[i].fingerVisible = false;

      for (var j = frame.pointables.length - 1; j >= 0; j--) {
         //console.log("POINTABLE ID: ", frame.pointables[j].id)

         if (fingers1[i].id === frame.pointables[j].id) {

          //console.log("FINGER FOUND");

          fingers1[i].fingerVisible = true; //finger ID has been found and therefore the finger is visible
          fingers2[i].fingerVisible = true;
          //push current pointable item into fingers array
          fingers1[i].pointable = frame.pointables[j]
          fingers2[i].pointable = frame.pointables[j]

          rotateBones(fingers1[i]);
          rotateBones(fingers2[i]);
         }
      }
    }


       function rotationCtrl(dir){
        // make sure fingers won't go into weird position. T
        //I think this doctors the direction object for each rotation to prevent large shifts
          for (var i = 0, length = dir.length; i < length; i++) {
            if (dir[i] >= 0.8) {
              dir[i] = 0.8;
            }
            
          }
        return dir;
      }
        
      function rotateBones(finger){
        //treat direction value before applying rotation
        var fingerDir = rotationCtrl(finger.pointable.direction);

        //TODO: Need to add more fine tuning to Direction constraint to prevent them bending backwards but without limiting forward or side movement

        //var fingerDir = finger.pointable.direction;

        // apply rotation to the main bone
        finger.mainBone.rotation.set(0, -fingerDir[0], fingerDir[1]); 

        // apply rotation to phalanx bones
        for (var i = 0, length = finger.phalanges.length; i < length; i++) {
          var phalange = finger.phalanges[i];
          phalange.rotation.set(0, 0, fingerDir[1]);
        }
      }

      //Update finger rotation
      // for (var i = fingers.length - 1; i >= 0; i--) {
      //   rotateBones(fingers[i]);
      // };
    //}

  }
}

//Interaction Box conversion method to find central co-ordinates for interacting with stage. 
//Does it need third iteration for z co-ordinates? Is Z axis going to be positive or negative
function leapToScene(frame, leapPos){
  var iBox = frame.interactionBox;

	var left = iBox.center[0] - iBox.size[0]/2;
	var top = iBox.center[1] + iBox.size[1]/2;
  var back = iBox.center[2] + iBox.size[2]/2;

	var x = leapPos[2] - left;
	var y = leapPos[1] - top;
  var z = leapPos[0] - back;

  //why are x and z axis swapped round from the Hand position? This is weird.

	x /= iBox.size[0];
	y /= iBox.size[1];
  z /= iBox.size[2];

	// x *= width;
	// y *= height;
 //  z *= 500; //what is depth of interaction box as relates to screen size?


//this is fudging the interaction box positions to map to center of screen
//this is partly to do with the camera positioning. its not flat to stage.
  x *= 10;
  y *= 10;
  z *= 10;

  x += 10;
  y += 10;
  z += 10;

	return {x: x ,y: y ,z: -z};

  //z seems to be working in the x axis and vice versa? 
  //Why does z require the negative value here?
}

// //render method is called by the animate function to render each frame, 
// //with requestAnimationFrame
// function render() {



//   renderer1.render(scene1, camera1);
//   renderer2.render(scene2, camera2);

//   requestAnimationFrame(render);
// }


// Add DeviceOrientation Controls
controls1 = new DeviceOrientationController( camera1, renderer1.domElement );
controls1.connect();

setupControllerEventHandlers( controls1 );


controls2 = new DeviceOrientationController( camera2, renderer2.domElement );
controls2.connect();

setupControllerEventHandlers( controls2 );


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

// Render loop
function render() {
  controls1.update();
  controls2.update();
  renderer1.render( scene1, camera1 );
  renderer2.render( scene2, camera2 );
  requestAnimationFrame(render );
}

render()




// define connection settings
var leap = new Leap.Controller({
  host: '0.0.0.0',
  port: 6437
});

// connect controller
leap.connect();

function getDeviceRotation(e){
  $(".accelerometer").html(e.alpha+", "+e.beta+", "+e.gamma)
}
