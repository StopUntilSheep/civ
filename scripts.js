
var startPoint = [];
var endPoint = [];

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

    const landMass = mapTypes["landMass"]["pangaea"];

    // html elements
    const htmlElemMap = document.getElementById('map-area');
    const htmlElemStats = document.getElementById('map-stats');




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

        //const floodFillMap = _this.slice();
        const floodFillMap = JSON.parse(JSON.stringify(_this));     // Using this method because slice() doesn't value copy objects

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


    const makeCopy = () => {

        return JSON.parse(JSON.stringify(_this));

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

        for (var i = 0; i < _this.length; i++) {
            code += "<div class='row'>";
            for (var j = 0; j < _this[i].length; j++) {
                code += "<div data-x='" + j + "' data-y='" + i + "' class='cell" + terrainCSS[_this[i][j]["terrain"]] + "'></div>";
            }
            code += "</div>";
        }

        htmlElemMap.innerHTML = code;

    }


    const displayStats = () => {

        // show stats for testing :)
        let code = "";

        code += "<div>Total Tiles: " + width * height + "</div>";
        code += "<div>Total Land Tiles: " + countCellsWithPropertyValue("terrain", 1) + "</div>";
        code += "<div>Number of Landmasses: " + countLandmasses() + "</div>";

        htmlElemStats.innerHTML = code;

    }


    const addEventListeners = () => {

        var landCells = document.querySelectorAll(".land, .mountain, .hill");

        landCells.forEach((elem) => {
            elem.addEventListener("click", () => {
                myAssCunt(elem)
            });
        });

    };


    const myAssCunt = (elem) => {
        //console.log(elem);
        //if(startPoint.length === 0){ console.log(elem.getAttribute("data-x") + ", " + elem.getAttribute("data-y")); }
        if (startPoint.length === 0) {
            startPoint = [parseInt(elem.getAttribute("data-y")), parseInt(elem.getAttribute("data-x"))];
        }
        else if (endPoint.length === 0) {
            endPoint = [parseInt(elem.getAttribute("data-y")), parseInt(elem.getAttribute("data-x"))];
            pathfinder.init(startPoint, endPoint);
        }
        else {
            reload();
        }
        /*         console.log(startPoint);
                console.log(endPoint); */
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
        makeCopy,
        randomCoords,
        randomLength,
        updateCellProperty,
        countCellsWithPropertyValue,
        displayHTML,
        displayStats,
        addEventListeners
    });

}
)()




