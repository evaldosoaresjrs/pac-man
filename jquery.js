const gridSize = [40, 20];
const cellSize = 20;
const properties = {
    grid: {
        "grid-template": `repeat(${gridSize[1]}, ${cellSize}px) / repeat(${gridSize[0]}, ${cellSize}px)`
    },
    cell: {
        "width": cellSize,
        "height": cellSize,
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

const gameTickSpeed = 100;
let gameGrid = [];
let mapLoaded = false;

$(document).ready(() => {
    // generate_board();
    let accX = 0;
    let accY = 0;
    let posX;
    let posY;
    let mainLoop = false; // Define se o jogo esta funcionando ou não
    let isMouseDown;

    console.log(mainLoop)

    function main_loop() {

        if (!$(".container .cell").eq((posY + accY) * gridSize[0] + (posX + accX)).hasClass("cor")) {
            posX += accX; // Aceleração Horizontal
            posY += accY; // Aceleração Vertical
        }

        // Faz o personagem "teleportar" ao chegar na borda
        if (posX == gridSize[0]) posX = 0;
        else if (posX < 0) posX = gridSize[0] - 1;
        if (posY == gridSize[1]) posY = 0;
        else if (posY < 0) posY = gridSize[1] - 1;

        // Atualiza o grid com a posição do personagem
        // gameGrid[posY][posX] = 1;

        // Movimento do personagem
        generate_player(posX, posY)

        // console.clear();
        console.log(gameGrid.join(" "));
    }

    function generate_player(x, y) {
        $("#player").remove()
        $(".container .cell").eq(y * gridSize[0] + x).append("<div id='player'></div>")

        $("#player").css({
            "width": properties.cell.width / 1.5,
            "height": properties.cell.height / 1.5,
        });

        posX = x;
        posY = y;
    }

    function generate_board() {
        $(".cell").remove();
        $(".container").css(properties.grid);
        $(".cell").css(properties.cell);
        for (let i = 0; i < gridSize[1]; i++) { // Vertical
            if (!mapLoaded) gameGrid.push([])
            for (let j = 0; j < gridSize[0]; j++) { // Horizontal
                if (!mapLoaded) {
                    gameGrid[i].push(0)
                    $(".container").append(`<div class="cell"></div>`);
                } 
                else {
                    if (gameGrid[i][j] == 1) {
                        $(".container").append(`<div class="cell cor"></div>`);
                    } else $(".container").append(`<div class="cell"></div>`)
                }
                // if (gridSize[0] * Math.random() < gridSize[0]/2) $(".container").append(`<div class="cell cor"></div>`);

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

    // Botão que gera o jogador:
    $("#btn").click(() => {
        // let x = parseInt($("#posXInput").val());
        // let y = parseInt($("#posYInput").val());
        $(".container #player").remove();
        // generate_player(0, 0);
        generate_board();
    });

    $("#startLoop").click(() => {
        mainLoop = setInterval(main_loop, gameTickSpeed);
    })

    $("#stopLoop").click(() => {
        clearInterval(mainLoop);
    });

    $("#resetColor").click(() => {
        $(".cor").removeClass("cor");
    })

    $("#saveGrid").click(() => {

        const texto = "[[" + gameGrid.map(linha => linha.join(", ")).join("],\n[") + "]]";

        const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
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
            const content = await readFile(event);
            gameGrid = JSON.parse(content);
            mapLoaded = true;
        } catch (error) {
            console.error(error);
        }
    });

    $('.cell').hover(function (event) {
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

    $(document).on('keydown', function (event) {
        let action = keyActions[event.which];
        if (action) {
            accX = action[0];
            accY = action[1];
            event.preventDefault(); // Previne o comportamento padrão das teclas
        }
    });
});
