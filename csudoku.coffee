# TODO: pass these to the grid, so it handles any size grid
GROUPWIDTH = 3;
GROUPHEIGHT = 3;

# board height = board width, since a sudoku board is square
BOARDSIZE = GROUPWIDTH * GROUPHEIGHT

# TODO: move away from undefined to this for consistency
# (currently this only used in the frontend)
BLANK = ""

# TODO: make table / grid terminology consistent
# TODO: make square / position terminology consistent
# TODO: test / warn when user enters invalid value
# TODO: move to Twitter bootstrap
# TODO: add 'unsolvable' / multiple solutions warnings / errors

class SudokuGrid
  constructor: () ->
    # create an empty grid
    @grid = for x in [0...BOARDSIZE]
      for y in [0...BOARDSIZE]
        undefined

  set: (x, y, value) ->
    @grid[x][y] = value

  get: (x, y) ->
    @grid[x][y]

  # get all the legal values for the board
  getPossibleValues: () -> [1..BOARDSIZE]

  setFromSelector: (selector) ->
    # set this grid based on the text inputs in this selector
    selector.each (index, element) =>
      x = index % BOARDSIZE
      y = Math.floor(index / BOARDSIZE)

      value = $(element).val()
      if value != ""
        @set x, y, parseInt(value, 10)

  setFromString: (string) ->
    # set this table based on a string of characters specifying it
    # e.g. ".......12........3..23..4....18....5.6..7.8.......9.....85.....9...4.5..47...6..."
    for i in [0...string.length]
      value = parseInt(string.charAt i, 10)

      # skip '.'
      if value in @getPossibleValues()
        x = i % BOARDSIZE
        y = Math.floor(i / BOARDSIZE)
        @set x, y, value

  getAsString: () ->
    string = ""
    for x in [0...BOARDSIZE]
      for y in [0...BOARDSIZE]
        string = string + @get x, y

    string

  clear: () ->
    for i in [0...BOARDSIZE]
      for j in [0...BOARDSIZE]
        @set(i, j, undefined)

  getRow: (y) ->
    # get row at height y, where 0 is the top
    for i in [0...BOARDSIZE]
      @get i, y

  getColumn: (x) ->
    # get column which is x across, where 0 is leftmost
    for i in [0...BOARDSIZE]
      @get x, i

  getGroup: (x, y) ->
    # get the group which is x groups across and y groups down
    # returning a 1-D array
    group = []
    for i in [x * GROUPWIDTH...(x+1) * GROUPWIDTH]
      for j in [y * GROUPHEIGHT...(y+1) * GROUPHEIGHT]
        group.push(@get i, j)

    group

  getEmptyPositions: () ->
    # get an array of co-ordinates of all the blank squares
    # deliberately iterating over x in the inner loop as it often
    # produces more attractive (IMHO) results
    emptyPositions = []

    for y in [0...BOARDSIZE]
      for x in [0...BOARDSIZE]
        if @get(x, y) == undefined
          emptyPositions.push {x, y}

    emptyPositions

  isFull: () ->
    # does every position on this grid have a value?
    for x in [0...BOARDSIZE]
      for y in [0...BOARDSIZE]
        if @get(x, y) == undefined
          return false

    true

  getPossibilities: (x, y) ->
    # get all the possible values that can go in this position, based
    # on neighbours
    possibilities = []

    for value in @getPossibleValues()
      groupX = Math.floor(x / GROUPWIDTH)
      groupY = Math.floor(y / GROUPHEIGHT)

      if value not in @getRow(y)
        if value not in @getColumn(x)
          if value not in @getGroup(groupX, groupY)
            possibilities.push(value)

    possibilities

  isRegionValid: (region) ->
    # check that a given array contains no duplicates
    # (other than empty regions)
    seenSoFar = {}

    for value in region
      if value == undefined
        continue

      if value of seenSoFar
        return false
      else
        seenSoFar[value] = true

    return true

  isValid: () ->
    # could this table be a valid solution, or part of
    # one? We tolerate blanks

    # note that we only check for obvious errors in a row, column
    # or group, so it is still possible for an invalid grid to
    # return true here

    # check rows
    for i in [0...BOARDSIZE]
      row = @getRow i
      if not @isRegionValid row
        return false

    # check columns
    for j in [0...BOARDSIZE]
      column = @getColumn j
      if not @isRegionValid column
        return false

    for i in [0...GROUPWIDTH]
      for j in [0...GROUPWIDTH]
        group = @getGroup i, j

        if not @isRegionValid group
          return false

    return true

