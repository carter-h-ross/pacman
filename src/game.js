/* ---------------------------------------------------------------------- credits -------------------------------------------------------------------*/

// author: carter ross
// A-start pathfinding algorithim used from: http://github.com/bgrins/javascript-astar
// credit to Bowen for the idea for the game

/* ---------------------------------------------------------------------- firebase -------------------------------------------------------------------*/

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
    getDatabase,
    ref, 
    onValue, 
    set,
    get,
    push
} from "firebase/database";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from 'firebase/auth'

const dr = getDatabase();
const auth = getAuth();
var userId = null;

const firebaseConfig = {
    apiKey: "AIzaSyChxw12x7mVWQxXkFou37p8thMQ8Tjg_q0",
    authDomain: "carterross-dev-pacman.firebaseapp.com",
    projectId: "carterross-dev-pacman",
    storageBucket: "carterross-dev-pacman.appspot.com",
    messagingSenderId: "90253546697",
    appId: "1:90253546697:web:e262fea9f928ed9181e918",
    measurementId: "G-BWDXLXT6KE"
};

function uploadHighScore(mapId, userId, username, score, date) {

}

function getFullLeaderboard(mapId, userId, date) {

}

function load100(start, end) {

}

/* ------------------------------------------------------------------------- A* ----------------------------------------------------------------------*/


