module.exports = { endHorizontal : ({loc, letter, size, board}) => {
    let index = 1;
    let count = 1;
    let winSquares = [{x: loc.x, y: loc.y}];
    while (index <= 4 && loc.y + index < size.width) {
      if (board[loc.x][loc.y + index] === letter){
        count++;
        winSquares.push({x: loc.x, y: loc.y + index})
      }
      else break;
      index++;
    }
    index = 1;
    while (index <= 4 && loc.y - index >= 0) {
      if (board[loc.x][loc.y - index] === letter){
        count++;
        winSquares.push({x: loc.x, y: loc.y - index})
      }
      else break;
      index++;
    }
    return count >= 5 ? winSquares : false ;
},
endVertical : ({loc, letter, size, board}) => {
    let index = 1;
    let count = 1;
    let winSquares = [{x: loc.x, y: loc.y}];
    while (index <= 4 && loc.x + index < size.height) {
      if (board[loc.x + index][loc.y] === letter){
        count++;
        winSquares.push({x: loc.x + index, y: loc.y})
      }
      else break;
      index++;
    }
    index = 1;
    while (index <= 4 && loc.x - index >= 0) {
      if (board[loc.x - index][loc.y] === letter){
        count++;
        winSquares.push({x: loc.x - index, y: loc.y})
      }
      else break;
      index++;
    }
    return count >= 5 ? winSquares : false ;
},
endMainDiagonal : ({loc, letter, size, board}) => {
    let index = 1;
    let count = 1;
    let winSquares = [{y: loc.y, x: loc.x}];

    while (index <= 4 && loc.x + index < size.height && loc.y + index < size.width) {
      if (board[loc.x + index][loc.y + index] === letter){
        count++;
        winSquares.push({x: loc.x + index, y: loc.y + index})
      }
      else break;
      index++;
    }
    index = 1;
    while (index <= 4 && loc.x - index >= 0 && loc.y - index >= 0) {
      if (board[loc.x - index][loc.y - index] === letter){
        winSquares.push({x: loc.x - index, y: loc.y - index})
        count++;
      }
      else break;
      index++;
    }
    return count >= 5 ? winSquares : false ;
},
endAntiDiagonal : ({loc, letter, size, board}) => {
    let index = 1;
    let count = 1;
    let winSquares = [{y: loc.y, x: loc.x}];

    while (index <= 4 && loc.x - index >= 0 && loc.y + index < size.width) {
        if (board[loc.x - index][loc.y + index] === letter){
            count++;
            winSquares.push({x: loc.x - index, y: loc.y + index})
        }
        else break;
            index++;
    }
    index = 1;
    while (index <= 4 && loc.x + index < size.height && loc.y - index >= 0) {
        if (board[loc.x + index][loc.y - index] === letter){
            count++;
            winSquares.push({x: loc.x + index, y: loc.y - index})
        }
        else break;
            index++;
    }
    return count >= 5 ? winSquares : false ;
}
}