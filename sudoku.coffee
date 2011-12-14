# # Sudoku Solver
#
# A sudoku solver that solves abitrary size grids using a simple
# backtracking algorithm.

# Grid dimensions. The solver itself can handle a grid of any size,
# but currently this isn't exposed in the UI. As a result, dimensions
# are currently set as constants.
#
# The grid is made up of groups which are rectangular, although the
# overall grid is always square.
GROUPWIDTH = 3;
GROUPHEIGHT = 3;
BOARDSIZE = GROUPWIDTH * GROUPHEIGHT

# TODO: move away from undefined to this for consistency
# (currently this only used in the frontend)
BLANK = ""

# The Sudoku model. The grid itself is a 2D array, so it can be
# accessed with `@grid[x][y]`. Previously there were `@get` and `@set`
# methods, but profiling suggested they were affecting
# performance. Further benchmarking is needed, particulary after more
# heuristics are added.
class SudokuGrid
  # Create an empty grid.
  constructor: () ->
    @grid = for x in [0...BOARDSIZE]
      for y in [0...BOARDSIZE]
        undefined

    @legalValues = [1..BOARDSIZE]

  # Set this grid based on the text inputs in this selector
  setFromSelector: (selector) ->
    selector.each (index, element) =>
      x = index % BOARDSIZE
      y = Math.floor(index / BOARDSIZE)

      value = $(element).val()
      if value != ""
        @grid[x][y] = parseInt(value, 10)

  # Set this table based on a string of characters specifying it
  #
  # e.g. `".......12........3..23..4....18....5.6..7.8.......9.....85.....9...4.5..47...6..."`
  setFromString: (string) ->
    for i in [0...string.length]
      value = parseInt(string.charAt i, 10)

      # skip '.'
      if value in @legalValues
        x = i % BOARDSIZE
        y = Math.floor(i / BOARDSIZE)
        @grid[x][y] = value

  # Get a string of the current grid values, in the same format as `setFromString`.
  getAsString: () ->
    string = ""
    for x in [0...BOARDSIZE]
      for y in [0...BOARDSIZE]
        string = string + (@grid[x][y] or ".")

    string

  clear: () ->
    for i in [0...BOARDSIZE]
      for j in [0...BOARDSIZE]
        @grid[i][j] = undefined

  # Get row at height `y`, where 0 is the top.
  getRow: (y) ->
    for i in [0...BOARDSIZE]
      @grid[i][y]

  # Get column which is `x` across, where 0 is leftmost.
  getColumn: (x) ->
    @grid[x]

  # Get the group which is `x` groups across and `y` groups down,
  # returning a 1-D array.
  getGroup: (x, y) ->
    group = []
    for i in [x * GROUPWIDTH...(x+1) * GROUPWIDTH]
      for j in [y * GROUPHEIGHT...(y+1) * GROUPHEIGHT]
        group.push(@grid[i][j])

    group

  # Get an array of co-ordinates of all the blank squares. We
  # deliberately iterate over `x` in the inner loop, as it produces
  # more attractive results when 'solving' an empty grid.
  getEmptyPositions: () ->
    emptyPositions = []

    for y in [0...BOARDSIZE]
      for x in [0...BOARDSIZE]
        if @grid[x][y] == undefined
          emptyPositions.push {x, y}

    emptyPositions

  # Does every position on this grid have a value?
  isFull: () ->
    for x in [0...BOARDSIZE]
      for y in [0...BOARDSIZE]
        if @grid[x][y] == undefined
          return false

    true

  # Get all the possible values that can go in this position, based
  # on neighbours.
  getPossibilities: (x, y) ->
    possibilities = []

    for value in @legalValues
      groupX = Math.floor(x / GROUPWIDTH)
      groupY = Math.floor(y / GROUPHEIGHT)

      if value not in @getRow(y)
        if value not in @getColumn(x)
          if value not in @getGroup(groupX, groupY)
            possibilities.push(value)

    possibilities

  # Check that a given array contains no duplicates
  # (other than empty regions).
  isRegionValid: (region) ->
    seenSoFar = {}

    for value in region
      if value == undefined
        continue

      if value of seenSoFar
        return false
      else
        seenSoFar[value] = true

    return true

  # Could this table be a valid solution, or part of
  # one? We tolerate blanks.
  #
  # Note that we only check for obvious errors in a row, column
  # or group, so it is still possible for an invalid grid to
  # return true here.
  isValid: () ->
    # Check rows.
    for i in [0...BOARDSIZE]
      row = @getRow i
      if not @isRegionValid row
        return false

    # Check columns.
    for j in [0...BOARDSIZE]
      column = @getColumn j
      if not @isRegionValid column
        return false

    # Check groups.
    for i in [0...GROUPWIDTH]
      for j in [0...GROUPWIDTH]
        group = @getGroup i, j

        if not @isRegionValid group
          return false

    return true

# ## UI utilities
ui =
  # Set the table in the DOM to be blank.
  clearTable: () ->
    ui.removeUserValuesClass()
    $("#invalid_table").hide()

    blankTable = new SudokuGrid()
    ui.setTable blankTable

  # Add an additional class to user-provided cells, so
  # we can style them differently.
  addUserValuesClass: () ->
    # the user's input is the non-empty cells
    $("#sudoku td input[value!='']").addClass "user_value"

  # Undoes `addUserValuesClass`.
  removeUserValuesClass: () ->
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
        $(element).val(table.grid[x][y])

# ## Solver
# Our solver uses a backtracking cross-off algorithm.
solver =
  # Given a sudoku grid, find the position with the fewest possibilities.
  #
  # Note that an invalid grid has positions with no possibilities.
  getMostContstrainedPosition: (grid) ->
    mostConstrainedPosition = null

    for {x: x, y: y} in grid.getEmptyPositions()
      possibilitiesHere = grid.getPossibilities x, y

      if possibilitiesHere.length == 0
        # We will never find a more constrained position, so terminate early.
        return {x: x, y: y, possibilities: []}

      # If this position is more constrained, update mostConstrainedPosition.
      if not mostConstrainedPosition or possibilitiesHere.length < mostConstrainedPosition.possibilities.length
        mostConstrainedPosition = {x: x, y: y, possibilities: possibilitiesHere}

    mostConstrainedPosition

  # Given a sudoku grid, find a soution with a backtracking
  # brute-force algorithm, starting with the most constrained
  # positions.
  findSolution: (grid) ->
    if grid.isFull()
      return {isSolution: true, table: grid}

    {x: x, y: y, possibilities: possibilities} = solver.getMostContstrainedPosition grid

    # Try each of the possible values in this empty square until we
    # find the correct one.
    for possibility in possibilities
      grid.grid[x][y] = possibility

      result = solver.findSolution grid
      if result.isSolution
        # Found a solution on this branch! hurrah!
        return result

    # If we get here, this table is now unsolvable since
    # there's a position with no possibilities.
    # So we reset this square to blank for backtracking.
    grid.grid[x][y] = undefined

    return {isSolution: false, table: grid}

init = () ->

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

  $('button#export_puzzle').click ->
    alert ui.getTable().getAsString()

  # Monitor table for changes, and warn immediately if the grid is invalid.
  $("#sudoku input").keyup ->
    ui.checkTableIsValid()

init()

# We attach our objects to the global object so it's easy to fiddle
# with things in the browser console.
window.ui = ui
window.solver = solver
window.SudokuGrid = SudokuGrid