(function(definition) {
    /* global module, define */
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = definition();
    } else if (typeof define === 'function' && define.amd) {
        define([], definition);
    } else {
        var exports = definition();
        window.astar = exports.astar;
        window.Graph = exports.Graph;
    }
    })(function() {
  
        function pathTo(node) {
            var curr = node;
            var path = [];
            while (curr.parent) {
                path.unshift(curr);
                curr = curr.parent;
            }
            return path;
        }
  
        function getHeap() {
            return new BinaryHeap(function(node) {
                return node.f;
            });
        }
  
        var astar = {
            /**
            * Perform an A* Search on a graph given a start and end node.
            * @param {Graph} graph
            * @param {GridNode} start
            * @param {GridNode} end
            * @param {Object} [options]
            * @param {bool} [options.closest] Specifies whether to return the
                    path to the closest node if the target is unreachable.
            * @param {Function} [options.heuristic] Heuristic function (see
            *          astar.heuristics).
            */
            search: function(graph, start, end, options) {
                graph.cleanDirty();
                options = options || {};
                var heuristic = options.heuristic || astar.heuristics.manhattan;
                var closest = options.closest || false;
            
                var openHeap = getHeap();
                var closestNode = start; // set the start node to be the closest if required
            
                start.h = heuristic(start, end);
                graph.markDirty(start);
            
                openHeap.push(start);
            
                while (openHeap.size() > 0) {
  
                    // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
                    var currentNode = openHeap.pop();
            
                    // End case -- result has been found, return the traced path.
                    if (currentNode === end) {
                        return pathTo(currentNode);
                    }
            
                    // Normal case -- move currentNode from open to closed, process each of its neighbors.
                    currentNode.closed = true;
            
                    // Find all neighbors for the current node.
                    var neighbors = graph.neighbors(currentNode);
  
                    for (var i = 0, il = neighbors.length; i < il; ++i) {
                        var neighbor = neighbors[i];
                        if (neighbor.closed || neighbor.isWall()) {
                            // Not a valid node to process, skip to next neighbor.
                            continue;
                        }
            
                        // The g score is the shortest distance from start to current node.
                        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                        var gScore = currentNode.g + neighbor.getCost(currentNode);
                        var beenVisited = neighbor.visited;
                
                        if (!beenVisited || gScore < neighbor.g) {
                
                            // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                            neighbor.visited = true;
                            neighbor.parent = currentNode;
                            neighbor.h = neighbor.h || heuristic(neighbor, end);
                            neighbor.g = gScore;
                            neighbor.f = neighbor.g + neighbor.h;
                            graph.markDirty(neighbor);
                            if (closest) {
                                // If the neighbour is closer than the current closestNode or if it's equally close but has
                                // a cheaper path than the current closest node then it becomes the closest node
                                if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                                    closestNode = neighbor;
                                }
                            }
            
                            if (!beenVisited) {
                                // Pushing to heap will put it in proper place based on the 'f' value.
                                openHeap.push(neighbor);
                            } else {
                                // Already seen the node, but since it has been rescored we need to reorder it in the heap
                                openHeap.rescoreElement(neighbor);
                            }
                        }
                    }
                }
  
                if (closest) {
                    return pathTo(closestNode);
                }
  
                // No result was found - empty array signifies failure to find path.
                return [];
            },
            // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
            heuristics: {
            manhattan: function(pos0, pos1) {
                var d1 = Math.abs(pos1.x - pos0.x);
                var d2 = Math.abs(pos1.y - pos0.y);
                return d1 + d2;
            },
            diagonal: function(pos0, pos1) {
                var D = 1;
                var D2 = Math.sqrt(2);
                var d1 = Math.abs(pos1.x - pos0.x);
                var d2 = Math.abs(pos1.y - pos0.y);
                return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
            }
            },
            cleanNode: function(node) {
            node.f = 0;
            node.g = 0;
            node.h = 0;
            node.visited = false;
            node.closed = false;
            node.parent = null;
            }
        };
  
        /**
         * A graph memory structure
         * @param {Array} gridIn 2D array of input weights
         * @param {Object} [options]
         * @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
         */
        function Graph(gridIn, options) {
            options = options || {};
            this.nodes = [];
            this.diagonal = !!options.diagonal;
            this.grid = [];
            for (var x = 0; x < gridIn.length; x++) {
                this.grid[x] = [];
            
                for (var y = 0, row = gridIn[x]; y < row.length; y++) {
                    var node = new GridNode(x, y, row[y]);
                    this.grid[x][y] = node;
                    this.nodes.push(node);
                }
            }
            this.init();
        }
  
        Graph.prototype.init = function() {
            this.dirtyNodes = [];
            for (var i = 0; i < this.nodes.length; i++) {
                astar.cleanNode(this.nodes[i]);
            }
        };
  
        Graph.prototype.cleanDirty = function() {
            for (var i = 0; i < this.dirtyNodes.length; i++) {
                astar.cleanNode(this.dirtyNodes[i]);
            }
            this.dirtyNodes = [];
        };
  
        Graph.prototype.markDirty = function(node) {
            this.dirtyNodes.push(node);
        };
  
        Graph.prototype.neighbors = function(node) {
            var ret = [];
            var x = node.x;
            var y = node.y;
            var grid = this.grid;
        
            // West
            if (grid[x - 1] && grid[x - 1][y]) {
                ret.push(grid[x - 1][y]);
            }
        
            // East
            if (grid[x + 1] && grid[x + 1][y]) {
                ret.push(grid[x + 1][y]);
            }
        
            // South
            if (grid[x] && grid[x][y - 1]) {
                ret.push(grid[x][y - 1]);
            }
        
            // North
            if (grid[x] && grid[x][y + 1]) {
                ret.push(grid[x][y + 1]);
            }
        
            if (this.diagonal) {
                // Southwest
                if (grid[x - 1] && grid[x - 1][y - 1]) {
                    ret.push(grid[x - 1][y - 1]);
                }
            
                // Southeast
                if (grid[x + 1] && grid[x + 1][y - 1]) {
                    ret.push(grid[x + 1][y - 1]);
                }
            
                // Northwest
                if (grid[x - 1] && grid[x - 1][y + 1]) {
                    ret.push(grid[x - 1][y + 1]);
                }
            
                // Northeast
                if (grid[x + 1] && grid[x + 1][y + 1]) {
                    ret.push(grid[x + 1][y + 1]);
                }
            }
        
            return ret;
        };
  
        Graph.prototype.toString = function() {
            var graphString = [];
            var nodes = this.grid;
            for (var x = 0; x < nodes.length; x++) {
                var rowDebug = [];
                var row = nodes[x];
                for (var y = 0; y < row.length; y++) {
                    rowDebug.push(row[y].weight);
                }
                graphString.push(rowDebug.join(" "));
            }
            return graphString.join("\n");
        };
  
        function GridNode(x, y, weight) {
            this.x = x;
            this.y = y;
            this.weight = weight;
        }
        
        GridNode.prototype.toString = function() {
            return "[" + this.x + " " + this.y + "]";
        };
        
        GridNode.prototype.getCost = function(fromNeighbor) {
            // Take diagonal weight into consideration.
            if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
                return this.weight * 1.41421;
            }
            return this.weight;
        };
        
        GridNode.prototype.isWall = function() {
            return this.weight === 0;
        };
        
        function BinaryHeap(scoreFunction) {
            this.content = [];
            this.scoreFunction = scoreFunction;
        }
  
        BinaryHeap.prototype = {
            push: function(element) {
                // Add the new element to the end of the array.
                this.content.push(element);
                // Allow it to sink down.
                this.sinkDown(this.content.length - 1);
            },
            pop: function() {
                // Store the first element so we can return it later.
                var result = this.content[0];
                // Get the element at the end of the array.
                var end = this.content.pop();
                // If there are any elements left, put the end element at the
                // start, and let it bubble up.
                if (this.content.length > 0) {
                    this.content[0] = end;
                    this.bubbleUp(0);
                }
                return result;
            },
            remove: function(node) {
                var i = this.content.indexOf(node);
            
                // When it is found, the process seen in 'pop' is repeated
                // to fill up the hole.
                var end = this.content.pop();
            
                if (i !== this.content.length - 1) {
                    this.content[i] = end;
            
                    if (this.scoreFunction(end) < this.scoreFunction(node)) {
                        this.sinkDown(i);
                    } else {
                        this.bubbleUp(i);
                    }
                }
            },
            size: function() {
                return this.content.length;
            },
            rescoreElement: function(node) {
                this.sinkDown(this.content.indexOf(node));
            },
            sinkDown: function(n) {
                // Fetch the element that has to be sunk.
                var element = this.content[n];
            
                // When at 0, an element can not sink any further.
                while (n > 0) {
            
                    // Compute the parent element's index, and fetch it.
                    var parentN = ((n + 1) >> 1) - 1;
                    var parent = this.content[parentN];
                    // Swap the elements if the parent is greater.
                    if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                        this.content[parentN] = element;
                        this.content[n] = parent;
                        // Update 'n' to continue at the new position.
                        n = parentN;
                    }
                    // Found a parent that is less, no need to sink any further.
                    else {
                        break;
                    }
                }
            },
            bubbleUp: function(n) {
                // Look up the target element and its score.
                var length = this.content.length;
                var element = this.content[n];
                var elemScore = this.scoreFunction(element);
        
                while (true) {
                    // Compute the indices of the child elements.
                    var child2N = (n + 1) << 1;
                    var child1N = child2N - 1;
                    // This is used to store the new position of the element, if any.
                    var swap = null;
                    var child1Score;
                    // If the first child exists (is inside the array)...
                    if (child1N < length) {
                    // Look it up and compute its score.
                    var child1 = this.content[child1N];
                    child1Score = this.scoreFunction(child1);
        
                    // If the score is less than our element's, we need to swap.
                    if (child1Score < elemScore) {
                        swap = child1N;
                    }
                }
        
                // Do the same checks for the other child.
                if (child2N < length) {
                    var child2 = this.content[child2N];
                    var child2Score = this.scoreFunction(child2);
                    if (child2Score < (swap === null ? elemScore : child1Score)) {
                        swap = child2N;
                    }
                }
        
                // If the element needs to be moved, swap it, and continue.
                if (swap !== null) {
                    this.content[n] = this.content[swap];
                    this.content[swap] = element;
                    n = swap;
                }
                // Otherwise, we are done.
                else {
                    break;
                }
            }
            }
        };
  
        return {
            astar: astar,
            Graph: Graph
        };
  
    });

