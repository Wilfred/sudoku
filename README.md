A sudoku solver, written in CoffeeScript.

Live demo: http://www.wilfred.me.uk/sudoku/

Annotated source: http://www.wilfred.me.uk/sudoku/docs/sudoku.html

GPLv3 license.

### Development

Install CoffeeScript and docco:

    $ sudo npm install -g coffee-script
    $ sudo pacman -S python-pygments # or your distro/platform equivalent
    $ sudo npm install -g docco

Compiling to JavaScript:

    $ coffee -c sudoku.coffee # writes sudoku.js
    
Automatically recompiling on a file change:

    $ coffee -c -w sudoku.coffee
    
Generating annotated source:

    $ docco sudoku.coffee
