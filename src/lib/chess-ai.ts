import { Chess } from 'chess.js';
import { AILevel } from '../types/game';

class ChessAI {
  private evaluateBoard(chess: Chess): number {
    const pieceValues: { [key: string]: number } = {
      'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900
    };

    let evaluation = 0;
    const board = chess.board();

    board.forEach(row => {
      row.forEach(square => {
        if (square) {
          const value = pieceValues[square.type.toLowerCase()];
          evaluation += square.color === 'w' ? value : -value;
        }
      });
    });

    return evaluation;
  }

  private minimax(chess: Chess, depth: number, maximizing: boolean, alpha: number = -Infinity, beta: number = Infinity): number {
    if (depth === 0 || chess.isGameOver()) {
      return this.evaluateBoard(chess);
    }

    const moves = chess.moves();
    
    if (maximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const evaluation = this.minimax(chess, depth - 1, false, alpha, beta);
        chess.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        chess.move(move);
        const evaluation = this.minimax(chess, depth - 1, true, alpha, beta);
        chess.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  getBestMove(chess: Chess, level: AILevel): string | null {
    const moves = chess.moves();
    if (moves.length === 0) return null;

    let depth: number;
    let randomness: number;

    switch (level) {
      case 'easy':
        depth = 1;
        randomness = 0.7;
        break;
      case 'medium':
        depth = 2;
        randomness = 0.3;
        break;
      case 'hard':
        depth = 3;
        randomness = 0.1;
        break;
      default:
        depth = 2;
        randomness = 0.3;
    }

    // Add some randomness for easier levels
    if (Math.random() < randomness) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    let bestMove = moves[0];
    let bestValue = -Infinity;

    for (const move of moves) {
      chess.move(move);
      const moveValue = this.minimax(chess, depth - 1, false);
      chess.undo();

      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }

    return bestMove;
  }
}

export const chessAI = new ChessAI();