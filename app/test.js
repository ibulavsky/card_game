let map = {
  object1: { sequences: [], players: [1,4,7,10] },
  object2: { sequences: [], players: [2,5,8,11] },
  object3: { sequences: [], players: [3,6,9,12] },
};

let i = 0;
let j = 0;
function getElementsFromMap(map) {
  const values = Object.values(map);
  const value = values[i].players[j]
  i++
  if (i >= values.length) {
    i = 0;
    j++;
    if(j>= values[0].players.length){
      j=0
    }
  }
  return value;
}