/* ----------------------------------------------------------------------- threejs -------------------------------------------------------------------*/

import * as THREE from 'three';
import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// function to help with radians
function degToRad(degrees) {
    var radians = degrees * (Math.PI / 180);
    return radians;
}

class Ghost {

    constructor(x,y,z,id) {
        self.x = x;
        self.y = y;
        self.z = z;
        self.id = id;
    }

    load(x,y,z) {

    }

    getPath() {

    }

    nextMove() {

    }
    
}

class World {

    constructor(dimensions, map, skybox, id) {
        self.dimensions = dimensions;
        self.map = map;
        self.skybox = skybox;
        self.ref = id;
    }

    load() {

    }
    
}


class Map {
    constructor(codes) {
        this.codes = codes;
        this.sizeX = codes[0][0].length;
        this.sizeZ = codes[0].length;
        this.sizeY = codes.length;
    }

    buildWalls(height) {
        for (let y = 0; y < height; y++) {
            let newMap = JSON.parse(JSON.stringify(this.codes)); // Create a deep copy of the current map
            for (let x = 1; x < this.sizeX - 1; x++) {
                for (let z = 1; z < this.sizeZ - 1; z++) {
                    if (this.codes[y][z][x] === 0 && this.isAdjacentToBlock(x, z, y)) {
                        newMap[y][z][x] = 1;
                    }
                }
            }
            this.codes = newMap;
        }
        return this;
    }

