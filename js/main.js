const vertexShader = `
attribute vec3 position;

void main() {
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float xScale;
uniform float yScale;
uniform float distortion;

void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    
    float d = length(p) * distortion;
    
    float rx = p.x * (1.0 + d);
    float gx = p.x;
    float bx = p.x * (1.0 - d);

    float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
    float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
    float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
    
    gl_FragColor = vec4(r, g, b, 1.0);
}
`;

class Stage {
    constructor() {
        this.renderParam = {
            clearColor: 0x666666,
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.cameraParam = {
            left: -1,
            right: 1,
            top: 1,
            bottom: 1,
            near: 0,
            far: -1
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.geometry = null;
        this.material = null;
        this.mesh = null;

        this.isInitialized = false;
    }

    init() {
        this._setScene();
        this._setRender();
        this._setCamera();

        this.isInitialized = true;
    }

    _setScene() {
        this.scene = new THREE.Scene();
    }

    _setRender() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("webgl-canvas")
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(new THREE.Color(this.renderParam.clearColor));
        this.renderer.setSize(this.renderParam.width, this.renderParam.height);
    }

    _setCamera() {
        if (!this.isInitialized) {
            this.camera = new THREE.OrthographicCamera(
                this.cameraParam.left,
                this.cameraParam.right,
                this.cameraParam.top,
                this.cameraParam.bottom,
                this.cameraParam.near,
                this.cameraParam.far
            );
        }

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        this.camera.aspect = windowWidth / windowHeight;

        this.camera.updateProjectionMatrix();
        this.renderer.setSize(windowWidth, windowHeight);
    }

    _render() {
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this._setCamera();
    }

    onRaf() {
        this._render();
    }
}

class Mesh {
    constructor(stage) {
        this.canvas = document.getElementById("webgl-canvas");
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;

        this.uniforms = {
            resolution: { type: "v2", value: [this.canvasWidth, this.canvasHeight] },
            time: { type: "f", value: 0.0 },
            xScale: { type: "f", value: 1.0 },
            yScale: { type: "f", value: 0.5 },
            distortion: { type: "f", value: 0.050 }
        };

        this.stage = stage;

        this.mesh = null;

        this.xScale = 1.0;
        this.yScale = 0.5;
        this.distortion = 0.050;
    }

    init() {
        this._setMesh();
    }

    _setMesh() {
        const position = [
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            -1.0, 1.0, 0.0,
            1.0, -1.0, 0.0,
            -1.0, 1.0, 0.0,
            1.0, 1.0, 0.0
        ];

        const positions = new THREE.BufferAttribute(new Float32Array(position), 3);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", positions);

        const material = new THREE.RawShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: this.uniforms,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, material);

        this.stage.scene.add(this.mesh);
    }

    _render() {
        this.uniforms.time.value += 0.01;
    }

    onRaf() {
        this._render();
    }
}

(() => {
    const stage = new Stage();

    stage.init();

    const mesh = new Mesh(stage);

    mesh.init();

    window.addEventListener("resize", () => {
        stage.onResize();
    });

    const _raf = () => {
        window.requestAnimationFrame(() => {
            stage.onRaf();
            mesh.onRaf();

            _raf();
        });
    };

    _raf();
})();

function navigateTo(url) {
    setTimeout(() => {
        window.location.href = url;
    }, 250); 
}

document.addEventListener('DOMContentLoaded', (event) => {
    const aboutCard = document.querySelector('.about-card-photo');
    if (aboutCard) {
        aboutCard.addEventListener('click', () => {
            aboutCard.classList.add('animate-click');
            setTimeout(() => {
                aboutCard.classList.remove('animate-click');
            }, 300);
        });
    }

    if (window.location.pathname.endsWith('index.html') && !localStorage.getItem('alertShown')) {
        document.getElementById('custom-alert').classList.remove('hidden');
        localStorage.setItem('alertShown', 'true');
    }

    document.getElementById('alert-close-btn').addEventListener('click', () => {
        document.getElementById('custom-alert').classList.add('hidden');
    });
    document.getElementById('download-cv-btn').addEventListener('click', function() {
        const link = document.createElement('a');
        link.href = '/cv/Farlyhaydy H.Djalil-CV.pdf';
        link.download = 'Farly_CV.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    document.getElementById('contact-btn').addEventListener('click', function() {
        alert('Hubungi no +62-888-888-8888 untuk lebih lanjut');
    });
    
});
