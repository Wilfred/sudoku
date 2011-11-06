(function() {
  var BLANK, BOARDSIZE, GROUPHEIGHT, GROUPWIDTH, SudokuGrid, init, solver, ui;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  GROUPWIDTH = 3;
  GROUPHEIGHT = 3;
  BOARDSIZE = GROUPWIDTH * GROUPHEIGHT;
  BLANK = "";
  SudokuGrid = (function() {
    function SudokuGrid() {
      var x, y, _i, _results;
      this.grid = (function() {
        var _results;
        _results = [];
        for (x = 0; 0 <= BOARDSIZE ? x < BOARDSIZE : x > BOARDSIZE; 0 <= BOARDSIZE ? x++ : x--) {
          _results.push((function() {
            var _results2;
            _results2 = [];
            for (y = 0; 0 <= BOARDSIZE ? y < BOARDSIZE : y > BOARDSIZE; 0 <= BOARDSIZE ? y++ : y--) {
              _results2.push(void 0);
            }
            return _results2;
          })());
        }
        return _results;
      })();
      this.legalValues = (function() {
        _results = [];
        for (var _i = 1; 1 <= BOARDSIZE ? _i <= BOARDSIZE : _i >= BOARDSIZE; 1 <= BOARDSIZE ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
    }
    SudokuGrid.prototype.setFromSelector = function(selector) {
      return selector.each(__bind(function(index, element) {
        var value, x, y;
        x = index % BOARDSIZE;
        y = Math.floor(index / BOARDSIZE);
        value = $(element).val();
        if (value !== "") {
          return this.grid[x][y] = parseInt(value, 10);
        }
      }, this));
    };
    SudokuGrid.prototype.setFromString = function(string) {
      var i, value, x, y, _ref, _results;
      _results = [];
      for (i = 0, _ref = string.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        value = parseInt(string.charAt(i, 10));
        _results.push(__indexOf.call(this.legalValues, value) >= 0 ? (x = i % BOARDSIZE, y = Math.floor(i / BOARDSIZE), this.grid[x][y] = value) : void 0);
      }
      return _results;
    };
    SudokuGrid.prototype.getAsString = function() {
      var string, x, y;
      string = "";
      for (x = 0; 0 <= BOARDSIZE ? x < BOARDSIZE : x > BOARDSIZE; 0 <= BOARDSIZE ? x++ : x--) {
        for (y = 0; 0 <= BOARDSIZE ? y < BOARDSIZE : y > BOARDSIZE; 0 <= BOARDSIZE ? y++ : y--) {
          string = string + (this.grid[x][y] || ".");
        }
      }
      return string;
    };
    SudokuGrid.prototype.clear = function() {
      var i, j, _results;
      _results = [];
      for (i = 0; 0 <= BOARDSIZE ? i < BOARDSIZE : i > BOARDSIZE; 0 <= BOARDSIZE ? i++ : i--) {
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (j = 0; 0 <= BOARDSIZE ? j < BOARDSIZE : j > BOARDSIZE; 0 <= BOARDSIZE ? j++ : j--) {
            _results2.push(this.grid[i][j] = void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    SudokuGrid.prototype.getRow = function(y) {
      var i, _results;
      _results = [];
      for (i = 0; 0 <= BOARDSIZE ? i < BOARDSIZE : i > BOARDSIZE; 0 <= BOARDSIZE ? i++ : i--) {
        _results.push(this.grid[i][y]);
      }
      return _results;
    };
    SudokuGrid.prototype.getColumn = function(x) {
      return this.grid[x];
    };
    SudokuGrid.prototype.getGroup = function(x, y) {
      var group, i, j, _ref, _ref2, _ref3, _ref4;
      group = [];
      for (i = _ref = x * GROUPWIDTH, _ref2 = (x + 1) * GROUPWIDTH; _ref <= _ref2 ? i < _ref2 : i > _ref2; _ref <= _ref2 ? i++ : i--) {
        for (j = _ref3 = y * GROUPHEIGHT, _ref4 = (y + 1) * GROUPHEIGHT; _ref3 <= _ref4 ? j < _ref4 : j > _ref4; _ref3 <= _ref4 ? j++ : j--) {
          group.push(this.grid[i][j]);
        }
      }
      return group;
    };
    SudokuGrid.prototype.getEmptyPositions = function() {
      var emptyPositions, x, y;
      emptyPositions = [];
      for (y = 0; 0 <= BOARDSIZE ? y < BOARDSIZE : y > BOARDSIZE; 0 <= BOARDSIZE ? y++ : y--) {
        for (x = 0; 0 <= BOARDSIZE ? x < BOARDSIZE : x > BOARDSIZE; 0 <= BOARDSIZE ? x++ : x--) {
          if (this.grid[x][y] === void 0) {
            emptyPositions.push({
              x: x,
              y: y
            });
          }
        }
      }
      return emptyPositions;
    };
    SudokuGrid.prototype.isFull = function() {
      var x, y;
      for (x = 0; 0 <= BOARDSIZE ? x < BOARDSIZE : x > BOARDSIZE; 0 <= BOARDSIZE ? x++ : x--) {
        for (y = 0; 0 <= BOARDSIZE ? y < BOARDSIZE : y > BOARDSIZE; 0 <= BOARDSIZE ? y++ : y--) {
          if (this.grid[x][y] === void 0) {
            return false;
          }
        }
      }
      return true;
    };
    SudokuGrid.prototype.getPossibilities = function(x, y) {
      var groupX, groupY, possibilities, value, _i, _len, _ref;
      possibilities = [];
      _ref = this.legalValues;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        value = _ref[_i];
        groupX = Math.floor(x / GROUPWIDTH);
        groupY = Math.floor(y / GROUPHEIGHT);
        if (__indexOf.call(this.getRow(y), value) < 0) {
          if (__indexOf.call(this.getColumn(x), value) < 0) {
            if (__indexOf.call(this.getGroup(groupX, groupY), value) < 0) {
              possibilities.push(value);
            }
          }
        }
      }
      return possibilities;
    };
    SudokuGrid.prototype.isRegionValid = function(region) {
      var seenSoFar, value, _i, _len;
      seenSoFar = {};
      for (_i = 0, _len = region.length; _i < _len; _i++) {
        value = region[_i];
        if (value === void 0) {
          continue;
        }
        if (value in seenSoFar) {
          return false;
        } else {
          seenSoFar[value] = true;
        }
      }
      return true;
    };
    SudokuGrid.prototype.isValid = function() {
      var column, group, i, j, row;
      for (i = 0; 0 <= BOARDSIZE ? i < BOARDSIZE : i > BOARDSIZE; 0 <= BOARDSIZE ? i++ : i--) {
        row = this.getRow(i);
        if (!this.isRegionValid(row)) {
          return false;
        }
      }
      for (j = 0; 0 <= BOARDSIZE ? j < BOARDSIZE : j > BOARDSIZE; 0 <= BOARDSIZE ? j++ : j--) {
        column = this.getColumn(j);
        if (!this.isRegionValid(column)) {
          return false;
        }
      }
      for (i = 0; 0 <= GROUPWIDTH ? i < GROUPWIDTH : i > GROUPWIDTH; 0 <= GROUPWIDTH ? i++ : i--) {
        for (j = 0; 0 <= GROUPWIDTH ? j < GROUPWIDTH : j > GROUPWIDTH; 0 <= GROUPWIDTH ? j++ : j--) {
          group = this.getGroup(i, j);
          if (!this.isRegionValid(group)) {
            return false;
          }
        }
      }
      return true;
    };
    return SudokuGrid;
  })();
  ui = {
    clearTable: function() {
      var blankTable;
      ui.removeUserValuesClass();
      $("#invalid_table").hide();
      blankTable = new SudokuGrid();
      return ui.setTable(blankTable);
    },
    addUserValuesClass: function() {
      return $("#sudoku td input[value!='']").addClass("user_value");
    },
    removeUserValuesClass: function() {
      return $(".user_value").removeClass("user_value");
    },
    checkTableIsValid: function() {
      var currentTable;
      currentTable = new SudokuGrid();
      currentTable.setFromSelector($("#sudoku input"));
      if (!currentTable.isValid()) {
        return $("#invalid_table").show();
      } else {
        return $("#invalid_table").hide();
      }
    },
    getTable: function() {
      var grid;
      grid = new SudokuGrid();
      grid.setFromSelector($('#sudoku input'));
      return grid;
    },
    setTable: function(table) {
      return $("#sudoku tr").each(function(y, element) {
        return $("input", $(element)).each(function(x, element) {
          return $(element).val(table.grid[x][y]);
        });
      });
    }
  };
  solver = {
    getMostContstrainedPosition: function(grid) {
      var emptyPositions, mostConstrainedPosition, position, possibilitiesHere, x, y, _i, _len;
      emptyPositions = grid.getEmptyPositions();
      mostConstrainedPosition = null;
      for (_i = 0, _len = emptyPositions.length; _i < _len; _i++) {
        position = emptyPositions[_i];
        x = position.x;
        y = position.y;
        possibilitiesHere = grid.getPossibilities(x, y);
        if (possibilitiesHere.length === 0) {
          return {
            x: x,
            y: y,
            possibilities: []
          };
        }
        if (!mostConstrainedPosition || possibilitiesHere.length < mostConstrainedPosition.possibilities.length) {
          mostConstrainedPosition = {
            x: x,
            y: y,
            possibilities: possibilitiesHere
          };
        }
      }
      return mostConstrainedPosition;
    },
    findSolution: function(grid) {
      var mostConstrainedPosition, possibility, result, x, y, _i, _len, _ref;
      if (grid.isFull()) {
        return {
          isSolution: true,
          table: grid
        };
      }
      mostConstrainedPosition = solver.getMostContstrainedPosition(grid);
      x = mostConstrainedPosition.x;
      y = mostConstrainedPosition.y;
      _ref = mostConstrainedPosition.possibilities;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        possibility = _ref[_i];
        grid.grid[x][y] = possibility;
        result = solver.findSolution(grid);
        if (result.isSolution) {
          return result;
        }
      }
      grid.grid[x][y] = void 0;
      return {
        isSolution: false,
        table: grid
      };
    }
  };
  init = function() {
    $('button#solve').click(function() {
      var currentTable, endTime, result, solvedTable, startTime;
      ui.addUserValuesClass();
      currentTable = ui.getTable();
      startTime = new Date().getTime();
      result = solver.findSolution(currentTable);
      endTime = new Date().getTime();
      if (typeof console !== "undefined" && console !== null) {
        console.log("Solved in " + (endTime - startTime) + " milliseconds.");
      }
      if (result.isSolution) {
        solvedTable = result.table;
        return ui.setTable(solvedTable);
      } else {
        return ui.removeUserValuesClass;
      }
    });
    $('button#clear_table').click(function() {
      return ui.clearTable();
    });
    $('button#import_puzzle').click(function() {
      var puzzleString, table;
      ui.clearTable();
      puzzleString = prompt("Enter a puzzle string:");
      table = new SudokuGrid();
      table.setFromString(puzzleString);
      ui.setTable(table);
      return ui.checkTableIsValid();
    });
    $('button#export_puzzle').click(function() {
      return alert(ui.getTable().getAsString());
    });
    return $("#sudoku input").keyup(function() {
      return ui.checkTableIsValid();
    });
  };
  init();
  window.ui = ui;
  window.solver = solver;
  window.SudokuGrid = SudokuGrid;
}).call(this);
