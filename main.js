let THREECAMERA = null;


// callback: launched if a face is detected or lost.
function detect_callback(faceIndex, isDetected) {
  if (isDetected) {
    console.log('INFO in detect_callback(): DETECTED');
  } else {
    console.log('INFO in detect_callback(): LOST');
  }
}


// build the 3D. called once when Jeeliz Face Filter is OK:
function init_threeScene(spec) {
  const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);

  // improve WebGLRenderer settings:
  threeStuffs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  threeStuffs.renderer.outputEncoding = THREE.sRGBEncoding;

  // CREATE THE GLASSES AND ADD THEM
  const r = JeelizThreeGlassesCreator({
    envMapURL: "envMap.jpg",
    frameMeshURL: "models3D/glassesFramesBranchesBent.json",
    lensesMeshURL: "models3D/glassesLenses.json",
    occluderURL: "models3D/face.json"
  });



  // vertical offset:
  const dy = 0.07;

  // create and add the occluder:
  r.occluder.rotation.set(0.3, 0, 0);
  r.occluder.position.set(0, 0.03 + dy, -0.04);
  r.occluder.scale.multiplyScalar(0.0084);
  threeStuffs.faceObject.add(r.occluder);




  // create and add the glasses mesh:
  const threeGlasses = r.glasses;
  //threeGlasses.rotation.set(-0.15,0,0); / /X neg -> rotate branches down
  threeGlasses.position.set(0, dy, 0.4);
  threeGlasses.scale.multiplyScalar(0.006);
  threeStuffs.faceObject.add(threeGlasses);

  const loaderCloud = new THREE.BufferGeometryLoader()

  loaderCloud.load(
    'models3D/cloud.json',
    (geometry) => {
      const mat = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('cloud.png'),
        shininess: 2,
        specular: 0xffffff,
        opacity: 0.7,
        transparent: true
      });

      // We create our first Cloud, scale and position it
      CLOUDMESH = new THREE.Mesh(geometry, mat);
      CLOUDMESH.scale.multiplyScalar(0.4);
      CLOUDMESH.scale.y = CLOUDMESH.scale.y * 0.5;
      CLOUDMESH.position.setY(0.85);
      CLOUDMESH.frustumCulled = false;
      CLOUDMESH.renderOrder = 10000;

      // CREATE OUR PARTICLE MATERIAL
      let PARTICLESOBJ3D = new THREE.Object3D();

      CLOUDOBJ3D = new THREE.Object3D();
      CLOUDOBJ3D.add(CLOUDMESH);

      threeStuffs.faceObject.add(CLOUDOBJ3D)
    }
  );


  // add a debug cube:
  const sc = 0.3;
  const cubeMat = new THREE.MeshStandardMaterial({
    color: 0x00ffcc,
    metalness: 0.3,
    roughness: 0.4
  });
  
  const debugCube = new THREE.Mesh(new THREE.BoxGeometry(sc, sc, sc), cubeMat);
  debugCube.position.set(0, 0.8, 0); // optional: lift it up a bit
  threeStuffs.faceObject.add(debugCube);
  
  // CREATE THE CAMERA:
  THREECAMERA = JeelizThreeHelper.create_camera();
} // end init_threeScene()


// entry point:
function main() {
  JeelizResizer.size_canvas({
    canvasId: 'jeeFaceFilterCanvas',
    callback: function (isError, bestVideoSettings) {
      init_faceFilter(bestVideoSettings);
    }
  })
}


function init_faceFilter(videoSettings) {
  JEELIZFACEFILTER.init({
    followZRot: true,
    canvasId: 'jeeFaceFilterCanvas',
    NNCPath: '../../../neuralNets/', // path of NN_DEFAULT.json file
    maxFacesDetected: 1,
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log('AN ERROR HAPPENS. ERR =', errCode);
        return;
      }

      console.log('INFO: JEELIZFACEFILTER IS READY');
      init_threeScene(spec);
    },

    // called at each render iteration (drawing loop):
    callbackTrack: function (detectState) {
      JeelizThreeHelper.render(detectState, THREECAMERA);
    }
  }); //end JEELIZFACEFILTER.init call
}


window.addEventListener('load', main);