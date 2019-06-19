import { MyScene } from '../../classes/MyScene.class';
import * as B from 'babylonjs';
import cannon from 'cannon';
import { GameService } from '../../../../services/game.service';
import { takeWhile } from 'rxjs/operators';
import { Scene } from 'babylonjs';
import 'babylonjs-loaders';
import PointLight = BABYLON.PointLight;

export class MainScene extends MyScene {
  private camera: B.FollowCamera;
  private light: B.Light;

  shadowGenerator: B.ShadowGenerator;

  private player: B.Mesh;

  destroyed = false;

  constructor(engine: B.Engine, gameService: GameService) {
    super(engine, gameService);

    this.setCamera();
    this.setLigning();
    this.createObjects();

    this.setPhysics();

    this.enablePostProcess();
  }

  setCamera() {
    this.camera = new B.FollowCamera('camera1', new B.Vector3(0, 5, 10), this);
    this.camera.heightOffset = 5;
    this.camera.rotationOffset = 0;
    this.camera.cameraAcceleration = 0.005;
    this.camera.maxCameraSpeed = 10;

    //   this.camera.mode = FollowCamera.ORTHOGRAPHIC_CAMERA;
    //   this.camera.orthoTop = 15;
    //   this.camera.orthoBottom = -15;
    //   this.camera.orthoLeft = -15;
    //   this.camera.orthoRight = 15;
  }

  setLigning() {

    const pointLight = new B.PointLight('l', new B.Vector3(3, 3, 0), this);
    pointLight.shadowEnabled = true;
    // pointLight.intensity = 10;
    this.shadowGenerator = new B.ShadowGenerator(1024, pointLight);

    this.light = new B.HemisphericLight('light1', new B.Vector3(0, 5, 0), this);
  }

  setInput(player: B.Mesh) {
    const inputMap = {};
    this.actionManager = new B.ActionManager(this);
    this.actionManager.registerAction(new B.ExecuteCodeAction(B.ActionManager.OnKeyDownTrigger,
      (evt) => {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
      })
    );
    this.actionManager.registerAction(new B.ExecuteCodeAction(B.ActionManager.OnKeyUpTrigger,
      (evt) => {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
      })
    );
  }

  setPhysics() {
    const gravityVector = new B.Vector3(0, -9.81, 0);
    const physicsPlugin = new B.CannonJSPlugin(true, 10, cannon);
    this.enablePhysics(gravityVector, physicsPlugin);
  }

  private createObjects() {

    BABYLON.SceneLoader.ImportMesh('', '', 'assets/3d/jelly-world.glb', this as any, (meshes) => {
      meshes.forEach(mesh => mesh.receiveShadows = true);
      console.log(meshes);

      this.player = B.MeshBuilder.CreateSphere('player', {diameter: 2, segments: 12}, this);
      this.player.position.y = 1;

      this.player.material = new B.StandardMaterial('player', this);
      this.player.material['diffuseColor'] = new B.Color3(1, 1, 1);

      this.shadowGenerator.getShadowMap().renderList.push(this.player);

      // const ground = B.MeshBuilder.CreateGround('ground', {width: 60, height: 60, subdivisions: 2}, this);
      // ground.position.y = 0.2;
      // ground.receiveShadows = true;

      this.setInput(this.player);
      this.camera.lockedTarget = this.player;

      // Ground
      // ground.material = new B.StandardMaterial('ground', this);
      // ground.material['diffuseTexture'] = new B.Texture('textures/amiga.jpg', this);
      // ground.material['diffuseTexture'].uScale = 3;
      // ground.material['diffuseTexture'].vScale = 3;

      this.onDisposeObservable.add(() => {
        this.destroyed = true;
      });

      this.gameService.gameEmitter
        .pipe(
          takeWhile(() => !this.destroyed)
        )
        .subscribe((event) => {
          switch (event.name) {
            case 'setFace':
              break;
            case 'setBody':
              this.player.material['diffuseColor'] = new B.Color3(Math.random(), Math.random(), Math.random());
              this.player.scaling.setAll(0.8 + Math.random() * 0.5);
              break;
          }
        });
    });
  }

  enablePostProcess() {
    const ssaoRatio = {
      ssaoRatio: 0.5,
      combineRatio: 1.0
    };

    const ssao = new BABYLON.SSAORenderingPipeline('ssao', this as any, ssaoRatio);
    ssao.fallOff = 0.000001;
    ssao.area = 1;
    ssao.radius = 0.0001;
    ssao.totalStrength = 1.0;
    ssao.base = 0.5;

    this.postProcessRenderPipelineManager.attachCamerasToRenderPipeline('ssao', this.camera);
  }
}