const pathfinder = (() => {


    let map = [];
    let directions = [];
    //let startPoint = [];
    //let endPoint = [];


    /* 
        // CREATE THE MAP
        for (var i = 0; i < mapPrep.length; i++) {
            var row = [];
            for (var j = 0; j < mapPrep[i].length; j++) {
                var obj = new Object();
                obj.terrain = mapPrep[i][j];
                obj.checked = false;
                i === startPoint[0] && j === startPoint[1] ? obj.active = true : obj.active = false;
                obj.nodeList = [[i, j]];
                row.push(obj);
            }
            map.push(row);
        }
     */


    const findRoute = () => {

        // Get list of currently 'active' nodes
        var activeNodes = [];
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++) {
                if (map[i][j].active === true) {
                    activeNodes.push([i, j]);
                }
            }
        }


        // activeNodes ARRAY ORDERED BY 'NEAREST TO ENDPOINT' ---> 'FURTHEST FROM ENDPOINT'
        activeNodes.sort((a, b) => {
            if ((a[0] - endPoint[0]) ** 2 + (a[1] - endPoint[1]) ** 2 > (b[0] - endPoint[0]) ** 2 + (b[1] - endPoint[1]) ** 2) return 1;
            if ((a[0] - endPoint[0]) ** 2 + (a[1] - endPoint[1]) ** 2 < (b[0] - endPoint[0]) ** 2 + (b[1] - endPoint[1]) ** 2) return -1;
            return 0;
        })


        // Loop through activeNodes
        for (var k = 0; k < activeNodes.length; k++) {

            //console.log(activeNodes);

            // If the current activeNode matches the coords of the endPoint...
            if (activeNodes[k][0] === endPoint[0] && activeNodes[k][1] === endPoint[1]) {
                console.log("FOUND ROUTE!");
                //console.log(map[activeNodes[k][0]][activeNodes[k][1]]["nodeList"]);
                return true;
            }

            // If not..
            else {

                var x = activeNodes[k][1];
                var y = activeNodes[k][0];

                map[y][x]["checked"] = true;       // Set map node 'checked' to true

                for (var l = 0; l < directions.length; l++) {

                    // Move coords to next node
                    x += directions[l][1];
                    y += directions[l][0];

                    if (coordsAreWithinMapBoundaries(map, x, y) && terrainIsPassable(map, x, y) && nodeIsNotCheckedOrActive(map, x, y)) {
                        map[y][x]["active"] = true;     // Set node to 'active'
                        map[y][x]["nodeList"].unshift(...map[activeNodes[k][0]][activeNodes[k][1]]["nodeList"]);       // Add list of visited nodes to start of node's nodeList
                    }

                    // Reset coords back to previous node
                    x -= directions[l][1];
                    y -= directions[l][0];

                }

                map[y][x]["active"] = false;       // Set map node 'checked' to true

            }

        }


        return findRoute();


    }



    const init = (startPoint, endPoint) => {



        map = structuredClone(area._this);



        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++) {
                map[i][j]["nodeList"] = [[j, i]];
            }
        }

        //directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];     // up, right, down, left
        directions = [[-1, -1], [-1, 1], [1, 1], [1, -1], [-1, 0], [0, 1], [1, 0], [0, -1]];     // up-left, up-right, down-right, down-left, up, right, down, left

        console.log(map);

        //startPoint = [47, 25];
        //endPoint = [16, 91];

        map[startPoint[0]][startPoint[1]]["active"] = true;
        map[startPoint[0]][startPoint[1]]["start"] = true;
        map[endPoint[0]][endPoint[1]]["end"] = true;




        if (!findRoute()) {
            console.log("Can't find a route, chief!")

            // show map for testing :)
            let code = "";
            const htmlElemMap = document.getElementById('map-area');

            for (var i = 0; i < map.length; i++) {
                code += "<div class='row'>";
                for (var j = 0; j < map[i].length; j++) {
                    code += "<div class='cell";
                    if (map[i][j]["terrain"] === 3) { code += " mountain"; }
                    if (map[i][j]["terrain"] === 2) { code += " hill"; }
                    if (map[i][j]["terrain"] === 1) { code += " land"; }
                    if (map[i][j]["terrain"] === 0) { code += " water"; }
                    code += "'></div>";
                }
                code += "</div>";
            }

            htmlElemMap.innerHTML = code;

        }
        else {

            // show map for testing :)
            let code = "";
            const htmlElemMap = document.getElementById('map-area');

            for (var i = 0; i < map.length; i++) {
                code += "<div class='row'>";
                for (var j = 0; j < map[i].length; j++) {
                    code += "<div class='cell";
                    if (map[i][j]["terrain"] === 3) { code += " mountain"; }
                    if (map[i][j]["terrain"] === 2) { code += " hill"; }
                    if (map[i][j]["terrain"] === 1) { code += " land"; }
                    if (map[i][j]["terrain"] === 0) { code += " water"; }
                    if (map[i][j]["start"] === true) { code += " start"; }
                    if (map[i][j]["end"] === true) { code += " end"; }
                    if (arrayIsInArray(map[endPoint[0]][endPoint[1]]["nodeList"], [j, i])) { code += " red"; }
                    code += "'></div>";
                }
                code += "</div>";
            }

            htmlElemMap.innerHTML = code;

        };

    }




    // Check that a node exists
    const coordsAreWithinMapBoundaries = (map, x, y) => {
        if (x < 0 || x >= map[0].length || y < 0 || y >= map.length) { return false; }
        else { return true; }
    }

    // Check that the node terrain is one of the permitted types
    const terrainIsPassable = (map, x, y) => {
        if (map[y][x]["terrain"] === 0) { return false; }
        else { return true; }
    }

    // Check that the node is not already 'checked' or 'active'
    const nodeIsNotCheckedOrActive = (map, x, y) => {
        if (map[y][x]["checked"] === true || map[y][x]["active"] === true) { return false; }
        else { return true; }
    }

    // Check to see if an array is in an array of arrays
    const arrayIsInArray = (parent, child) => {
        var i, j, current;
        for (i = 0; i < parent.length; ++i) {
            if (child.length === parent[i].length) {
                current = parent[i];
                for (j = 0; j < child.length && child[j] === current[j]; ++j);
                if (j === child.length)
                    return true;
            }
        }
        return false;
    }

    return ({
        coordsAreWithinMapBoundaries,
        terrainIsPassable,
        nodeIsNotCheckedOrActive,
        arrayIsInArray,
        init
    });






})()









window.onload = () => {

    area.generateMatrix();
    area.generateLand();
    area.cleanUpNarrowPassages();
    area.cleanUpOverInflatedTerrain();

    area.displayHTML();
    area.displayStats();
    area.addEventListeners();

    console.log(area);

    //pathfinder.init();

}