    isAdjacentToBlock(x, z, y) {
        // Check if the position is one block away from a 1
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {
                    if (this.codes[y + k] && this.codes[y + k][z + i] && this.codes[y + k][z + i][x + j] === 1) {
                        if (k !== 0 || i !== 0 || j !== 0) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    addGhosts(x1,z1,x2,z2,x3,z3,x4,z4) {
        this.codes[1][z1][x1] = 11;
        if (this.codes[0][z1][x1] == 0) {
            alert("invalid ghost placement on map");
        }
        this.codes[1][z2][x2] = 12;
        if (this.codes[0][z2][x2] == 0) {
            alert("invalid ghost placement on map");
        }
        this.codes[1][z3][x3] = 13;
        if (this.codes[0][z3][x3] == 0) {
            alert("invalid ghost placement on map");
        }
        this.codes[1][z4][x4] = 14;
        if (this.codes[0][z4][x4] == 0) {
            alert("invalid ghost placement on map");
        }
    }

    addPlayer(x,z,dir) {
        switch (dir) {
            case 'n':
                this.codes[1][z][x] = 21;
            case 'e':
                this.codes[1][z][x] = 22;
            case 's':
                this.codes[1][z][x] = 23;
            case 'w':
                this.codes[1][z][x] = 24;
        }
        if (this.codes[0][z][x] == 0) {
            alert("invalid player placement on map");
        }
    }
}

const scene = new THREE.Scene();
const gltfLoader = new GLTFLoader();

testMap = new Map([
[//  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
    [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 2
    [ 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], // 3
    [ 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], // 4
    [ 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], // 5
    [ 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], // 6
    [ 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], // 7
    [ 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], // 8
    [ 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], // 9
    [ 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], // 0
    [ 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], // 1
    [ 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0], // 2
    [ 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0], // 3
    [ 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0], // 4
    [ 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0], // 5
    [ 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0], // 6
    [ 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0], // 7
    [ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // 8
    [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 9
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
]
]).buildWalls(2).addGhosts(1,1, 1,18, 18,1, 18,18).addPlayer(15, 9, "w");