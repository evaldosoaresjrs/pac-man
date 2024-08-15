let gridSize = [gridSizeX.value, gridSizeY.value]
const cellSize = 20;
const propertiesCss = {
    cell: {
        "width": cellSize,
        "height": cellSize,
    },
    player: {
        "width": cellSize / 1.5,
        "height": cellSize / 1.5
    }
}

const keyActions = {
    37: [-1, 0], // seta esquerda
    38: [0, -1], // seta cima
    39: [1, 0], // seta direita
    40: [0, 1], // seta baixo
    87: [0, -1], // tecla W
    65: [-1, 0], // tecla A
    83: [0, 1], // tecla S
    68: [1, 0],  // tecla D
};

const gameTickSpeed = 200; // Em ms
let mapLoaded = false;
let gameGrid;

$(document).ready(() => {
    let accX = 0;
    let accY = 0;
    let playerPosX;
    let playerPosY;
    let mainLoop; // Defino se o loop está ativo
    let isMouseDown;
    let eraser;

    function main_loop() {
        $(".container .cell").index();

        // Mudar para gameGrid
        if (!$(".container .cell").eq((playerPosY + accY) * gridSize[0] + (playerPosX + accX)).hasClass("cor")) {
            playerPosX += accX; // Aceleração Horizontal
            playerPosY += accY; // Aceleração Vertical
        }

        // Faz o personagem "teleportar" ao chegar na borda
        if (playerPosX == gridSize[0]) playerPosX = 0;
        else if (playerPosX < 0) playerPosX = gridSize[0] - 1;
        if (playerPosY == gridSize[1]) playerPosY = 0;
        else if (playerPosY < 0) playerPosY = gridSize[1] - 1;

        console.log(playerPosX, playerPosY)

        // Movimento do personagem
        generate_player(playerPosX, playerPosY)
    }

    // Fazer essa função depois para
    function updateGrid(gridMatriz) {

    }

    function generate_player(x = 1, y = 1) {
        $("#player").remove()

        //Mudar para verifica no gameGrid
        $(".container .cell").eq(y * gridSize[0] + x).append("<div id='player'></div>")

        $("#player").css(propertiesCss.player);

        playerPosX = x;
        playerPosY = y;
    }

    function generate_board(sizeX, sizeY, cell = cellSize, map = []) {
        let containerCss = {"grid-template": `repeat(${sizeY}, ${cell}px) / repeat(${sizeX}, ${cell}px)`}
        
        gridSize = [sizeX, sizeY];
        
        gridSizeX.value = sizeX
        gridSizeY.value = sizeY
        
        $(".container").css(containerCss);
        $(".cell").css(propertiesCss.cell);
        $(".cell").remove();
    
        gameGrid = map;
        console.log(map);
        for (let i = 0; i < sizeY; i++) { // Vertical Y
            if (!mapLoaded) gameGrid.push([])
            for (let j = 0; j < sizeX; j++) { // Horizontal X
                if (!mapLoaded) {
                    gameGrid[i].push(0)
                    $(".container").append(`<div class="cell"></div>`);
                } 
                else {
                    if (map[i][j] == 1) {
                        $(".container").append(`<div class="cell cor"></div>`);
                    } else $(".container").append(`<div class="cell"></div>`)
                }
            }
        }
        start_click_handler();
    }

    function detect_click() {
        // Detecta quando o mouse é clicado
        $(".cell").mousedown(function () {
            isMouseDown = true;
        });
        // Detecta quando o botão do mouse é solto
        $(".cell").mouseup(function () {
            isMouseDown = false;
        });
    }

    function get_cell_index(cellObj) {
        let rawPos = $(cellObj).index();

        let mouseX = rawPos % gridSize[0];
        let mouseY = Math.floor(rawPos / gridSize[0]);

        return [mouseX, mouseY]
    }

    function set_gameGrid_cell(cell, value = 1) {
        let positions = get_cell_index(cell);

        gameGrid[positions[1]][positions[0]] = value;
    }

    function get_board_sizes() {
        return [parseInt(gridSizeX.value), parseInt(gridSizeY.value)]
    }

    function readFile(event) {
        return new Promise((resolve, reject) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(e);
                reader.readAsText(file);
            } else {
                reject(new Error('No file selected.'));
            }
        });
    }

    function start_click_handler() {
        $('.cell').on("mousemove", function (event) {
            eraser = $("#eraser").is(":checked");
            detect_click();
            if (isMouseDown && !eraser) {
                $(this).addClass('cor');
                set_gameGrid_cell($(this));
            }
            else if (isMouseDown) {
                $(this).removeClass('cor');
                set_gameGrid_cell($(this), 0);
            };
        });
    
        $(".cell").click(function () {
            eraser = $("#eraser").is(":checked");
            if (!eraser) { 
                $(this).addClass('cor')
                set_gameGrid_cell($(this));
             }
            else {
                $(this).removeClass('cor')
                set_gameGrid_cell($(this), 0);
            };
        })
    }

    $("#btnMapa").click(() => {
        generate_board(gridSizeX.value, gridSizeY.value);
    });

    $("#btnRandomMap").click(() => {
        gridSize = get_board_sizes();
        mapLoaded = true;
        generate_board(gridSize[0], gridSize[1], cellSize, generateMap(gridSize[1], gridSize[0], symmetrical.checked))
    })

    $("#btnPlayer").click(() => {
        $(".container #player").remove();
        generate_player(1, 1);
    })

    $("#startLoop").click(() => {
        mainLoop = setInterval(main_loop, gameTickSpeed);
    })

    $("#stopLoop").click(() => {
        clearInterval(mainLoop);
    });

    $("#resetColor").click(() => {
        $(".cor").removeClass("cor");
        for (let i = 0; i < gameGrid.length; i++) {
            for (let j = 0; j < gameGrid[i].length; j++) {
                gameGrid[i][j] = 0;
            }
        }
    })

    $("#saveGrid").click(() => {

        const map = "[[" + gameGrid.map(linha => linha.join(", ")).join("],\n[") + "]]";

        const text = `{"gridSize" : [${gridSize}],\n "cellSize" : ${cellSize},\n "map" : ${map}}`

        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = $('<a></a>');
        a.attr('href', url);
        a.attr('download', `matrix_map-${gridSize[0]}x${gridSize[1]}`);

        $('body').append(a);
        a[0].click();

        a.remove();

        // Liberar o URL criado
        URL.revokeObjectURL(url);

    });

    $("#fileInput").on("change", async (event) => {
        try {
            const fileContent = await readFile(event);
            let mapProperties = JSON.parse(fileContent);
            mapLoaded = true;
            generate_board(mapProperties.gridSize[0], mapProperties.gridSize[1], mapProperties.cellSize, mapProperties.map);
        } catch (error) {
            console.error(error);
        }
    });

    $(document).on('keydown', function (event) {
        let action = keyActions[event.which];
        if (action) {
            accX = action[0];
            accY = action[1];
            event.preventDefault(); // Previne o comportamento padrão das teclas
        }
    });
});

function countAdjacents(i, j){
    return l[i-1][j-1] + l[i-1][j] + l[i-1][j+1] + l[i][j-1] + l[i][j+1] + l[i+1][j-1] + l[i+1][j] + l[i+1][j+1]
}

function generateMap(h = 10, w = 20, symmetrical = true){
    h = h < 10 ? 10 : h;
    w = w < 20 ? 20 : w;

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
