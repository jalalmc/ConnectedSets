/*  form.js
    
    ----
    
    Copyright (C) 2013, Connected Sets

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

( function( exports ) {
  var XS;
  
  if ( typeof require === 'function' ) {
    XS = require( 'excess/lib/xs.js' ).XS;
    
    require( 'excess/lib/code.js'    );
    require( 'excess/lib/pipelet.js' );
  } else {
    XS = exports.XS;
  }
  
  var xs      = XS.xs
    , log     = XS.log
    , extend  = XS.extend
    , Code    = XS.Code
    , Pipelet = XS.Pipelet
    , Ordered = XS.Ordered
  ;
  
  /* -------------------------------------------------------------------------------------------
     de&&ug()
  */
  var de = true;
  
  function ug( m ) {
    log( "xs form.js, " + m );
  } // ug()
  
  /* -------------------------------------------------------------------------------------------
     Form()
  */
  XS.Compose( 'form',
    function( source, dom_node, model, fields, options ) {
      return source
        .form_display_errors( dom_node, model, fields, options )
        .model              (           model                  )
        .form_process       ( dom_node, model, fields, options )
        .form_validate      (           model,         options )
        .form_display_errors( dom_node, model, fields, options )
        .form_submit        ( dom_node,                options )
      ;
    }
  );
  
  /* -------------------------------------------------------------------------------------------
     Form_Display_Errors()
  */
  function Form_Display_Errors( dom_node, model, form_fields, options ) {
    Pipelet.call( this, options );
    
    return this;
  } // Form_Display_Errors()
  
  Pipelet.build( 'form_display_errors', Form_Display_Errors, {
    /*
    add: function( added ) {
      de&&ug( "Form_Display_Errors..add(), added: " + log.s( added ) );
      return this;
    }, // add()
    
    remove: function( removed ) {
      de&&ug( "Form_Display_Errors..remove(), removed: " + log.s( removed ) );
      return this;
    }, // remove()
    
    update: function( updated ) {
      de&&ug( "Form_Display_Errors..update(), updated: " + log.s( updated ) );
      return this;
    } // update()
    */
  } ); // Form_Display_Errors() instance methods
  
  /* -------------------------------------------------------------------------------------------
     Form_Process()
  */
  function Form_Process( dom_node, model, form_fields, options ) {
    this.set_node( dom_node );
    this.draw();
    
    Ordered.call( this, options );
    
    this.add_source( form_fields );
    
    return this;
  } // Form()
  
  Ordered.build( 'form_process', Form_Process, {
    set_node: function( node ) {
      if( XS.is_DOM( node ) ) {
        this.node = node;
      } else {
        throw( 'the node is not a DOM element' );
      }
      
      return this;
    }, // set_node()
    
    draw: function() {
      this.node.appendChild( this.form = document.createElement( 'form' ) );
      
      return this;
    }, // draw()
    
    insert_: function( at, v ) {
      var div  = document.createElement( 'div' )
        , form = this.form
        , classes = v.classes
        , container_classes = classes && classes.container
        , label_classes     = classes && classes.label
        , input_classes     = classes && classes.input
      ;
      
      container_classes && div.setAttribute( "class", container_classes );
      
      v.label && label( div, v.label, label_classes );
      
      switch( v.type ) {
        case 'text' :
        case 'email' :
        case 'phone' :
          input_text( div, v, input_classes );
        break;
        
        case 'hidden' :
          hidden( div, v, input_classes );
        break;
        
        case 'radio' :
          radio( div, v, input_classes );
        break;
        
        case 'checkbox' :
          checkbox( div, v, input_classes );
        break;
        
        case 'drop_down' :
          drop_down( div, v, input_classes );
        break;
        
        case 'text_area' :
          text_area( div, v, input_classes );
        break;
        
        default: throw( 'Unsupported type: ' + v.type );
      }
      
      form.insertBefore( div, form.childNodes[ at ] );
      
      return this;
    }, // insert_()
    
    remove_: function( from ) {
      var form = this.form;
      
      form.removeChild( form.childNodes[ from ] );
      
      return this;
    }, // remove_()
    
    update_: function( at, v ) {
      
      return this;
    } // update_()
    
  } ); // Form_Process() instance methods
  
  /* -------------------------------------------------------------------------------------------
     Validate()
  */
  function Form_Validate( model, form_fields, options ) {
    Pipelet.call( this, options );
    
    return this;
  } // Form_Validate()
  
  Pipelet.build( 'form_validate', Form_Validate, {
    /*
    add: function( added ) {
      de&&ug( "Form_Validate..add(), added: " + log.s( added ) );
      
      
      
      return this;
    }, // add()
    
    remove: function( removed ) {
      de&&ug( "Form_Validate..remove(), removed: " + log.s( removed ) );
      
      
      
      return this;
    }, // remove()
    
    update: function( updated ) {
      de&&ug( "Form_Validate..update(), updated: " + log.s( updated ) );
      
      
      
      return this;
    } // update()
    */
  } ); // Form_Validate() instance methods
  
  /* -------------------------------------------------------------------------------------------
     Form_Submit()
  */
  function Form_Submit( dom_node, options ) {
    Pipelet.call( this, options );
    
    return this;
  } // Form_Submit()
  
  Pipelet.build( 'form_submit', Form_Submit, {
    /*
    add: function( added ) {
      de&&ug( "Form_Submit..add(), added: " + log.s( added ) );
      return this;
    }, // add()
    
    remove: function( removed ) {
      de&&ug( "Form_Submit..remove(), removed: " + log.s( removed ) );
      return this;
    }, // remove()
    
    update: function( updated ) {
      de&&ug( "Form_Submit..update(), updated: " + log.s( updated ) );
      return this;
    } // update()
    */
  } ); // Form_Submit() instance methods
  
  /* -------------------------------------------------------------------------------------------
     module exports
  */
  
  // manage labels
  function label( dom_node, value, css_classes ) {
    var label = document.createElement( 'label' );
    
    label.innerText = value;
    label.style.verticalAlign = "top"
    label.style.display = "block";
    
    css_classes && label.setAttribute( 'class', css_classes );
    
    dom_node.appendChild( label );
  } // _label()
  
  // manage inputs text type
  function input_text( dom_node, object, css_classes ) {
    var input = document.createElement( 'input' );
    
    input.type = "text";
    input.id   = object.id
    input.name = object.name;
    
    css_classes && input.setAttribute( 'class', css_classes );
    
    dom_node.appendChild( input );
  } // input_text()
  
  // manage text area type
  function text_area( dom_node, object, css_classes ) {
    var text_area = document.createElement( 'textarea' );
    
    text_area.id   = object.id;
    text_area.name = object.name;
    text_area.cols = object.cols;
    text_area.rows = object.rows;
    
    css_classes && text_area.setAttribute( 'class', css_classes );
    
    dom_node.appendChild( text_area );
  } // text_area()
  
  // manage drop down type
  function drop_down( dom_node, object, css_classes ) {
    var select = document.createElement( 'select' )
      , values = object.values
    ;
    
    select.id   = object.id;
    select.name = object.name;
    
    for( var i = values.length; i; ) {
      var option = document.createElement( 'option' )
        , value  = values[ --i ]
      ;
      
      option.innerText = value.label;
      option.value     = value.value;
      
      if( value.selected ) option.selected = true;
      
      select.add( option, select.options[ i ] );
    }
    
    css_classes && select.setAttribute( 'class', css_classes );
    
    dom_node.appendChild( select );
  } // drop_down()
  
  // manage inputs radio type
  function radio( dom_node, object, css_classes ) {
    var container = document.createElement( 'div' )
      , values    = object.values
    ;
    
    container.id = object.id;
    
    for( var i = -1, l = values.length; ++i < l; ) {
      var div   = document.createElement( 'div'   )
        , input = document.createElement( 'input' )
        , label = document.createElement( 'label' )
        , value = values[ i ]
      ;
      
      label.innerText = value.label;
      
      input.type  = "radio";
      input.name  = object.name;
      input.value = value.value;
      
      if( value.selected ) input.checked = true;
      
      div.appendChild( input );
      div.appendChild( label );
      
      container.appendChild( div );
    }
    
    css_classes && div.setAttribute( 'class', css_classes );
    
    dom_node.appendChild( container );
  } // radio()
  
  // manage inputs checbox type
  function checkbox( dom_node, object, css_classes ) {
    var container = document.createElement( 'div' )
      , values    = object.values
    ;
    
    container.id = object.id;
    
    for( var i = -1, l = values.length; ++i < l; ) {
      var div   = document.createElement( 'div'   )
        , input = document.createElement( 'input' )
        , label = document.createElement( 'label' )
        , value = values[ i ]
      ;
      
      label.innerText = value.label;
      
      input.type  = "checkbox";
      input.name  = object.name;
      input.value = value.value;
      
      if( value.selected ) input.checked = true;
      
      div.appendChild( input );
      div.appendChild( label );
      
      container.appendChild( div );
    }
    
    css_classes && div.setAttribute( 'class', css_classes );
    
    dom_node.appendChild( container );
  } // checkbox()
  
  // manage hidden type
  function hidden( dom_node, object, css_classes ) {
    var input = document.createElement( 'input' );
    
    input.type  = "hidden";
    input.id    = object.id
    input.name  = object.name;
    input.value = typeof object.value === 'object' ? "" : object.value;
    
    dom_node.appendChild( input );
  } // hidden()
  
  eval( XS.export_code( 'XS', [ 'Form_Process', 'Form_Validate', 'Form_Submit', 'Form_Display_Errors' ] ) );
  
  de&&ug( "module loaded" );
} )( this ); // form.js