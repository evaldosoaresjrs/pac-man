let gridSize = [gridSizeX, gridSizeY]
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

const gameTickSpeed = 100; // Em ms
let mapLoaded = false;
let gameGrid;

$(document).ready(() => {
    let accX = 0;
    let accY = 0;
    let playerPosX;
    let playerPosY;
    let mainLoop; // Defino se o loop está ativo
    let isMouseDown;

    function main_loop() {
        if (!$(".container .cell").eq((playerPosY + accY) * gridSize[0] + (playerPosX + accX)).hasClass("cor")) {
            playerPosX += accX; // Aceleração Horizontal
            playerPosY += accY; // Aceleração Vertical
        }

        // Faz o personagem "teleportar" ao chegar na borda
        if (playerPosX == gridSize[0]) playerPosX = 0;
        else if (playerPosX < 0) playerPosX = gridSize[0] - 1;
        if (playerPosY == gridSize[1]) playerPosY = 0;
        else if (playerPosY < 0) playerPosY = gridSize[1] - 1;

        // Movimento do personagem
        generate_player(playerPosX, playerPosY)
    }

    function generate_player(x = 1, y = 1) {
        $("#player").remove()
        $(".container .cell").eq(y * gridSize[0] + x).append("<div id='player'></div>")

        $("#player").css(propertiesCss.player);

        playerPosX = x;
        playerPosY = y;
    }

    function generate_board(sizeX = gridSize[0], sizeY = gridSize[1], cell = cellSize, map = []) {
        let containerCss = {"grid-template": `repeat(${sizeY}, ${cell}px) / repeat(${sizeX}, ${cell}px)`}
        
        gridSizeX.value = sizeX
        gridSizeY.value = sizeY

        $(".container").css(containerCss);
        $(".cell").css(propertiesCss.cell);
        $(".cell").remove();
        gameGrid = map;
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
        gridSize = [gridSizeX.value, gridSizeY.value]
        let positions = get_cell_index(cell);

        gameGrid[positions[1]][positions[0]] = value;
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
        start_click_handler();
    });

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
            for (let j = 0; i < gameGrid[i].length; j++) {
                gameGrid[i][j] = 0;
            }
        }
    })

    $("#saveGrid").click(() => {

        const map = "[[" + gameGrid.map(linha => linha.join(", ")).join("],\n[") + "]]";

        gridSize = [gridSizeX.value, gridSizeY.value]

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
