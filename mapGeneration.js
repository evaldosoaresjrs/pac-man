function countAdjacents(i, j){
    return l[i-1][j-1] + l[i-1][j] + l[i-1][j+1] + l[i][j-1] + l[i][j+1] + l[i+1][j-1] + l[i+1][j] + l[i+1][j+1]
}

let l = []
let wLength;
let corner;
let middle1;
let middle2;


function generateMap(h = 7, w = 10, symmetrical = true){
    h = h < 7 ? 7 : h;
    w = w < 10 ? 10 : w;

    let newWidth = symmetrical ? Math.ceil(w / 2) : w

    l = []

    // matrix generation
    for (let i = 0; i < h; i++) {
        if (i == 0 || i == h-1){
            l.push(Array(newWidth).fill(1))
        }
        else {
            let row = Array(newWidth).fill(0)

            row[0] = 1
            
            if (!symmetrical)
                row[row.length-1] = 1

            l.push(row)
        }
    }

    // random squares
    for(let i = 1; i < l.length-1; i++){
        wLength = symmetrical ? l[0].length : l[0].length-1
        for (let j = 1; j < wLength ; j++){
            l[i][j] = Math.floor(Math.random() * 2)
        }
    }

    // adjust horizontal borders
    for(let i = 1; i < l.length-1; i++){
        for (let j = 1; j < l[0].length-1; j++){
            if ((i == 1 || i == l.length-2) && (l[i][j-1] == 1)){
                l[i][j] = 0
            }
        }
    }
    
    // adjust vertical borders
    for (let j = 1; j < l[0].length-1; j++){
        for(let i = 1; i < l.length-1; i++){
            if ((j == 1 || (!symmetrical && j == l[0].length-2)) && (l[i-1][j] == 1)){
                l[i][j] = 0
            }
        }
    }

    // remove "stair treads"
    let iregularCorners = 1
    let lastIregularCorners = 0

    while(iregularCorners != lastIregularCorners){
        lastIregularCorners = iregularCorners
        iregularCorners = 0
        for(let i = 2; i < l.length-2; i++){
            for (let j = 2; j < l[0].length-2; j++){
                if(l[i][j]){

                    // check cell corners
                    let cornersSum = l[i-1][j-1] + l[i-1][j+1] + l[i+1][j-1] + l[i+1][j+1]
                    
                    if (cornersSum > 2){
                        /*  
                            VARIATIONS OF:

                            |||||   |||||       |||||   |||||
                            |   |||||   |  or   |   |||||   |
                            |||||   |||||       |||||   |   |

                            RESULT:

                            |||||   |||||       |||||   |||||
                            |   |   |   |  or   |   |   |   |
                            |||||   |||||       |||||   |   |
                        */

                        l[i][j] = 0
                        iregularCorners++
                    }
                    else if (cornersSum == 1){
                        /*  
                            VARIATIONS OF:

                            |||||   |   |
                            |   |||||   |
                            |   |   |   |

                            RESULT:

                            |||||||||   |       |||||   |   |       |   |   |   |       |   |||||   |
                            |   |   |   |  or   |||||   |   |   or  |||||||||   |   or  |   |||||   |
                            |   |   |   |       |   |   |   |       |   |   |   |       |   |   |   |
                        */
                        corner = {}
                        middle1 = {}
                        middle2 = {}

                        // define random adjacent position to swap cells
                        let pos = Math.floor(Math.random() * 2)

                        if (l[i-1][j-1]){
                            corner.x = i-1
                            corner.y = j-1

                            middle1.x = i-1
                            middle1.y = j

                            middle2.x = i
                            middle2.y = j-1
                        }
                        else if (l[i-1][j+1]){
                            corner.x = i-1
                            corner.y = j+1

                            middle1.x = i-1
                            middle1.y = j

                            middle2.x = i
                            middle2.y = j+1
                        }
                        else if (l[i+1][j-1]){
                            corner.x = i+1
                            corner.y = j-1

                            middle1.x = i
                            middle1.y = j-1

                            middle2.x = i+1
                            middle2.y = j
                        }
                        else{
                            corner.x = i+1
                            corner.y = j+1

                            middle1.x = i
                            middle1.y = j+1

                            middle2.x = i+1
                            middle2.y = j
                        }

                        if (!(l[middle1.x][middle1.y] || l[middle2.x][middle2.y])){
                            if (countAdjacents(i, j) > countAdjacents(corner.x, corner.y)){
                                if (pos){
                                    l[middle1.x][middle1.y] = 1
                                    l[corner.x][corner.y] = 0
                                }
                                else{
                                    l[middle2.x][middle2.y] = 1
                                    l[corner.x][corner.y] = 0
                                }
                            }
                            else{
                                if (pos){
                                    l[middle1.x][middle1.y] = 1
                                    l[i][j] = 0
                                }
                                else{
                                    l[middle2.x][middle2.y] = 1
                                    l[i][j] = 0
                                }
                            }
                            iregularCorners++
                        }
                        else if (l[middle1.x][middle1.y] && l[middle2.x][middle2.y]){
                            if (pos){
                                l[middle1.x][middle1.y] = 0
                            }
                            else{
                                l[middle2.x][middle2.y] = 0
                            }
                            iregularCorners++
                        }
                    }
                    else if (cornersSum == 2){
                        /*  
                            VARIATIONS OF:

                            |||||   |   |       |||||   |||||
                            |   |||||   |   or  |   |||||   |
                            |   |   |||||       |   |   |   |

                            RESULT:

                            |||||   |   |       |||||||||||||
                            |   |   |   |  or   |   |   |   |
                            |   |   |||||       |   |   |   |
                        */

                        let middleSquare = {}

                        if ((l[i-1][j-1] && l[i-1][j+1]) || (l[i-1][j+1] && l[i+1][j+1]) || (l[i+1][j+1] && l[i+1][j-1])){
                            if (l[i-1][j-1] && l[i-1][j+1]){
                                middleSquare.x = i-1
                                middleSquare.y = j
                            }
                            else if (l[i-1][j+1] && l[i+1][j+1]){
                                middleSquare.x = i
                                middleSquare.y = j+1
                            }
                            else if (l[i+1][j+1] && l[i+1][j-1]){
                                middleSquare.x = i+1
                                middleSquare.y = j
                            }
                            
                            if (middleSquare.x && !l[middleSquare.x][middleSquare.y]){
                                l[i][j] = 0
                                l[middleSquare.x][middleSquare.y] = 1
                                iregularCorners++
                            }
                        }
                        else if ((l[i-1][j-1] && l[i+1][j+1]) || (l[i-1][j+1] && l[i+1][j-1])){
                            l[i][j] = 0
                            iregularCorners++
                        }
                    }
                }
            }
        }
    }

    // exits
    let exitX = Math.floor(Math.random() * (l.length-4)) + 2;

    l[exitX][0] = l[exitX][1] = 0

    if (!symmetrical)
        l[exitX][newWidth-1] = l[exitX][newWidth-2] = 0

    if (Math.floor(Math.random() * 2)){
        let exitY = Math.floor(Math.random() * (l[0].length-4)) + 2;

        l[0][exitY] = l[1][exitY] = l[h-1][exitY] = l[h-2][exitY] = 0
    }

    // complete empty spaces (some of)
    /*
        |   |||||   |       |   |||||||||   |
        |||||   |||||       |||||   |   |||||
        |   |||||   |       |   |||||||||   |

        RESULT:

        |   |||||   |       |   |||||||||   |
        |||||||||||||       |||||||||||||||||
        |   |||||   |       |   |||||||||   |
    */
    for(let i = 1; i < l.length-1; i++){
        for (let j = 1; j < l[0].length-1; j++){
            if ((l[i-1][j-1] + l[i-1][j+1] + l[i+1][j-1] + l[i+1][j+1]) == 0){
                l[i][j] = 1
            }
            if ((l[i-1][j] + l[i][j+1] + l[i+1][j] + l[i][j-1]) == 4){
                l[i][j] = 1
            }
            if (((l[i-1][j] + l[i+1][j] + l[i][j-1] + l[i-1][j+1] + l[i][j+2] + l[i+1][j+1]) == 6) ){
                l[i][j] = 1
            }
        }
    }

    // mirror symmetrical map
    if (symmetrical){
        for (let i = 0; i < l.length; i++) {
            let reversed = [...l[i]]

            reversed.reverse()

            if (w % 2 == 0){
                l[i] = l[i].concat(reversed);
            }
            else{
                l[i] = l[i].slice(0,l[i].length-1).concat(reversed)
            }
        }

        for(let i = 1; i < l.length-1; i++){
            for (let j = 1; j < l[0].length-1; j++){
                if ((l[i-1][j] + l[i][j+1] + l[i+1][j] + l[i][j-1]) == 4){
                    l[i][j] = 1
                }
                if (((l[i-1][j] + l[i+1][j] + l[i][j-1] + l[i-1][j+1] + l[i][j+2] + l[i+1][j+1]) == 6) ){
                    l[i][j] = 1
                }
            }
        }
    }

    // create "ghosts house"
    let i = Math.floor(Math.random() * (l.length-8)) + 2
    let j = symmetrical ? parseInt(w/2)-4 : Math.floor(Math.random() * (l[0].length-(w % 2 == 0 ? 9 : 10))) + 1

    l[i][j] = l[i][j+1] = l[i][j+2] = l[i][j+3] = l[i][j+4] = l[i][j+5] = l[i][j+6] = 
    l[i][j+7] = l[i+1][j] = l[i+2][j] = l[i+3][j] = l[i+1][j+7] = l[i+2][j+7] = l[i+3][j+7] = 
    l[i+2][j+2] =  l[i+2][j+3] = l[i+2][j+4] = l[i+2][j+5] = l[i+4][j] = l[i+4][j+1] = 
    l[i+4][j+2] = l[i+4][j+3] = l[i+4][j+4] = l[i+4][j+5] = l[i+4][j+6] = l[i+4][j+7] = 0;
    
    l[i+1][j+1] = l[i+1][j+2] = l[i+1][j+3] = l[i+1][j+4] = l[i+1][j+5] = l[i+1][j+6] = l[i+2][j+1] = 
    l[i+3][j+1] = l[i+3][j+2] = l[i+3][j+3] = l[i+3][j+4] = l[i+3][j+5] = l[i+3][j+6] = l[i+2][j+6] = 1
    
    // adjust on odd width map
    if (w % 2 == 1){
        l[i+2][j+6] = l[i][j+8] = l[i+1][j+8] = l[i+2][j+8] = l[i+3][j+8] = l[i+4][j+8] = 0

        l[i+2][j+7] = l[i+1][j+7] = l[i+3][j+7] = 1
    }
    
    // ghosts house "door"
    if(Math.floor(Math.random() * 2)){
        l[i+1][j+3] = l[i+1][j+4] = 0

        if (w % 2 == 1){
            l[i+1][j+5] = 0
        }
    }
    else{
        l[i+3][j+3] = l[i+3][j+4] = 0

        if (w % 2 == 1){
            l[i+3][j+5] = 0
        }
    }
    
    return l
}

function plotMap(h = parseInt(height.value ? height.value : 0), w = parseInt(width.value ? width.value : 0)){
    h = h < 7 ? 7 : h;
    w = w < 10 ? 10 : w;
    grid.innerHTML = ""

    let arrayMap = generateMap(h, w, symm.checked)

    area = h*w

    let cells = ''
    for (let n = 0; n < area; n++){
        
        i = parseInt(n / w)
        j = n % w

        cells += `<div ${arrayMap[i][j] ? "class='blue'" : ''}><!-- <sup>${i}</sup><sub>${j}</sub> --></div>`
    }

    grid.innerHTML = cells

    let columns = ''

    for (let i = 0; i < w; i++){
        columns += "auto "
    }

    grid.style.gridTemplateColumns = columns
    grid.style.height = h*20 + "px"
    grid.style.width = w*20 + "px"

    grid.style.display = "grid"
}

export default {countAdjacents, generateMap};