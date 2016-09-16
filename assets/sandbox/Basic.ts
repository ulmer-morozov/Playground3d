var scene = new THREE.Scene();
var zoom = 2;
var width = window.innerWidth;
var height = window.innerHeight;
var ratio = width / height;
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / height, 0.1, 1000);
// camera.position.set(0, 0, 270);
camera.position.set(0, 0, 320);

// camera.lookAt(scene.position);

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(zoom * width, zoom * height, false);
// renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);

// Управление мышкой
var controls = new THREE.OrbitControls(camera, renderer.domElement);

// Материалы
var normalMaterial = new THREE.MeshNormalMaterial({ wireframe: true });
var normalMaterial2 = new THREE.MeshNormalMaterial({ wireframe: false });
var wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ee00, wireframe: true, transparent: true });
var multiMaterial = [normalMaterial, wireframeMaterial];

var phongMaterial = new THREE.MeshPhongMaterial({
    color: 0xBCC6CC,
    specular: 0x050505,
    shininess: 100,
    shading: THREE.SmoothShading
});


// Содержимое сцены
var geometry = new THREE.BoxGeometry(50, 50, 50);

// Материалы

var vertexShaderText = document.getElementById("vertexShader").innerHTML;
var fragmentShaderText = document.getElementById("fragmentShader").innerHTML;

//
let customMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShaderText,
    fragmentShader: fragmentShaderText,
    transparent: true
});

// свет

var bluePoint = new THREE.PointLight(0xff3300, 3, 300);
bluePoint.position.set(-10, 0, 360)
scene.add(bluePoint);
scene.add(new THREE.PointLightHelper(bluePoint, 3));

var redPoint = new THREE.PointLight(0x0033ff, 3, 300);
redPoint.position.set(-100, 0, 360)
scene.add(redPoint);
scene.add(new THREE.PointLightHelper(redPoint, 3));

// текст

var client = new XMLHttpRequest();
client.open('GET', 'assets/threejs/PT_Sans_Regular.json');
client.onload = function() {
    let font = new THREE.Font(JSON.parse(client.responseText));
    let parameters: THREE.TextGeometryParameters = {
        font: font,
        size: 25,
        height: 2,
        curveSegments: 10,
        bevelEnabled: true,
        bevelThickness: 0,
        bevelSize: 1.1
    };

    let textGeometry = new THREE.TextGeometry("Javascript", parameters)

    let text = new THREE.Mesh(textGeometry, phongMaterial);
    text.rotation.y = 0.1;
    text.position.set(-130, 0, 200);
    scene.add(text);

}
client.send();




// сфера
var sphereGeometry = new THREE.SphereGeometry(50, 32, 16);
var sphere = new THREE.Mesh(sphereGeometry, normalMaterial);
sphere.position.set(0, 0, -100);
scene.add(sphere);

const segments = 200;
const radius = 8;
const radiusSegments = 10;
const pathClosed = true;

var extrudePath: any = new THREE.CatmullRomCurve3([
    new THREE.Vector3(100, 100, 60),
    new THREE.Vector3(-60, 100, 60),
    new THREE.Vector3(-90, 10, 100),
    new THREE.Vector3(20, 30, 200),
    new THREE.Vector3(100, 20, 150),
    new THREE.Vector3(200, 60, 200),
    new THREE.Vector3(250, 80, 120),
    new THREE.Vector3(250, 100, 60),
    new THREE.Vector3(100, 100, 60),
]);

function createTubeGeometry(time: number): THREE.TubeGeometry {
    return new THREE.TubeGeometry(extrudePath, segments, radius, radiusSegments, pathClosed, (u: number) => (1.1 * Math.sin(25.2 * u + 0.01 * time) + 2));
}

function createTubeMesh(tubeGeometry: THREE.TubeGeometry): THREE.Object3D {
    let mesh = THREE.SceneUtils.createMultiMaterialObject(tubeGeometry, [
        normalMaterial,
        // wireframeMaterial
    ]);
    return mesh;
}

var tube: THREE.TubeGeometry = createTubeGeometry(0);
var tubeMesh: THREE.Object3D = createTubeMesh(tube);

function drawTube(time: number, rotation?: THREE.Euler) {
    scene.remove(tubeMesh);

    tube = createTubeGeometry(time);
    tubeMesh = createTubeMesh(tube);

    if (rotation != undefined)
        tubeMesh.setRotationFromEuler(rotation);

    scene.add(tubeMesh);
}

var sign = 1;
var time = 1;
var sphereAsscAmp = 200;

// CONTROLS
var deltaRotation: THREE.Vector3;

function calcCamCurveRotationDifference() {
    let deltaXRotation = camera.rotation.x - tubeMesh.rotation.x;
    let deltaYRotation = camera.rotation.y - tubeMesh.rotation.y;
    let deltaZRotation = camera.rotation.z - tubeMesh.rotation.z;

    deltaRotation = new THREE.Vector3(deltaXRotation, deltaYRotation, deltaZRotation);
}

calcCamCurveRotationDifference();


var render = (): void => {
    requestAnimationFrame(render);

    if (sphere.position.x >= sphereAsscAmp || sphere.position.x <= -sphereAsscAmp) {
        sign = -sign;
    }
    sphere.position.add(new THREE.Vector3(sign * 0.1, 0, 0));

    calcCamCurveRotationDifference();
    document.getElementById("curvePosition").textContent = JSON.stringify(deltaRotation);

    var customRotation = { "x": 0, "y": 0, "z": 0 };
    customRotation = { "x": -0.020145235344748963, "y": 1.0900943370894416, "z": 0.3960261187682121 };

    var eulerRotation = new THREE.Euler(-customRotation.x, -customRotation.y, -customRotation.z);

    drawTube(time, eulerRotation);
    renderer.render(scene, camera);

    time++;
}

render();
