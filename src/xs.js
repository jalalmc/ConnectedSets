// xs.js

( function( exports ) {
  /* -------------------------------------------------------------------------------------------
     nil_function()
  */
  function nil_function() {}
  
  /* -------------------------------------------------------------------------------------------
     extend( destination, source [, source_1 ... ] )
  */
  function extend( d ) {
    var l = arguments.length;
    
    if ( !d ) d = {};
    
    for ( var i = 0; ++i < l; ) {
      var s = arguments[ i ];

      if ( s ) for ( var p in s ) if ( s.hasOwnProperty( p ) ) d[ p ] = s[ p ];
    }
    
    return d;
  } // extend()
  
  /* -------------------------------------------------------------------------------------------
     log( message )
  */
  var log;
  
  if ( typeof console != "object" || typeof console.log != "function" ) {
    // Browsers that do not have a console.log()
    log = nil_function;
    log.s = nil_function;
  } else {
    log = function( message ) {
      var date = new Date
        , year     = "" + date.getFullYear()
        , month    = "" + ( date.getMonth() + 1 )
        , day      = "" + date.getDate()
        , hour     = "" + date.getHours()
        , minutes  = "" + date.getMinutes()
        , seconds  = "" + date.getSeconds()
        , ms       = "" + date.getMilliseconds()
      ;
      
      if ( month  .length < 2 ) month    = "0" + month
      if ( day    .length < 2 ) day      = "0" + day;
      if ( hour   .length < 2 ) hour     = "0" + hour;
      if ( minutes.length < 2 ) minutes  = "0" + minutes;
      if ( seconds.length < 2 ) seconds  = "0" + seconds;
      
      switch( ms.length ) {
        case 2: ms =  "0" + ms; break;
        case 1: ms = "00" + ms; break;
      }
      
      console.log( year + '/' + month + '/' + day
        + ' ' + hour + ':' + minutes + ':' + seconds + '.' + ms
        + ' - ' + message
      );
    } // log()
    
    log.s = JSON.stringify;
  }
  
  /* -------------------------------------------------------------------------------------------
     subclass( base, f )
  */
  function subclass( base, f ) {
    return ( f.prototype = Object.create( base.prototype ) ).constructor = f;
  } // subclass()
  
  /* -------------------------------------------------------------------------------------------
     export_code( namespace, exports )
     
     Generate pretty code to export public attributes
  */
  function export_code( namespace, exports ) {
    var max = Math.max.apply( Math, exports.map( function( v ) { return v.length } ) );
    
    for ( var s = '', i = -1; ++i < max; ) s += ' ';
    
    exports.unshift(
      '\n  var ' + namespace + ' = exports.' + namespace + ' = ' + namespace + ' || {};\n'
    );
    
    var export_code = exports.reduce(
      function( r, f ) {
        return r + '\n  XS.' + ( f + s ).substr( 0, max ) + " = " + f + ';'
      }
    );
    
    de&&ug( "exports:" + export_code );
    
    return export_code;
  } // export_code()
  
  /* -------------------------------------------------------------------------------------------
     de&&ug()
  */
  var de = true;
  
  function ug( m ) {
    log( "xs, " + m );
  } // ug()
  
  /* -------------------------------------------------------------------------------------------
     Pretty JavaScript code generator
  */
  function Code( name ) {
    this.name = name;
    this.code = '';
    this.indent = '  ';
    this.blocs = [];
    
    return this;
  } // Code()
  
  Code.decompile = function( f ) {
    if ( typeof f !== 'function' ) return f;
    
    var s = f.toString();
    
    var parsed = /function\s*\((.*)\)\s*{\s*(.*)\s*return\s*(.*);\s*}/.exec( s );
    
    if ( f ) {
      parsed = { parameters: parsed[ 1 ], code: parsed[ 2 ], condition: parsed[ 3 ], f: f };
      
      de&&ug( 'Code.decompile(), parsed:' + log.s( parsed ) + ', function: ' + s );
      
      return parsed;
    }
    
    return f;
  } // Code.decompile()
  
  extend( Code.prototype, {
    get: function() {
      de&&ug( "Code:\n" + this.code );
      
      return this.code;
    }, // get()
    
    eval: function() {
      de&&ug( "Code.eval: name: " + this.name + ', code:\n' + this.code );
      
      return eval( this.code );
    }, // eval()
    
    line: function( line, new_lines ) {
      if ( line !== undefined ) this.code += this.indent + line + '\n';
      
      if ( new_lines ) while( new_lines-- ) this.code += '\n';
      
      return this;
    }, // add()
    
    add: function( statement, new_lines ) {
      return this.line( statement + ';', new_lines );
    }, // add()
    
    comment: function( comment ) {
      return this.line( '// ' + comment );
    }, // comment()
    
    begin: function( code ) {
      this.line( code + ' {' );
      
      this.blocs.push( code );
      
      this.indent += '  ';
      
      return this;
    }, // begin()
    
    end: function( comment ) {
      var code = this.blocs.pop();
      
      if ( code === undefined ) throw new Code.Syntax_Error( "Missing matching opening block" );
      
      this.indent = this.indent.substr( 2 );
      
      if ( comment === true ) {
        comment = '// ' + code;
      } else if ( comment ) {
        comment = '// ' + comment;
      } else {
        comment = '';
      }
      
      return this.line( '} ' + comment, 1 );
    }, // end()
    
    procedure: function( lvalue, name, parameters ) {
      var code = '';
      
      if ( lvalue ) code += lvalue + ' ';
      
      code += 'function';
      
      if ( name ) code += ' ' + name;
      
      code += '( ' + parameters.join( ', ' ) + ' )';
      
      return this.begin( code );
    }, // procedure()
    
    variable: function( v ) {
      return this.add( 'var ' + v, 1 );
    }, // variable()
    
    vars: function( vars ) {
      return this.add( 'var ' + vars.join( ', ' ), 1 );
    }, // vars()
    
    vars_from_object: function( object, attributes ) {
      if ( typeof attributes !== "object" || ! attributes instanceof Array ) throw new Code.Error( "Missing attributes" );
      
      var l = attributes.length;
      
      if ( ! l ) return this;
      
      var vars = [];
      
      for( var i = -1; ++i < l; ) {
        var a = attributes[ i ];
        
        vars.push( '_' + a + ' = ' + object + '.' + a );
      }
      
      return this.vars( vars );
    }, // vars_from_object()
    
    loop: function( init, condition, step ) {
      return this.begin( 'for( ' + ( init || '' ) + '; ' + ( condition || '' ) + '; ' + ( step || '' ) + ' )' );
    }, // loop()
    
    unrolled_while: function( first, inner, last, count ) {
      inner || ( inner = first );
      count || ( count = 200 / inner.length >> 0 );
      
      if ( inner.charAt( inner.length - 1 ) === ';' ) {
        var inner_is_statement = true;
      }
      
      if ( count > 1 ) {
        var indent = '\n  ' + this.indent;
        
        this
          .variable( 'ul = l - l % ' + count + ' - 1' )
          
          .begin( 'while( i < ul )' );
          
            if ( inner_is_statement ) {
              this
                .line( first )
                .repeat( count - 1, inner )
                .line( last )
              ;
            } else {
              this.add( first + repeat( count - 1, inner, indent + '  ' ) + indent + ( last || '' ) );
            }
            
          this
          .end()
          
          .add( 'ul = l - 1' )
        ;
      } else {
        this.var( 'ul = l - 1' );
      }
      
      this
        .begin( 'while( i < ul )' )
          [ inner_is_statement ? 'line' : 'add' ]( first + ( last ? ' ' + last : '' ) )
        .end()
      ;
      
      return this;
      
      function repeat( count, code, indent ) {
        var c = '';
        
        for ( var i = -1; ++i < count; ) c += indent + code;
        
        return c;
      }
    }, // unfolded_loop()
    
    repeat: function( count, code ) {
      for ( var i = -1; ++i < count; ) this.line( code );
      
      return this;
    } // repeat()
  } ); // Code instance methods
  
  /* -------------------------------------------------------------------------------------------
     Connection()
  */
  function Connection( options ) {
    this.options = options = options || {};
    
    this.key = options.key || [ "id" ];
    
    this.connections = [];
    
    return this;
  } // Connection()
  
  extend( Connection.prototype, {
    notify: function( transaction ) {
      var l = transaction.length;
      
      for ( var i = -1; ++i < l; ) {
        var a = transaction[ i ].action;
        
        if ( ! this[ a ] ) throw( new Unsuported_Method( a ) );
      }
      
      for ( var i = -1; ++i < l; ) {
        var a = transaction[ i ];
        
        this[ a.action ]( a.objects );
      }
      
      return this;
    }, // notify()
    
    notify_connections: function( transaction ) {
      var connections = this.connections, l = connections.length;
      
      for ( var i = -1; ++i < l; ) connections[ i ].notify( transaction );
      
      return this;
    }, // notify_connections()
    
    connections_add: function( added ) {
      var connections = this.connections, l = connections.length;
      
      for ( var i = -1; ++i < l; ) connections[ i ].add( added );
      
      return this;
    }, // connections_add()
    
    connections_update: function( updated ) {
      var connections = this.connections, l = connections.length;
      
      for ( var i = -1; ++i < l; ) connections[ i ].update( updated );
      
      return this;
    }, // connections_update()
    
    connections_remove: function( removed ) {
      var connections = this.connections, l = connections.length;
      
      for ( var i = -1; ++i < l; ) connections[ i ].remove( removed );
      
      return this;
    }, // connections_remove()
    
    connect: function( connection ) {
      this.connections.push( connection );
      
      return this;
    }, // connect()
    
    make_key: function( o ) {
      var key = this.key, l = key.length, code = [];
      
      for ( var i = -1; ++i < l; ) code.push( 'o.' + key[ i ] );
      
      eval( new Code()
        .procedure( 'this.make_key =', null, [ 'o' ] )
          .add( "return '' + " + code.join( " + '#' + " ) )
        .end( 'make_key()' )
        .get()
      );
      
      return this.make_key( o );
    }, // make_key()
    
    set: function( options ) {
      var s = new Set( extend( { key: this.key }, options ) );
      
      this.connect( s );
      
      return s;
    }, // set()
    
    filter: function( filter, options ) {
      var f = new Filter( this, filter, extend( { key: this.key }, options ) );
      
      return f.out; // ToDo: Filter should not build a set
    }, // filter()
    
    order: function( organizer, options ) {
      var s = new Ordered_Set( [], organizer, extend( { key: this.key }, options ) );
      
      this.connect( s );
      
      return s;
    }, // order()
    
    table: function( node, columns, options ) {
      var t = new XS.table( node, columns, extend( { key: this.key }, options ) );
      
      this.connect( t );
      
      return t;
    } // table
  } ); // Connection instance methods
  
  /* -------------------------------------------------------------------------------------------
     Set( a [, options] )
  */
  function Set( a, options ) {
    options = Connection.call( this, options ).options;
    
    this.a = [];
    
    a && this.add( a )
    
    de&&ug( "New Set, name: " + options.name + ", length: " + this.a.length );
    
    return this;
  } // Set()
  
  subclass( Connection, Set );
  
  var push = Array.prototype.push;
  
  /* -------------------------------------------------------------------------------------------
     Set instance methods
  */
  extend( Set.prototype, {
    get: function() {
      return this.a;
    }, // get()
    
    connect: function( connection ) {
      this.connections.push( connection );
      
      connection.add( this.get() );
      
      return this;
    }, // connect()
    
    add: function( objects ) {
      push.apply( this.a, objects );
      
      return this.connections_add( objects );
    }, // add()
    
    update: function( objects ) {
      for ( var i = -1, l = objects.length, updated = []; ++i < l; ) {
        var o = objects[ i ]
          , p = this.index_of( o[ 0 ] )
        ;
        
        if ( p === -1 ) continue;
        
        this.a[ p ] = o[ 1 ];
        
        updated.push( o );
      }
      
      return this.connections_update( updated );
    }, // update()
    
    remove: function( objects ) {
      for ( var i = -1, l = objects.length, removed = []; ++i < l; ) {
        var o = objects[ i ]
          , p = this.index_of( o )
          , a = this.a
        ;
        
        if ( p === 0 ) {
          a.shift();
        } else if ( p === a.length - 1 ) {
          a.pop();
        } else if ( p !== -1 ) {
          a.splice( p, 1 );
        } else {
          continue;
        }
        
        removed.push( o ); 
      }
      
      return this.connections_remove( removed );
    }, // remove()
    
    index_of: function( o ) {
      return this.make_index_of().index_of( o ); 
    }, // index_of()
    
    make_index_of: function() {
      var key = this.key, l = key.length;
      
      var vars = [ 'a = this.a', 'l = a.length', 'i = -1' ];
      
      var first, inner, last;
      
      if ( l > 1 ) {
        vars.push( 'r' );
        
        var tests = [];
        
        for( var i = -1; ++i < l; ) {
          var field = key[ i ];
          
          tests.push( ( i === 0 ? '( r = a[ ++i ] ).' : 'r.' ) + field + ' === _' + field );
        }
        
        first = 'if ( ' + tests.join( ' && ' ) + ' ) return i;';
      } else {
        var field = key[ 0 ]
          , test = 'a[ ++i ].' + field + ' === _' + field
        ;
        
        first = 'if ( ' + test;
        inner = '|| ' + test;
        last  = ') return i';
      }
      
      var code = new Code( 'index_of' )
        .procedure( 'this.index_of =', null, [ 'o' ] )
          .vars( vars )
          .vars_from_object( 'o', key ) // Local variables for key
          .unrolled_while( first, inner, last )
          .add( 'return -1' )
        .end( 'index_of()' )
        .get()
      ;
      
      eval( code );
      
      return this;
    } // make_index_of()
  } ); // Set instance methods
  
  /* -------------------------------------------------------------------------------------------
     Filter()
  */
  function Filter( set, filter, options ) {
    Connection.call( this, options );
    
    this.filter = filter;
    
    this.out = new Set( [], { key: set.key } );
    
    set.connect( this );
    
    return this;
  } // Filter()
  
  subclass( Connection, Filter );
  
  extend( Filter.prototype, {
    add: function( objects ) {
      var filter = this.filter = Code.decompile( this.filter )
        , vars = [ 'i = -1', 'l = objects.length', 'added = []', 'o' ]
        , first
      ;
      
      switch( typeof filter ) {
        case 'function':
          vars.push( 'f = filter' );
          
          first = 'if ( f( o = objects[ ++i ] ) ) added.push( o );';
        break;
        
        case 'object': // { parameters: [], code: '', condition: '' }
          first = 'o = objects[ ++i ]; ' + filter.code + ' if ( ' + filter.condition + ' ) added.push( o );'
        break;
      }
      
      eval( new Code()
        .procedure( 'this.add =', null, [ 'objects' ] )
          .vars( vars )
          
          .unrolled_while( first )
          
          .add( 'added.length && this.out.add( added )', 1 )
          
          .add( 'return this' )
        .end( 'Filter.add()' )
        .get()
      );
      
      return this.add( objects );
    }, // add()
    
    remove: function( objects ) {
      var filter = this.filter = Code.decompile( this.filter )
        , vars = [ 'i = -1', 'l = objects.length', 'removed = []', 'o' ]
        , first
      ;
      
      switch( typeof filter ) {
        case 'function':
          vars.push( 'f = filter' );
          
          first = 'if ( f( o = objects[ ++i ] ) ) removed.push( o );'
        break;
        
        case 'object':
           first = 'o = objects[ ++i ]; ' + filter.code + ' if ( ' + filter.condition + ' ) removed.push( o );'
        break;
      }
      
      eval( new Code()
        .procedure( 'this.remove =', null, [ 'objects' ] )
          .vars( [ 'i = -1', 'l = objects.length', 'filter = this.filter', 'removed = []', 'o' ] )
          
          .unrolled_while( first )
          
          .add( 'removed.length && this.out.remove( removed )', 1 )

          .add( 'return this' )
        .end( 'Filter.remove()' )
        .get()
      );
      
      return this.remove( objects );
    }, // remove()
    
    update: function( updates ) {
      var filter = this.filter;
      
      switch( typeof filter ) {
        case 'object':
          filter = filter.f;
        // fall-through
        
        case 'function':
          this.update = function( updates ) {
            var l = updates.length, f = filter, removed = [], updated = [], added = [];
            
            for ( var i = -1; ++i < l; ) {
              var u = updates[ i ];
              
              if ( f( u[ 0 ] ) ) {
                if ( f( u[ 1 ] ) ) {
                  updated.push( u );
                } else {
                  removed.push( u[ 0 ] );
                }
              } else if ( f( u[ 1 ] ) ) {
                added.push( u[ 1 ] );
              }
            }
            
            removed.length && this.out.remove( removed );
            updated.length && this.out.update( updated );
            added  .length && this.out.add   ( added   );
            
            return this;
          };
          
          return this.update( updates );
        break;
      }
    } // update()
  } ); // Filter instance methods
  
  /* -------------------------------------------------------------------------------------------
     Ordered_Set_Organizer()
  */
  function Ordered_Set_Organizer( organizer, ordered_set, options ) {
    Connection.call( this, options );
    
    this.ordered_set = ordered_set;
    this.organizer = organizer;
    
    if ( organizer instanceof Set ) {
      organizer.connect( this );
    } else {
      this.add( organizer );
    }
    
    return this;
  } // Ordered_Set_Organizer()
  
  subclass( Connection, Ordered_Set_Organizer );
  
  var p = Ordered_Set_Organizer.prototype;
  
  p.add = p.remove = p.update = function() {
    var organizer = this.organizer;
    
    switch( typeof organizer ) {
      case 'function':
        this.ordered_set.sort( organizer );
      return this;
      
      case 'object':
        if ( organizer !== null ) {
          if ( organizer instanceof Set ) {
            organizer = organizer.get();
            
            break;
          }
          
          if ( organizer instanceof Array ) break;
        }
      // fall-through
      
      default: throw new Error( 'Ordered_Set.update_organizer(), missing organizer function or Array or Set' );
    }
    
    var code = new Code( 'organizer' )
      .procedure( 'organizer =', null, [ 'a', 'b' ] )
        .vars( [ 'u', 'x', 'y' ] );
        
        for ( var i = -1; ++i < organizer.length; ) {
          var d = organizer[ i ], inferior, superior; 
          
          if ( d.descending ) {
            inferior = ' 1';
            superior = '-1';
          } else {
            inferior = '-1';
            superior = ' 1';
          }
          
          code
            .begin( 'if ( ( x = a.' + d.id + ' ) !== ( y = b.' + d.id + ' ) )' )
              .add(   'if ( x === u    ) return ' + inferior )
              .add(   'if ( y === u    ) return ' + superior )
              .add(   'if ( x === null ) return ' + inferior )
              .add(   'if ( y === null ) return ' + superior )
              .add(   'if ( x < y      ) return ' + inferior )
              .add(   'if ( x > y      ) return ' + superior )
            .end()
          ;
        }
        
        code.add( 'return 0' )
      .end( 'organizer()' )
    ;
    
    eval( code.get() );
    
    this.ordered_set.sort( organizer );
    
    return this;
  };
  
  /* -------------------------------------------------------------------------------------------
     Ordered_Set()
  */
  function Ordered_Set( a, organizer, options ) {
    Set.call( this, a, options );
    
    this.ordered_set_organizer = new Ordered_Set_Organizer( organizer, this, options );
    
    return this;
  } // Ordered_Set()
  
  subclass( Set, Ordered_Set );
  
  extend( Ordered_Set.prototype, {
    sort: function( organizer ) {
      this.a.sort( this.organizer = organizer );
      
      return this;
    }, // sort()
    
    locate: function( objects, exact ) {
      var u, start = 0, stop = this.a.length, n = objects.length, step, guess = 0
        , locations = [], previous
        , that = this, options = this.options
      ;
      
      for ( var i = -1; ++i < n; guess += step ) {
        var o = objects[ i ]
          , location = { o: o, guess: Math.floor( guess ), previous: previous, start: start, stop: stop }
        ;
        
        if ( o instanceof Array ) { // updates
          location.o = o[ 0 ];
          location.update = o[ 1 ];
        }
        
        if ( previous ) previous.next = location;
        
        locations.push( previous = location );
        
        if ( i === 0 ) {
          locate( this.a, this.organizer, locations, 0, 1, exact );
          
          guess = start = location.insert ? location.insert - 1 : location.insert;
          step = ( stop - start ) / n; // could be zero is insert === stop, inserting all further objects at the end
        }
      }
      
      return locate( this.a, this.organizer, locations, 1, n, exact );
      
      function locate( a, organizer, locations, begin, end, exact ) {
        if ( begin >= end ) return locations;
        
        // de&&ug( "Ordered_Set.locate(), start locations: " + log.s( locations, replacer ) );
        
        var u, some_not_located = true, count = 0, start;
        
        while( some_not_located ) {
          some_not_located = false;
          
          for ( var i = begin - 1; ++i < end; ) {
            if ( ++count > 1000000 ) throw Error( "Infinite loop, locations: " + log.s( locations, replacer ) );
            
            var location = locations[ i ];
            
            if ( location.located ) continue;
            
            var guess = location.guess, stop = location.stop;
            
            if ( guess === stop ) {
              location.located = true;
              location.insert = guess;
              
              continue;
            }
            
            var o = location.o;
            
            if ( ( location.order = organizer( a[ guess ], o ) ) === 0 ) {
              location.located = true;
              
              var insert = guess;
              
              if ( exact ) {
                var key = that.make_key( o ), make_key = that.make_key;
              }
              
              stop = a.length; // Search for a matching key could go beyond ordered search  
              
              while ( true ) {
                if ( exact && location.found === u && key === make_key( a[ insert ] ) ) {
                  location.found = insert;
                }
                
                if ( options.insert_before ) {
                  if ( insert === 0 || organizer( a[ insert - 1 ], o ) ) break;
                  
                  insert -= 1;
                } else {
                  // Position insert after last object equal to searched object
                  if ( ++insert >= stop || organizer( a[ insert ], o ) ) break;
                }
              }
              
              location.insert = insert;
              
              if ( exact && location.found === u ) {
                while( true ) {
                  if ( options.insert_before ) {
                    if ( ++guess >= stop || organizer( a[ guess ], o ) ) break;
                  } else {
                    if ( guess === 0 || organizer( a[ guess - 1 ], o ) ) break;
                    
                    guess -= 1;
                  }
                  
                  if ( key === make_key( a[ guess ] ) ) {
                    location.found = guess;
                    
                    break;
                  }
                }
              }
              
              continue;
            }
            
            if ( location.order > 0 ) {
              // guess > o, o is before guess
              stop = location.stop = guess;
              
              var previous = location.previous && location.previous.insert;
              
              // Use previous - 1 to find an exact match if any  
              start = previous !== u ? Math.max( previous - 1, location.start ) : location.start;
            } else {
              // guess < o, o is after guess
              start = location.start = guess + 1;
              
              var next = location.next && location.next.insert;
              
              // Use next + 1 to find an exact match if any: Missing test, no current test fails if 'next + 1' is replaced by 'next'
              if ( next !== u ) stop = Math.min( next + 1, stop );
            }
            
            if ( start !== stop ) {
              location.guess = Math.floor( ( start + stop ) / 2 );
              
              some_not_located = true;
            } else {
              location.located = true;
              location.insert = location.start;
            }
          }
        } // while some_not_located
        
        de&&ug( "Ordered_Set.locate(), name: " + options.name + ", locations: " + log.s( locations, replacer ) );
        
        return locations;
      } // locate()
      
      function replacer( k, v ) {
        return k == 'previous' || k == 'next' ? u : v
      }
    }, // locate()
    
    add: function( objects ) {
      objects = objects.slice( 0 );
      
      objects.sort( this.organizer );
      
      var a = this.a;
      
      if ( a.length === 0 ) {
        this.a = objects;
        
        return this;
      }
      
      var locations = this.locate( objects );
      
      for ( var i = locations.length; i; ) {
        var l = locations[ --i ];
        
        a.splice( l.insert, 0, l.o );
      }
      
      return this.connections_add( objects );
    }, // add()
    
    remove: function( objects ) {
      objects = objects.slice( 0 );
      
      objects.sort( this.organizer );
      
      var locations = this.locate( objects, true ), a = this.a, u;
      
      for ( var i = locations.length; i; ) {
        var f = locations[ --i ].found;
        
        if ( f !== u ) a.splice( f, 1 );
      }
      
      return this.connections_remove( objects );
    }, // remove()
    
    update: function( updates ) {
      var organizer = this.organizer;
      
      updates.sort( function( a, b ) { return organizer( a[ 0 ], b[ 0 ] ) } );
      
      var locations = this.locate( updates, true ), a = this.a, u;
      
      for ( var i = locations.length; i; ) {
        var l = locations[ --i ], f = l.found;
        
        if ( f !== u ) {
          if ( organizer( l.o, l.update ) ) {
            // Updaed object is moving
            
            var remove = f;
            
            a.splice( f, 1 ); // remove the old one
            
            l = this.locate( [ l.update ] )[ 0 ]; // locate updated object
            
            var insert = l.insert;
            
            a.splice( insert, 0, l.o ); // insert at new location

            /* Update other locations if affected by the move.
            
              Here is an example showing potential problems when sorting by descending years that move:
              
              [ { id:  9, title: "The Hunger Games"                        , author: "Suzanne Collins"        , year: 2008 }
                { id: 12, title: "Breaking Dawn"                           , author: "Stephenie Meyer"        , year: 2008 }
                { id:  6, title: "The Girl with the Dragon Tattoo"         , author: "Stieg Larsson"          , year: 2005 }
                { id:  3, title: "The Da Vinci Code"                       , author: "Dan Brown"              , year: 2003 }
                { id:  5, title: "Angels and Demons"                       , author: "Dan Brown"              , year: 2000 }
                { id: 11, title: "The Dukan Diet"                          , author: "Pierre Dukan"           , year: 2000 }
                { id: 10, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling"           , year: 1999 }
                { id:  4, title: "The Alchemist"                           , author: "Paulo Coelho"           , year: 1988 }
                { id: 13, title: "Lolita"                                  , author: "Vladimir Nabokov"       , year: 1955 }
                { id:  2, title: "The Lord of the Rings 1"                 , author: "J. R. R. Tolkien"       , year: 1954 }
                { id:  8, title: "The Hobbit"                              , author: "J. R. R. Tolkien"       , year: 1937 }
                { id:  1, title: "A Tale of Two Cities"                    , author: "Charles Dickens"        , year: 1859 }
                { id:  7, title: "The McGuffey Readers"                    , author: "William Holmes McGuffey", year: 1853 }
                { id: 15, title: "Steps to Christ"                         , author: "Ellen G. White"         , year: null }
                { id: 14, title: "And Then There Were None"                , author: "Agatha Christie"        , year: undefined }
                { id: 16, title: "Charlie and the Chocolate Factory"       , author: "Roald Dahl"                          }
              ]
              
              update( [
                [ { id:  8, title: "The Hobbit", author: "J. R. R. Tolkien"         , year: 1937 }, // needs to move up
                  { id:  8, title: "The Hobbit Changed", author: "J. R. R. Tolkien" , year: 1937 }
                ]
                
                [ { id: 15, title: "Steps to Christ", author: "Ellen G. White", year: null      }, // needs to move up
                  { id: 15, title: "Steps to Christ", author: "Ellen G. White", year: undefined } // move to the end
                ],
                                
                [ { id: 14, title: "And Then There Were None", author: "Agatha Christie", year: undefined },
                  { id: 14, title: "And Then There Were None", author: "Agatha Christie", year: 1927      } // moves backward
                ],
                
                [ { id: 16, title: "Charlie and the Chocolate Factory", author: "Roald Dahl"             }, // last
                  { id: 16, title: "Charlie and the Chocolate Factory", author: "Roald Dahl", year: 1970 } // moves backward
                ]
              ] )
              
              The location of the itens is correct as seen by the trace for test 76:
              
              2012/12/30 20:41:20.518 - xs, Ordered_Set.locate(), name: books_ordered_by_descending_year, locations: [
                { "o":{"id":8,"title":"The Hobbit","author":"J. R. R. Tolkien","year":1937},
                  "guess":10,"start":9,"stop":12,
                  "update":{"id":8,"title":"The Hobbit Changed","author":"J. R. R. Tolkien","year":1937},
                  "order":0,"located":true,"found":10,"insert":11
                },
                
                { "o":{"id":15,"title":"Steps to Christ","author":"Ellen G. White","year":null},
                  "guess":13,"start":13,"stop":14,
                  "update":{"id":15,"title":"Steps to Christ","author":"Ellen G. White"},
                  "order":0,"located":true,"found":13,"insert":14
                },
                
                { "o":{"id":14,"title":"And Then There Were None","author":"Agatha Christie"},
                  "guess":15,"start":14,"stop":16,
                  "update":{"id":14,"title":"And Then There Were None","author":"Agatha Christie","year":1927},
                  "order":0,"located":true,"insert":16,"found":14
                },
                
                { "o":{"id":16,"title":"Charlie and the Chocolate Factory","author":"Roald Dahl"},
                  "guess":14,"start":11,"stop":16,
                  "update":{"id":16,"title":"Charlie and the Chocolate Factory","author":"Roald Dahl","year":1970},
                  "order":0,"located":true,"found":15,"insert":16
                }
              ]
            */
            
            for ( var j = -1; ++j < i; ) {
              l = locations[ j ], f = l.found;
              
              if ( f !== u ) {
                if ( f < remove ) {
                  if ( f >= insert ) f += 1;
                } else {
                  // The insertion is done on the set with one element removed
                  // So the test that must be done is f - 1 < insert, which can be simplified to f <= insert
                  if ( f <= insert ) f -= 1;
                }
                
                l.found = f;
              }
            }
          } else {
            a[ f ] = l.update;
          }
        }
      }
      
      return this.connections_update( updates );
    } // update()
  } ); // Ordered_Set instance methods
  
  /* -------------------------------------------------------------------------------------------
     Aggregator()
  */
  function Aggregator( dimensions, measures, options ) {
    Connection.call( this, options );
    
    this.out = new Set( [], { key: set.key } );
    
    set.connect( this );
    
    return this;
  } // Aggregator()
  
  subclass( Connection, Aggregator );
  
  extend( Aggregator.prototype, {
    add: function( objects ) {
      return this;
    }, // add()
    
    remove: function( objects ) {
      return this;
    }, // remove()
    
    update: function( updates ) {
      return this;
    } // update()
  } ); // Aggregator instance methods
  
  /* -------------------------------------------------------------------------------------------
     CXXX(): template for Connection
  */
  function CXXX( set, options ) {
    Connection.call( this, options );
    
    this.out = new Set( [], { key: set.key } );
    
    set.connect( this );
    
    return this;
  } // CXXX()
  
  subclass( Connection, CXXX );
  
  extend( CXXX.prototype, {
    add: function( objects ) {
      return this;
    }, // add()
    
    remove: function( objects ) {
      return this;
    }, // remove()
    
    update: function( updates ) {
      return this;
    } // update()
  } ); // CXXX instance methods
  
  /* -------------------------------------------------------------------------------------------
     module exports
  */
  eval( export_code( 'XS', [ 'Connection', 'Set', 'Filter', 'Code', 'extend', 'log', 'subclass', 'export_code' ] ) );
  
  de&&ug( "module loaded" );
} )( this ); // xs.js
