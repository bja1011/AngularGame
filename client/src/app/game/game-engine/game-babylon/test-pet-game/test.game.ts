import { MyGame } from '../classes/MyGame.class';
import { GameService } from '../../../services/game.service';

export class TestGame extends MyGame {
  constructor(gameService: GameService) {
    const canvas = 'bjs-game';
    super(gameService, canvas);
    this.gameService = gameService;
  }
}