# ui utilities are in a separate namespace
ui =
  clearTable: () ->
    # set the table in the DOM to be blank
    ui.removeUserValuesClass()
    # TODO: this should be wrapped into a function:
    $("#invalid_table").hide()

    blankTable = new SudokuGrid()
    ui.setTable blankTable

  addUserValuesClass: () ->
    # add an additional class to user-provided cells, so
    # we can style them differently

    # user's input is the non-empty cells
    $("#sudoku td input[value!='']").addClass "user_value"

  removeUserValuesClass: () ->
    # undoes addUserValuesClass
    $(".user_value").removeClass "user_value"

  checkTableIsValid: () ->
    currentTable = new SudokuGrid()
    currentTable.setFromSelector $("#sudoku input")

    if not currentTable.isValid()
      $("#invalid_table").show()
    else
      $("#invalid_table").hide()

  getTable: () ->
    grid = new SudokuGrid()
    grid.setFromSelector $('#sudoku input')

    grid

  setTable: (table) ->
    # go over every row
    $("#sudoku tr").each (y, element) ->
      # then go over ever input in that row
      $("input", $(element)).each (x, element) ->
        # set this input to the table value at this point
        $(element).val(table.get x, y)

# we solve using a backtracking cross-off algorithm
solver =
  getMostContstrainedPosition: (grid) ->
    # given a sudoku grid, find the position with the fewest possibilities
    # note that an invalid grid has positions with no possibilities
    # {x: 1, y: 0, possibilities: [2,3,6]}
    emptyPositions = grid.getEmptyPositions()

    mostConstrainedPosition = null

    for position in emptyPositions
      x = position.x
      y = position.y

      possibilitiesHere = grid.getPossibilities x, y

      if possibilitiesHere.length == 0
        # we will never find a more constrained position, so terminate early
        return {x: x, y: y, possibilities: []}

      # if this position is more constrained, update mostConstrainedPosition
      if not mostConstrainedPosition or possibilitiesHere.length < mostConstrainedPosition.possibilities.length
        mostConstrainedPosition = {x: x, y: y, possibilities: possibilitiesHere}

    mostConstrainedPosition

  findSolution: (grid) ->
    # given a sudoku grid, use a backtracking brute-force
    # algorithm, starting with the most constrained
    # positions
    if grid.isFull()
      return {isSolution: true, table: grid}

    mostConstrainedPosition = solver.getMostContstrainedPosition grid

    x = mostConstrainedPosition.x
    y = mostConstrainedPosition.y

    # try each of the possible values in this
    # empty square until we find the correct one
    for possibility in mostConstrainedPosition.possibilities
      grid.set x, y, possibility

      result = solver.findSolution grid
      if result.isSolution
        # found a solution on this branch! hurrah!
        return result

    # if we get here, this table is now unsolvable since
    # there's a position with no possibilities

    # so we reset this square to blank for backtracking
    grid.grid[x][y] = undefined

    return {isSolution: false, table: grid}

init = () ->
  # todo: this ought to be wrapped in a named function
  $('button#solve').click ->
    ui.addUserValuesClass()

    currentTable = ui.getTable()

    startTime = new Date().getTime()

    result = solver.findSolution currentTable

    endTime = new Date().getTime()
    console?.log "Solved in #{endTime - startTime} milliseconds."

    if result.isSolution
      solvedTable = result.table
      ui.setTable solvedTable
    else
      ui.removeUserValuesClass

  $('button#clear_table').click ->
    ui.clearTable()

  $('button#import_puzzle').click ->
    ui.clearTable()

    puzzleString = prompt("Enter a puzzle string:");

    table = new SudokuGrid()
    table.setFromString(puzzleString)
    ui.setTable(table)
    ui.checkTableIsValid()

  # monitor table for changes, and warn immediately if the grid is invalid
  $("#sudoku input").keyup ->
    ui.checkTableIsValid()

init()

window.ui = ui
window.solver = solver
window.SudokuGrid = SudokuGrid