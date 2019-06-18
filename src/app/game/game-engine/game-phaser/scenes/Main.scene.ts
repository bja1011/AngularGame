import { MyScene } from '../classes/MyScene.class';
import { Jelly } from '../virtual-pet-game/jelly.class';
import { JellyBody, JellyFace } from '../virtual-pet-game/interfaces/jelly';
import { JELLY_ATLAS_NAME } from '../virtual-pet-game/constants';
import { filter } from 'rxjs/operators';

export class MainScene extends MyScene {

  jelly: Jelly;

  constructor(props) {
    super(props);
  }

  preload() {
    this.cameras.main.backgroundColor = new Phaser.Display.Color(140, 211, 247);
    this.load.atlas(JELLY_ATLAS_NAME, 'assets/jelly/jelly-atlas.png', 'assets/jelly/jelly-atlas.json');
  }

  create() {
    this.jelly = new Jelly(this, innerWidth / 2, innerHeight / 2);
    this.jelly.setBody(JellyBody.green);
    this.jelly.setFace(JellyFace.idle);
    this.jelly.setScale(0.6);

    this.cameras.main.startFollow(this.jelly);

    this.gameService.gameEmitter
      .pipe(
        filter(event => event.name === 'setFace')
      )
      .subscribe(event => {
        console.log(event.value);
        this.jelly.setFace(event.value);
      });

    this.gameService.gameEmitter
      .pipe(
        filter(event => event.name === 'setBody')
      )
      .subscribe(event => {
        console.log(event.value);
        this.jelly.setBody(event.value);
      });
  }
}
