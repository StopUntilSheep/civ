const area = (() => {

    var _this = [];
    var startingCoords = [];
    var currentCoords = [];
    var chunkCanvas = [];
    var chunkLength = 0;

    // determine size of area
    const width = 110;
    const height = 60;
    const margin = 4;

    const mapTypes = {
        landMass: {
            islands: 0,
            continents: 1,
            pangaea: 2
        },
        temperature: {
            cool: 0,
            temperate: 1,
            warm: 2
        },
        climate: {
            arid: 0,
            normal: 1,
            wet: 2
        },
        age: {
            billion3: 0,
            billion4: 1,
            billion5: 2
        }
    }

    // terrain CSS classes
    const terrainCSS = {
        count: " red",
        0: " water",
        1: " land",
        2: " hill",
        3: " mountain"
    }

    const landMass = mapTypes["landMass"]["continents"];




    // total land limit
    //const totalLandLimit = width * height / 1.4;
    const totalLandLimit = (landMass + 1) * 1.25 * ((width * height) / 6);


    const generateMatrix = () => {

        // generate a matrix for the area
        for (var i = 0; i < height; i++) {
            var row = [];
            for (var j = 0; j < width; j++) {
                var obj = new Object();
                obj.x = j + 1;
                obj.y = i + 1;
                obj.terrain = 0;
                row.push(obj);
            }
            _this.push(row);
        }

    }


    const generateLand = () => {

        let counter = 0;

        while (true) {

            counter++;

            randomCoords();
            randomLength();

            chunkCanvas.length = 0;

            // generate matrix of terrain: 0 for blank chunk canvas
            for (var i = 0; i < height; i++) {
                var row = [];
                for (var j = 0; j < width; j++) {
                    var obj = new Object();
                    obj.terrain = 0;
                    row.push(obj);
                }
                chunkCanvas.push(row);
            }

            // Loop to create a chunk
            for (let i = 0; i < chunkLength; i++) {

                const rand = Math.random();

                if (rand < 0.25) {
                    currentCoords[0] -= 1;
                } else if (rand < 0.5) {
                    currentCoords[0] += 1;
                } else if (rand < 0.75) {
                    currentCoords[1] -= 1;
                } else {
                    currentCoords[1] += 1;
                }

                if (currentCoords[0] < margin || currentCoords[1] < margin || currentCoords[0] >= (width - margin) || currentCoords[1] >= (height - margin)) {
                    break;
                }

                updateChunkCanvasCellProperty(currentCoords[0], currentCoords[1], "terrain", 1);
                updateChunkCanvasCellProperty(currentCoords[0], currentCoords[1] - 1, "terrain", 1);
                updateChunkCanvasCellProperty(currentCoords[0] + 1, currentCoords[1], "terrain", 1);
                updateChunkCanvasCellProperty(currentCoords[0], currentCoords[1] + 1, "terrain", 1);
                updateChunkCanvasCellProperty(currentCoords[0] - 1, currentCoords[1], "terrain", 1);

            }

            // Merge chunk to main map
            for (var i = 0; i < height - 1; i++) {
                for (var j = 0; j < width - 1; j++) {
                    /*                     if (_this[i][j]["terrain"] === 0 && chunkCanvas[i][j]["terrain"] === 1) {
                                            _this[i][j]["terrain"] = 1;
                                        } else if (_this[i][j]["terrain"] > 0 && chunkCanvas[i][j]["terrain"] === 1) {
                                            _this[i][j]["terrain"] += 1;
                                        } */

                    _this[i][j]["terrain"] += chunkCanvas[i][j]["terrain"];

                }
            }



            if (countCellsWithPropertyValue("terrain", 1) > totalLandLimit) {
                break;
            }

        }

        console.log(counter);

    }


    const cleanUpNarrowPassages = () => {

        for (var i = 0; i < height - 1; i++) {
            for (var j = 0; j < width - 1; j++) {

                if (_this[i][j]["terrain"] === 1 && _this[i][j + 1]["terrain"] === 0 && _this[i + 1][j]["terrain"] === 0 && _this[i + 1][j + 1]["terrain"] === 1) {
                    _this[i][j]["terrain"] = 1;
                    _this[i][j + 1]["terrain"] = 1;
                    _this[i + 1][j]["terrain"] = 1;
                    _this[i + 1][j + 1]["terrain"] = 1;
                }

                if (_this[i][j]["terrain"] === 0 && _this[i][j + 1]["terrain"] === 1 && _this[i + 1][j]["terrain"] === 1 && _this[i + 1][j + 1]["terrain"] === 0) {
                    _this[i][j]["terrain"] = 0;
                    _this[i][j + 1]["terrain"] = 1;
                    _this[i + 1][j]["terrain"] = 1;
                    _this[i + 1][j + 1]["terrain"] = 1;
                }

            }
        }

    }


    const cleanUpOverInflatedTerrain = () => {          //lol

        for (var i = 0; i < height - 1; i++) {
            for (var j = 0; j < width - 1; j++) {
                if (_this[i][j]["terrain"] > 1) {
                    _this[i][j]["terrain"]--;
                }
                if (_this[i][j]["terrain"] > 3) {
                    _this[i][j]["terrain"] = 3;
                }
            }
        }

    }


    const countLandmasses = () => {

        var theCount = 0;

        function fill(data, x, y, newValue) {
            // get target value
            var target = 1;

            function flow(x, y) {
                // bounds check what we were passed
                if (x >= 0 && x < data.length && y >= 0 && y < data[x].length) {
                    if (data[x][y]["terrain"] >= target) {
                        data[x][y]["terrain"] = newValue;
                        flow(x - 1, y);    // check up
                        flow(x + 1, y);    // check down
                        flow(x, y - 1);    // check left
                        flow(x, y + 1);    // check right
                    }
                }
            }

            flow(x, y);
        }

        const floodFillMap = _this.slice();

        for (var i = 0; i < height - 1; i++) {
            for (var j = 0; j < width - 1; j++) {
                if (floodFillMap[i][j]["terrain"] >= 1) {
                    fill(floodFillMap, i, j, "count");
                    theCount++;
                }
            }
        }

        return theCount;

    }


    const randomCoords = () => {

        startingCoords.length = 0;

        // pick random starting coordinates inside the area and within the margins
        const x = Math.floor(margin + (Math.random() * (width - (margin * 2))));
        const y = Math.floor(margin + (Math.random() * (height - (margin * 2))));

        startingCoords = currentCoords = [x, y];

    }


    const randomLength = () => {

        min = margin;
        max = (width + height) * 2 - margin;

        result = Math.floor(Math.random() * (max - min + 1)) + min;

        chunkLength = result;

    }


    const updateCellProperty = (x, y, property, value) => {

        _this[y][x][property] = value;

    }


    const updateChunkCanvasCellProperty = (x, y, property, value) => {

        chunkCanvas[y][x][property] = value;

    }


    const countCellsWithPropertyValue = (property, value) => {

        var count = _this.reduce((acc, cur) => acc + cur.filter((obj) => obj[property] >= value).length, 0);

        return count;

    }


    const displayHTML = () => {

        // show map for testing :)
        let code = "";
        const htmlElemMap = document.getElementById('map-area');

        for (var i = 0; i < _this.length; i++) {
            code += "<div class='row'>";
            for (var j = 0; j < _this[i].length; j++) {
                code += "<div class='cell" + terrainCSS[_this[i][j]["terrain"]] + "'></div>";
            }
            code += "</div>";
        }

        htmlElemMap.innerHTML = code;

    }


    const displayStats = () => {

        // show stats for testing :)
        let code = "";
        const htmlElemStats = document.getElementById('map-stats');

        code += "<div>Total Tiles: " + width * height + "</div>";
        code += "<div>Total Land Tiles: " + countCellsWithPropertyValue("terrain", 1) + "</div>";
        code += "<div>Number of Landmasses: " + countLandmasses() + "</div>";

        htmlElemStats.innerHTML = code;

    }


    return ({
        get _this() {
            return _this
        },
        get startingCoords() {
            return startingCoords
        },
        get currentCoords() {
            return currentCoords
        },
        get chunkCanvas() {
            return chunkCanvas
        },
        get chunkLength() {
            return chunkLength
        },
        width,
        height,
        margin,
        totalLandLimit,
        generateMatrix,
        generateLand,
        cleanUpNarrowPassages,
        cleanUpOverInflatedTerrain,
        countLandmasses,
        randomCoords,
        randomLength,
        updateCellProperty,
        countCellsWithPropertyValue,
        displayHTML,
        displayStats
    });

}
)()





window.onload = () => {

    area.generateMatrix();
    area.generateLand();
    area.cleanUpNarrowPassages();
    area.cleanUpOverInflatedTerrain();

    area.displayHTML();
    area.displayStats();

    console.log(area);

}