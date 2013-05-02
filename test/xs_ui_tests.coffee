###
    xs_ui.tests.coffee

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

###

#mocha.setup 'bdd' if typeof mocha isnt 'undefined'

# include modules
# ---------------
expect = if require? then ( require 'expect.js' ) else this.expect
XS = if require? then ( require '../lib/xs.js' ).XS else this.XS

xs = XS.xs

columns = xs.set( [
  { id: "id"    , label: "ID"     }
  { id: "title" , label: "Title"  }
  { id: "author", label: "Author" }
] ).order( [ { id: 'id' } ] )

books = xs.set( [
  { id: 1, title: "A Tale of Two Cities"             , author: "Charles Dickens" , sales: 200, year: 1859, language: "English" }
  { id: 2, title: "The Lord of the Rings"            , author: "J. R. R. Tolkien", sales: 150, year: 1955, language: "English" }
  { id: 3, title: "Charlie and the Chocolate Factory", author: "Roald Dahl"      , sales:  13            , language: "English" }
  { id: 4, title: "The Da Vinci Code"                , author: "Dan Brown"       , sales:  80, year: 2003, language: "English" }
] ).order( [ { id: "title" } ] )

describe 'UI Tests', ->
  describe 'Table():', ->
    table_container = document.getElementById 'table'
    
    books.table table_container, columns, { caption: "List of the best-selling books (source: wikipedia)" }
    
    table_node = document.getElementsByTagName( 'table' )[ 0 ]
    table_head = table_node.childNodes[ 1 ]
    table_body = table_node.childNodes[ 2 ]
    
    it 'expect document body to contain table element', ->
      expect( table_node ).to.be.ok()
    
    it 'expect table to have a caption', ->
      expect( table_node.caption.innerText ).to.be.ok() # 'List of the best-selling books (source: wikipedia)'
    
    it 'expect table caption to be "List of the best-selling books (source: wikipedia)"', ->
      expect( table_node.caption.innerText ).to.be 'List of the best-selling books (source: wikipedia)'
    
    it 'expect table to have a thead', ->
      expect( table_head ).to.be.ok()
    
    it 'expect table to have a tbody', ->
      expect( table_body ).to.be.ok()
    
    it 'expect table to have 3 columns', ->
      expect( table_head.childNodes[ 0 ].childNodes.length ).to.be 3
    
    it 'expect table to have 4 rows', ->
      expect( table_body.childNodes.length ).to.be 4
    
    it 'expect table content to be equal to content', ->
      content = 'List of the best-selling books (source: wikipedia)' +
        'AuthorIDTitle' +
        'Charles Dickens1A Tale of Two Cities' +
        'Roald Dahl3Charlie and the Chocolate Factory' +
        'Dan Brown4The Da Vinci Code' +
        'J. R. R. Tolkien2The Lord of the Rings'
      
      expect( table_node.textContent ).to.be content
    
    it 'expect numbers to be left aligned ( ID )', ->
      rows = table_body.childNodes
      
      for row in rows
        cell_align = row.childNodes[ 1 ].style.textAlign
        
        expect( cell_align ).to.be 'right'
    
    it 'after columns.add( objects ), expect table to have 5 columns', ->
      columns.add [
        { id: "year"    , label: "Year"    , align: "center" }
        { id: "language", label: "Language"                  }
      ]
      
      expect( table_head.childNodes[ 0 ].childNodes.length ).to.be 5
    
    it 'expect table content to be equal to content', ->
      content = 'List of the best-selling books (source: wikipedia)' +
        'AuthorIDLanguageTitleYear' +
        'Charles Dickens1EnglishA Tale of Two Cities1859' +
        'Roald Dahl3EnglishCharlie and the Chocolate Factory' +
        'Dan Brown4EnglishThe Da Vinci Code2003' +
        'J. R. R. Tolkien2EnglishThe Lord of the Rings1955'
      
      expect( table_node.textContent ).to.be content
    
    it 'expect year column to be centred', ->
      rows = table_body.childNodes
      
      for row in rows
        cell_align = row.childNodes[ 4 ].style.textAlign
        
        expect( cell_align ).to.be 'center'
    
    it 'after columns.remove( object ), expect table to have 4 columns', ->
      columns.remove [ { id: "id", label: "ID" } ]
      
      expect( table_head.childNodes[ 0 ].childNodes.length ).to.be 4
    
    it 'expect table content to be equal to content', ->
      content = 'List of the best-selling books (source: wikipedia)' +
        'AuthorLanguageTitleYear' +
        'Charles DickensEnglishA Tale of Two Cities1859' +
        'Roald DahlEnglishCharlie and the Chocolate Factory' +
        'Dan BrownEnglishThe Da Vinci Code2003' +
        'J. R. R. TolkienEnglishThe Lord of the Rings1955'
      
      expect( table_node.textContent ).to.be content
    
    it 'after columns.update( object ), expect table to have 4 columns', ->
      columns.update [ [ { id: "language", label: "Language" }, { id: "sales", label: "Sales by millions of copies" } ] ]
      
      expect( table_head.childNodes[ 0 ].childNodes.length ).to.be 4
    
    it 'expect table content to be equal to content', ->
      content = 'List of the best-selling books (source: wikipedia)' +
        'AuthorSales by millions of copiesTitleYear' +
        'Charles Dickens200A Tale of Two Cities1859' +
        'Roald Dahl13Charlie and the Chocolate Factory' +
        'Dan Brown80The Da Vinci Code2003' +
        'J. R. R. Tolkien150The Lord of the Rings1955'
      
      expect( table_node.textContent ).to.be content
    
    it 'after books.add( objects ), expect table to have 15 rows', ->
      books.add [
        { id:  5, title: "Angels and Demons"                       , author: "Dan Brown"              , sales:        39, year: 2000, language: "English" }
        { id:  6, title: "The Girl with the Dragon Tattoo"         , author: "Stieg Larsson"          , sales:        30, year: 2005, language: "Swedish" }
        { id:  7, title: "The McGuffey Readers"                    , author: "William Holmes McGuffey", sales:       125, year: 1853, language: "English" }
        { id:  8, title: "The Hobbit"                              , author: "J. R. R. Tolkien"       , sales:       100, year: 1937, language: "English" }
        { id:  9, title: "The Hunger Games"                        , author: "Suzanne Collins"        , sales:        23, year: 2008, language: "English" }
        { id: 10, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling"           , sales: undefined, year: 1999, language: "English" }
        { id: 11, title: "The Dukan Diet"                          , author: "Pierre Dukan"           , sales:        10, year: 2000, language: "French"  }
        { id: 12, title: "Breaking Dawn"                           , author: "Stephenie Meyer"        , sales: undefined, year: 2008, language: "English" }
        { id: 13, title: "Lolita"                                  , author: "Vladimir Nabokov"       , sales:        50, year: 1955, language: "English" }
        { id: 14, title: "And Then There Were None"                , author: "Agatha Christie"        , sales:       100, year: undefined, language: "English" }
        { id: 15, title: "Steps to Christ"                         , author: "Ellen G. White"         , sales:        60, year: null, language: "English" }
      ]
      
      expect( table_body.childNodes.length ).to.be 15
    
    it 'expect table content to be equal to content', ->
      content = 'List of the best-selling books (source: wikipedia)' +
        'AuthorSales by millions of copiesTitleYear' +
        'Charles Dickens200A Tale of Two Cities1859' +
        'Agatha Christie100And Then There Were None' +
        'Dan Brown39Angels and Demons2000Stephenie MeyerBreaking Dawn2008' +
        'Roald Dahl13Charlie and the Chocolate Factory' +
        'J.K. RowlingHarry Potter and the Prisoner of Azkaban1999' +
        'Vladimir Nabokov50Lolita1955' +
        'Ellen G. White60Steps to Christ' +
        'Dan Brown80The Da Vinci Code2003' +
        'Pierre Dukan10The Dukan Diet2000' +
        'Stieg Larsson30The Girl with the Dragon Tattoo2005' +
        'J. R. R. Tolkien100The Hobbit1937' +
        'Suzanne Collins23The Hunger Games2008' +
        'J. R. R. Tolkien150The Lord of the Rings1955' +
        'William Holmes McGuffey125The McGuffey Readers1853'
      
      expect( table_node.textContent ).to.be content
    
    it 'after books.remove( objects ), expect table to have 12 rows', ->
      books.remove [
        { id:  1, title: "A Tale of Two Cities", author: "Charles Dickens"        , year: 1859 }
        { id: 13, title: "Lolita"              , author: "Vladimir Nabokov"       , year: 1955 }
        { id:  7, title: "The McGuffey Readers", author: "William Holmes McGuffey", year: 1853 }
      ]
      
      expect( table_body.childNodes.length ).to.be 12
    
    it 'expect table content to be equal to content', ->
      content = 'List of the best-selling books (source: wikipedia)' +
        'AuthorSales by millions of copiesTitleYear' +
        'Agatha Christie100And Then There Were None' +
        'Dan Brown39Angels and Demons2000Stephenie MeyerBreaking Dawn2008' +
        'Roald Dahl13Charlie and the Chocolate Factory' +
        'J.K. RowlingHarry Potter and the Prisoner of Azkaban1999' +
        'Ellen G. White60Steps to Christ' +
        'Dan Brown80The Da Vinci Code2003' +
        'Pierre Dukan10The Dukan Diet2000' +
        'Stieg Larsson30The Girl with the Dragon Tattoo2005' +
        'J. R. R. Tolkien100The Hobbit1937' +
        'Suzanne Collins23The Hunger Games2008' +
        'J. R. R. Tolkien150The Lord of the Rings1955'
      
      expect( table_node.textContent ).to.be content
    
    it 'after books.update( objects ), expect table to have 12 rows', ->
      books.update [
        [
          { id:  2, title: "The Lord of the Rings"             , author: "J. R. R. Tolkien"         , year: 1955 }
          { id:  2, title: "The Fellowship of the Ring: LOTR 1", author: "John Ronald Reuel Tolkien", year: 1955 }
        ]
        [
          { id: 10, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling"  , year: 1999 }
          { id: 10, title: "Harry Potter and the Prisoner of Azkaban", author: "Joanne Rowling", year: 1999 }
        ]
      ]
      
      expect( table_body.childNodes.length ).to.be 12
    
    it 'expect table content to be equal to content', ->
      content = 'List of the best-selling books (source: wikipedia)' +
        'AuthorSales by millions of copiesTitleYear' +
        'Agatha Christie100And Then There Were None' +
        'Dan Brown39Angels and Demons2000' +
        'Stephenie MeyerBreaking Dawn2008' +
        'Roald Dahl13Charlie and the Chocolate Factory' +
        'Joanne RowlingHarry Potter and the Prisoner of Azkaban1999'+
        'Ellen G. White60Steps to Christ' +
        'Dan Brown80The Da Vinci Code2003' +
        'Pierre Dukan10The Dukan Diet2000' +
        'John Ronald Reuel TolkienThe Fellowship of the Ring: LOTR 11955' +
        'Stieg Larsson30The Girl with the Dragon Tattoo2005' +
        'J. R. R. Tolkien100The Hobbit1937' +
        'Suzanne Collins23The Hunger Games2008'
      
      expect( table_node.textContent ).to.be content