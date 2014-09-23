/**
 * -------
 * threeVR (https://github.com/richtr/threeVR)
 * -------
 *
 * W3C Device Orientation control (http://www.w3.org/TR/orientation-event/)
 * with manual user drag (rotate) and pinch (zoom) override handling
 *
 * Author: Rich Tibbett (http://github.com/richtr)
 * License: The MIT License
 *
**/







var DeviceOrientationController = function ( object, domElement ) {


// === Kalman ===
// Kalman filter for Javascript
// Copyright (c) 2012 Itamar Weiss
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

var Kalman = {
  version: '0.0.1'
};

KalmanModel = (function(){

  function KalmanModel(x_0,P_0,F_k,Q_k){
    this.x_k  = x_0;
    this.P_k  = P_0;
    this.F_k  = F_k;
    this.Q_k  = Q_k;
  }
  
  KalmanModel.prototype.update =  function(o){
    this.I = Matrix.I(this.P_k.rows());
    //init
    this.x_k_ = this.x_k;
    this.P_k_ = this.P_k;

    //Predict
    this.x_k_k_ = this.F_k.x(this.x_k_);
    this.P_k_k_ = this.F_k.x(this.P_k_.x(this.F_k.transpose()));

    //update
    this.y_k = o.z_k.subtract(o.H_k.x(this.x_k_k_));//observation residual
    this.S_k = o.H_k.x(this.P_k_k_.x(o.H_k.transpose())).add(o.R_k);//residual covariance
    this.K_k = this.P_k_k_.x(o.H_k.transpose().x(this.S_k.inverse()));//Optimal Kalman gain
    this.x_k = this.x_k_k_.add(this.K_k.x(this.y_k));
    this.P_k = this.I.subtract(this.K_k.x(o.H_k)).x(this.P_k_k_);
  }
  
  return KalmanModel;
})();

KalmanObservation = (function(){

  function KalmanObservation(z_k,H_k,Q_k){
    this.z_k = z_k;//observation
    this.H_k = H_k;//observation model
    this.R_k = R_k;//observation noise covariance
  }
  
  return KalmanObservation;
})();


  //ADD KALMAN PROCESSING INSTANTIATION HERE

  var x_0 = $V([0,0,0]); //vector. Initial accelerometer values

  //P prior knowledge of state
  var P_0 = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
              ]); //identity matrix. Initial covariance. Set to 1
  var F_k = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
              ]); //identity matrix. How change to model is applied. Set to 1
  var Q_k = $M([
                [0,0,0],
                [0,0,0],
                [0,0,0]
              ]); //empty matrix. Noise in system is zero

  var KM = new KalmanModel(x_0,P_0,F_k,Q_k);

  var z_k = $V([0,0,0]); //Updated accelerometer values
  var H_k = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
              ]); //identity matrix. Describes relationship between model and observation
  var R_k = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
              ]); //2x Scalar matrix. Describes noise from sensor. Set to 2 to begin
  var KO = new KalmanObservation(z_k,H_k,R_k);


  this.object = object;
  this.element = domElement || document;

  this.freeze = true;

  this.useQuaternions = true; // use quaternions for orientation calculation by default

  this.deviceOrientation = {};
  this.screenOrientation = window.orientation || 0;

  // Manual rotate override components
  var startX = 0, startY = 0,
      currentX = 0, currentY = 0,
      scrollSpeedX, scrollSpeedY,
      tmpQuat = new THREE.Quaternion();

  var CONTROLLER_STATE = {
    AUTO: 0,
    MANUAL_ROTATE: 1
  };

  var appState = CONTROLLER_STATE.AUTO;

  var CONTROLLER_EVENT = {
    MANUAL_CONTROL:     'userinteraction', // userinteractionstart, userinteractionend
    ROTATE_CONTROL:     'rotate',          // rotatestart, rotateend
    SCREEN_ORIENTATION: 'orientationchange'
  };

  // Consistent Object Field-Of-View fix components
  var startClientHeight = window.innerHeight,
      startFOVFrustrumHeight = 2000 * Math.tan( THREE.Math.degToRad( ( this.object.fov || 75 ) / 2 ) ),
      relativeFOVFrustrumHeight, relativeVerticalFOV;

  var deviceQuat = new THREE.Quaternion();

  var fireEvent = function () {
    var eventData;

    return function ( name ) {
      eventData = arguments || {};

      eventData.type = name;
      eventData.target = this;

      this.dispatchEvent( eventData );
    }.bind( this );
  }.bind( this )();

  this.constrainObjectFOV = function () {
    relativeFOVFrustrumHeight = startFOVFrustrumHeight * ( window.innerHeight / startClientHeight );

    relativeVerticalFOV = THREE.Math.radToDeg( 2 * Math.atan( relativeFOVFrustrumHeight / 2000 ) );

    this.object.fov = relativeVerticalFOV;
  }.bind( this );

  this.onDeviceOrientationChange = function ( event ) {
    this.deviceOrientation = event;
  }.bind( this );

  this.onScreenOrientationChange = function () {
    this.screenOrientation = window.orientation || 0;

    fireEvent( CONTROLLER_EVENT.SCREEN_ORIENTATION );
  }.bind( this );

  var createQuaternion = function () {

    var finalQuaternion = new THREE.Quaternion();

    var deviceEuler = new THREE.Euler();

    var screenTransform = new THREE.Quaternion();

    var worldTransform = new THREE.Quaternion( - Math.sqrt(0.5), 0, 0, Math.sqrt(0.5) ); // - PI/2 around the x-axis

    var minusHalfAngle = 0;

    return function ( alpha, beta, gamma, screenOrientation ) {

      deviceEuler.set( beta, alpha, - gamma, 'YXZ' );

      finalQuaternion.setFromEuler( deviceEuler );

      minusHalfAngle = - screenOrientation / 2;

      screenTransform.set( 0, Math.sin( minusHalfAngle ), 0, Math.cos( minusHalfAngle ) );

      finalQuaternion.multiply( screenTransform );

      finalQuaternion.multiply( worldTransform );

      return finalQuaternion;

    }

  }();

  this.updateDeviceMove = function () {

    var alpha, beta, gamma, orient;

    var deviceMatrix;

    return function () {


     

      //$(".accelerometer").html(this.deviceOrientation.beta+", "+this.deviceOrientation.gamma+", "+this.deviceOrientation.alpha)
       

      alphaDeg = this.deviceOrientation.alpha - 180;
      betaDeg = this.deviceOrientation.beta;
      gammaDeg = this.deviceOrientation.gamma;

      //$(".correction").html(betaDeg+", "+gammaDeg+", "+alphaDeg);

      alpha  = THREE.Math.degToRad( alphaDeg || 0 );
      beta  = THREE.Math.degToRad( betaDeg || 0 );
      gamma  = THREE.Math.degToRad( gammaDeg || 0 );
      // alpha  = THREE.Math.degToRad( this.deviceOrientation.alpha || 0 ); // Z
      // beta   = THREE.Math.degToRad( this.deviceOrientation.beta  || 0 ); // X'
      // gamma  = THREE.Math.degToRad( this.deviceOrientation.gamma || 0 ); // Y''
      orient = THREE.Math.degToRad( this.screenOrientation       || 0 ); // O

      //$(".radians").html(beta+", "+gamma+", "+alpha);

      //when alpha channel moves above 360 it causes problems. 
      //if I could move it round so the view was actually in front would it solve this problem? 

      // only process non-zero 3-axis data
      if ( alpha !== 0 && beta !== 0 && gamma !== 0) {

        KO.z_k = $V([beta, gamma, alpha]); //vector to be new reading from x, y, z
        KM.update(KO);

        //$(".kalman").html(" x:" +KM.x_k.elements[0]+", y:" +KM.x_k.elements[1]+", z:" +KM.x_k.elements[2]);

        deviceQuat = createQuaternion( KM.x_k.elements[2], KM.x_k.elements[0], KM.x_k.elements[1], orient );

        if ( this.freeze ) return;

        //this.object.quaternion.slerp( deviceQuat, 0.07 ); // smoothing
        this.object.quaternion.copy( deviceQuat );

      }

    };

  }();

  this.update = function () {
    this.updateDeviceMove();
  };

  this.connect = function () {
    window.addEventListener( 'deviceorientation', this.onDeviceOrientationChange, false );
    window.addEventListener( 'orientationchange', this.onScreenOrientationChange, false );
    this.freeze = false;
  };

  this.disconnect = function () {
    this.freeze = true;
    window.removeEventListener( 'deviceorientation', this.onDeviceOrientationChange, false );
    window.removeEventListener( 'orientationchange', this.onScreenOrientationChange, false );
  };

};

DeviceOrientationController.prototype = Object.create( THREE.EventDispatcher.prototype );
