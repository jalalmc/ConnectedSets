# Connected Sets
**High-Performances JavaScript Web Application Framework**

[![Build Status](https://travis-ci.org/ConnectedSets/ConnectedSets.png?branch=master)](https://travis-ci.org/ConnectedSets/ConnectedSets)

## Introduction
Connected Sets (**XS** in short) is a high-performance, scalable, realtime web application framework
aiming at massively reducing servers environmental footprint and improving mobile clients battery
life by making an optimal use of server, network and client resources.

Although XS is currently used to deliver a basic web application, some features described here are
still work in progress meaning that XS should be considered Alpha at this time. XS should provide
most of the features described bellow by version 0.4 in May 2014, and the first Beta version would
be 0.5 expected in June 2014 including reasonably complete documentation extracted from the code
where it currently stands.

### Why yet-another JavaScript Web Application Framework?

The short answer is because we are not satisfied with the performances, authorization models,
and productivity, of existing frameworks.

Internet servers are consuming an increasily significant share of worldwide exlectricity production,
contributing to climate change and threatening Internet growth as the availability of cheap fosil fuels
decreases due to population growth and per capita consumption growth.

Furthermore, the power of Internet server is now mostly increasing through the addition of cores, meaning
that the key to efficient usage of server resources must shift from raw-single-thread performence to
high concurency and parallelism performance. This in turn requires new programming patterns to keep
or better, increase programmers' productivity.

Also, one must realize that the bulk of the vast majorty of today's web applications is about controling
the motion of data throughout the network. Such data is no-longer limited to strictly public or strictly
private informtation, requiring complex authorization schemes. This calls for a framework that allows
to greatly simplify the management of user authorizations well beyond all-or-nothing authentication.

#### What do you mean by performances?

Our first priority is high-performances, because we believe that performance is the key to better
user experience, lowest operational costs, and a lower environemental footprint.

We are fighting simultaneously against:
- **CPU cycles** that consume energy to run and cool-down servers, slow-down mobile clients,
and **drain mobile batteries** faster than anyone desires
- **Latency** decreasing the responsiveness of applications and user experiences
- **Bandwidth** usage that consume energy, and increase latency over lower-bandwidth networks

We also want to keep **good performances at scale**. Most frameworks either do-not-scale or
scale with much lower per-server performances further increasing the need for cash while increasing
environemental footprints.

The bottom-line is that we want to be in better business faster, with less cash, and a lower
environemental footprint that current technologies allow.

Connected Sets addresses all of these issues thanks to its unique **Subscribe / Push** dataflow
model that works accross and betwwen web browsers and nodejs servers, as well as just-in-time
code generators and other optimizations.

#### What's the big deal about authorizations?

Writing a complex application is hard-enough, add to this any significantly-complex authorization
scheme and the whole thing breaks appart, slows-down to a crawl, clutters the code with plenty of
unspotted security holes throughout every part of the application, and every now and then exposes
end-users' data to unauthorized users.

Most companies try to get away with it by sweeping each leak under the carpet and promissing
end-users that this will never happen again, or better yet, that this never happened. Internally,
this usually ends-up with more meetings and paperwork, less things done for a system that although
marginally improved, will at best remain unproven.

Because it is so hard, most frameworks take a this-is-not-our-problem approach to authorizations
by stating that you should use third-party libraries or plugins to deal with it, all of which have
shortcomming and usually will not fit the complexity of any real-world application let alone
provide acceptable performances at scale.

Connected Sets provides a simple yet highly-efficient dataflow authorization model and system
architecture that delivers **realtime UI updates on authorization changes** at scale.

Now, you might consider that you don't need this, that end-users can refresh their page on
authorization changes. But the reality is that we can do this because we provide a model that works
in all cases, without requiring you to write a single additional line of code, so that you can sleep
at night knowing that end-user data cannot be exposed by some piece of code that forgot to test a
role in a corner-case.

#### How do you improve Productivity?

By allowing you to describe **what** you want instead of **how-the-hell** this could ever be
accomplished.

Figuring-out **how** this should a) work securely, b) scale and c) have best possible performances
as stated above, is hard, really hard. So hard that there is not a single company today able to
achieve that without throwing millions of dollars at the problem, and/or not struggling with bugs,
bottlenecks and hard-to-work-around architecture limitations.

The following provides an example of a non-trivial, high-performance, data server with realtime
updates on everything including authorization changes, in 50 lines of code, comments included.

The only thing you need to know to understand this code is about **Pipelets**:
- An XS pipelet, aka a "node" in other dataflow libraries, is a JavaScript function that
processes data events on datasets with no side effects on other pipelets
- it processes events emitted by **upstream** pipelets
- it emits events to **downstream pipelets**
- it's name describes what it provides or does
- pipelets are connected together using the JavaScript '.' operator or, as parameters when
there is more than one upstream or downstream pipelet connected

Each pipelet therefore represents a set connected to other sets which states evolve in realtime
as data events flow through the network of pipelets.

```javascript
var xs = require( 'excess' ); // Loads XS core pipelets, returns xs head pipelet

require( 'excess/lib/server/file.js' ); // Loads file server pipelets
require( 'excess/lib/server/http.js' ); // Loads http server pipelets
require( 'excess/lib/server/socket_io_clients.js' ); // Loads socket.io server pipelets

var database = xs.file_json_store( 'data_store.json' ); // Input/Output dataflows to/from datastore, one-line, no external database required

var users = database.flow( 'users' ); // Dataflow of users' credentials

var clients = xs
  // Define a set of web servers
  .set( [ 
    { ip_address: '0.0.0.0', port: 80 },                         // http://example.com/
    { ip_address: '0.0.0.0', port:443, key: '***', cert: '***' } // https://example.com/
  ] )
  
  .http_servers()              // Start http and https servers
  .socket_io_clients()         // Dataflow of socket.io client connections
  .authenticate_users( users ) // Dataflow of authenticated users' connections providing user_id
;

var authorizations = database.flow( 'authorizations' ); // Dataflow of all users' authorizations

database
  .dispatch( clients, client )  // Serve 64k simultaneous user connexions over one core
  .plug( database )             // plug() links to output of the dispatcher the database pipelet
;

// Individual client composition
function client( source ) { // source refers to the output of the database here
  var user_id = this.user_id; // id of authenticated user
  
  var get_query = authorizations
    .query( [ { user_id: user_id, get: true } ] )     // Get authorizations for this user
    .remove_attributes( [ 'user_id', 'get', 'set' ] ) // Strip unwanted query attributes
  ;
  
  var set_query = authorizations               
    .query( [ { user_id: user_id, set: true } ] )     // Set authorizations for this user
    .remove_attributes( [ 'user_id', 'get', 'set' ] ) // Strip unwanted query attributes
  ;
  
  return source
    .query( get_query )  // delivers only what this user is authorized to get
    .plug( this.socket ) // Send and Receive data to/from web browser
    .filter( set_query ) // discards unauthorized write attempts
  ;
}
```

Connected Sets' unique **Subscribe / Push** dataflow model allows to solve the **how** so that you
don't have to deal with it.

To make it easier, the API describes **what** you want in **plain JavaScript** without requiring
a graphical UI to glue hard-coded and hard-to-comprehend xml or json "nodes" and "links" together
as many other dataflow libraries require.

XS dataflow model provides higher level abstractions handling under the hood both subscribe
dataflows and information push dataflows that allows to move in realtime the least amount of
information possible between clients and servers.

### XS Subscribe / Push Dataflow Model

The following describes implementation details implemented at XS low level. Application
Architects do not need do program anything for this to happen as it is entirely hidden by
XS pipelets. Understanding of the underlying model helps understand why XS is so efficient
and how it scales.

Dataflow libraries usually implement one of two models:
- push: all data is pushed downstream as it happens, allowing realtime updates
- pull: data is pulled upstream when needed, allowing lazy programming, pulling only what is
required, when required

For web applications' communications between servers and clients these two models are usually
not acceptable for these reasons:

- The pull method is not realtime, introducing average latency of the polling period.
Worse it and can consume large amounts of bandwidth if the polling period is too small.
It can nonetheless be used efficiently on the client side along with requestAnimationFrame()
to prevent over-updating the DOM between refreshes.
- The push method pushes all data regardless of what the downstream many need. This can result
in the transmission of large amounts of unused data, usually introducing unacceptable latency
and bandwidth charges.

Connected Sets implements a more sophisticated **Subscribe / Push** model where downstream
pipelets subscribe to the subset of data they are interested in and subsequently receive all
updates in a push fashion only for that subset. This allows XS to move the least amount of
data between clients and servers while remaining realtime with the lowest possible latency.

XS stateless pipelets also use a lazy model where they will not subscribe to anything from
upstream unless initial data is fetched by a downstream stateful pipelet. This again
allows to transmit only what is really used by the application at any given time.

A subscription is done using a query dataflow that represents a kind of filter on the upstream
dataflow. Because the query is itself a dataflow, the subcription can change over time.

When tens of thousands of downstream pipelets subscribe to a single pipelet using different
queries, XS provides a query tree that routes data events very efficiently in O( 1 ) time
(i.e. that does not depend on the number of connected clients) therefore providing a more
scalable solution within a single server. Sending actual data to n clients out of N connected
clients is O( n ) so actual performances depends on the application (i.e. whether n << N or
not).

A network of Connected Sets servers can be arranged in a tree-like fashion to provide
unlimited size query trees, e.g. to dispatch data to millions of simultaneous clients. Each
server subscribes to its upstream server the subset of data it dispatches to downstream
servers and clients. This allows efficient and low-latency routing thanks in part to the
high performances of each individual server query tree.

#### Data Events, Operations, Stateless Sets and Pipelets

Internally, Connected Sets dataflows represent the evolution of data sets over time where
each event modifies a set. These dataflows are therefore sets change flows.

Each event carries an opperation name such as *add* or *remove* and an array of values
to add to, or remove from, a set.

**Stateless** pipelets process values which are not materialized either in memory or other storage.

Stateless pipelets process data events independently of all other events and values in the
set allowing very fast operations and lowest memory footprints.

Stateless pipelets can therefore process events out of order, much like Internet Protocol
packets can be routed through various paths within the Internet and may arrive at their destinations
in any order.

#### Stateful Pipelets

A **Stateful** pipelet maintains the state of a set either in memory, in mass storage,
or any other API that provides a storage behavior.

User Interface pipelets are stateful as these present the state of a set through the DOM.

Much like the TCP protocol in the Internet which is responsible for end-to-end communications
consistency, Stateful pipelets may receive data events in any order and are responsible for
maintaining an application-consistent state.

Stateful pipelets are implemented thanks to the stateful set() pipelet that is typically used as a base
pipelet for all stateful pipelets.

Also, much like the TCP protocol, stateful pipelets are found at the edges of a Connected Sets
network of stateless pipelets.

#### Horizontal Distribution

Allowing out-of-order data events is a key feature of Conneceted Sets which greatly eases
horizontal distribution of workloads and charding, because no synchronization is needed
between chards that may be processed in parallel either over a number of threads, processes,
or servers in a true share-nothing architecture.

#### Incremental Processing

Incremental sets processing allows to split large sets into optimal chunks of data
rendering data to end-users' interface with low-latency, dramatically improving end-user
experience. Data events update sets in real-time, on both clients and servers.

Incremental aggregates allow to deliver realtime OLAP cubes suitable for realtime data analysis
and reporting over virtually unlimited size datasets.

#### Loops, Just-In-Time Code Generation

XS data events contain arrays of values which are typically processed in loops. In a traditional
programming environement, one typically writes code that processes values in loops. With Connected Sets,
architects do not write loops because these are absracted away in the XS dataflow model.

This greatly simplifies programming while removing the likelihood for common programming errors.

Highest performances are provided thanks to Just-In-Time code generators delivering performances
only available to compiled languages such as C or C++. Unrolling nested loops provide maximum
performance while in turn allowing JavaScript JIT compilers to generate code that may be executed
optimally in microprocessors' pipelines.

#### XS Pipelet Programming

At the lower level, XS **Pipelets** use a JavaScript functional programming model eliminating
the typical callback hell of assynchronous request-response programming models.

Unlike the promises model, XS exceptions and errors are carried-out out-of-band through global
dataflows that can be processed, for error recovery, end-user feedback, and logging.

Error dataflows originating on clients can easily be routed to servers to allow proactive
debugging of errors while in production, and effective service quality monitoring.

### Service Architecture

With Connected Sets, services are typically composed of three different services:

- A stateful network of persistent database pipelets
- A stateless network of event dispatchers, acting as a marshalled multicasting network for dataflows
- A stateful network of client widgets delivering applications to end-users

For small applications with few simultaneous users the first two typically reside in a single server,
while complex applications with large number of active users will be running on different servers.
Because pipelets share no state they can easily be distributed.

A company could run multiple services through a single network of stateless event dispatchers, acting
as web service aggregator.

The different nodes of an XS network communicate using the XS protocol that provides the Subscribe / Push
service over a reliable transport (such as Sockets, WebSockets, ...) but not necessarily guarantying the
order of packets. So XS could also work over a protocol that would only guaranty the delivery of packets.

The XS protocol therefore provides a much higher level alternative to existing web services protocols
such as SOAP and REST, allowing to build efficiently complex real-time applications with no additional
code.

### Realtime Data Portability, Business Opportunities

A network of services sharing the same event dispatcher network enables to effectively separate
**XS Data Providers** from **XS Application Providers** increasing business opportunities
arising from the portability of dataflows updated in real-time and as authorized by end-users.

Within an XS network, end-users no longer need to duplicate their personal data endlessly and updates are
propagated to all applications in realtime putting an end to today's world of out-of-date data between
services.

People will now expose their data, using a variety of services to view, edit, and publish their data
to other people.

Using only stateless pipelets, this architecture will reach internet-scale very efficiently, delivering a
Marshalled Subscribe / Push multicasting data exchange for services to share data among many service
providers, while representing a business opportunity for **XS Network Providers** much like today's CDNs
but for marshalled dynamic real-time content solving caching issues thanks to the immutability of data
events.

To participate in this network, service providers only need to publish dataflows and/or subscribe to
third-party dataflows.

End-users may use these services to backup their own data either on owned servers or using third-party
XS Data Providers.

End-Users control access to their own data through XS Authorization dataflows providing additional
business opportunities for **XS Authorization Management Providers** helping end-users manage authorizations
for all their data accross all their XS Applications.

Disruptive new business opportunities arrising from **XS Realtime Data Portability** will prove much stronger than the current
boxed data-within-application model, resulting in more data and more services available to more users and businesses.

### Ecosystem

XS backend runs on **Node.js** providing a scalable database, web server, validation, and
authorizations.

On the frontend, XS provides reactive controlers and views driven by dataflows.
XS can optionally be coupled with any other framework but we recommend using reactive libraries
such as **AngularJS**, **Ember**, **Bacon.js**, **React**, which model is closer to XS.

For responsive layouts, we recommand **Bootstrap** that we use it for our Carousel and Photo
Albums.

For DOM manipulation one can use any library, or none at all, as XS core has no dependencies.

XS can either be used to gradually improve existing applications on the backend or frontend, or as
a full backend-and-frontend framework.

#### Integrated database and model

XS features a chardable document database with joins, aggregates, filters and transactions
with eventual consistency allowing both normalized and denormalized schemes.

*Persistance will be implemented in version 0.3 and charding in version 0.4.

### Demonstration Site
A [demonstration and beta test site is available here](http://www.castorcad.com/).

The source code for this demonstration site is in [the GitHub repository ConnectedSets / demo](https://github.com/ConnectedSets/demo).

### Documentation

This readme provides an introduction to Connected Sets.

The bulk of the documentation is currently embedded in the code of ```lib/pipelet.js``` for
the core as well as individual pipelets' sources.

We plan on extracting and completing this documentation to provide the following manuals:

- A Tutorial
- ConnectedSets Application Architect Manual
- ConnectedSets Pipelet Developper's Guide
- A Reference Manuals for all available pipelets by module

### Automated Tests, Continuous Integration

We have curently developped 226 automated tests for the XS core pipelets that run after every
commit on Travis CI under node versions 0.8, 0.10, and 0.11. We no longer test version 0.6 since
Travis had an issue with it around January 2014.

Our continuous integration process also requires that before each commit the developper runs
these tests so travis usually passes all tests. In the event that a test does not pass the top
priority is to fix the test before anything else.

We have developped at least 100 other ui tests that are not currently automated because we have not yet
integrated Phantomjs or another headless browser.

We also do manual testing on the following web browsers: Chrome (latest), Firefox (latest),
IE 8, 9, and 10 but enventually plan on dropping support for IE8.

We publish to npm regularily, typically when we want to update the demonstration site. If you need more
updates just let us know.

## Installation

From npm, latest release:
```bash
npm install excess
```

Some image manipulation pipelets require ImageMagick that [you can download here](http://www.imagemagick.org/script/binary-releases.php.).

## Running tests
```bash
npm install -g coffee-script
npm install mocha
npm install expect.js

git clone https://github.com/ConnectedSets/ConnectedSets.git

cd ConnectedSets
./run_tests.sh
226 passing (2s)

less -R test.out # for tests detailed traces
```

## Example of complete client and server application

Application retrieving sales and employees from a server, aggregates these by year and displays the results
incrementally in an html table (a * indicates that a pipelet is not yet implemented or is work in progress).

This example also shows how to produce in realtime minified `all.css` and `all-min.js`. All assets content
is prefetched in this example for maximum performance. The less css compiler is also used to compile in real
time .less files. The same could be done to compile coffee script or use any other code compiler.

#### index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    
    <title>Connected Sets - Aggregate Sales by Year and Employee</title>
    
    <link rel="stylesheet" href="all.css" />
    
    <script src="all-min.js"></script>
  </head>
  
  <body>
    <div id="sales_table"></div>
    
    <script>client()</script>
  </body>
</html>
```

#### javacript/client.js

```javascript
"use strict";

function client() {
  var xs = XS.xs                  // the start object for XS fluent interface
    , extend = XS.extend          // used to merge employees and sales
    , sales = [{ id: 'sales'}];   // Aggregate sales measures
    , by_year = [{ id: 'year' }]; // Aggregate dimensions
    
    // Table columns order by year and employee name
    , by_year_employee = [ { id: 'year' }, { id: 'employee_name' } ]
    
    // Define table displayed columns
    , columns = [
      { id: 'year'         , label: 'Year'          }, // First column
      { id: 'employee_name', label: 'Employee Name' },
      { id: 'sales'        , label: 'Sales $'       }
    ]
  ;
  
  var server = xs.socket_io_server(); // exchange dataflows with server using socket.io
  
  // Get employees from server
  var employees = server.flow( 'employee' ); // filter values which "flow" attribute equals 'employee'
  
  // Produce report after joining sales and employees
  server
    .flow( 'sale' )
    .join( employees, merge, { left: true } ) // this is a left join
    .aggregate( sales, by_year )
    .order( by_year_employee )
    .table( 'sales_table', columns )
  ;
  
  // Merge function for sales and employees
  // Returns sales with employee names coming from employee flow
  function merge( sale, employee ) {
      // Employee can be undefined because this is a left join
      if ( employee ) return extend( { employee_name: employee.name }, sale )
      
      return sale
  }
}
```

#### server.js

```javascript
var xs = require( 'excess' );

var servers = xs
  .set( [ // Define http servers
    { port:80, ip_address: '0.0.0.0' } // this application has only one server
    { port:443, ip_address: '0.0.0.0', key: 'key string', cert: 'cert string' }
    // See also "Setting up free SSL on your Node server" http://n8.io/setting-up-free-ssl-on-your-node-server/
  ] )
  .http_servers() // start http servers
;

// Merge and mimify client javascript assets in realtime
var all_min_js = xs
  .set( [ // Define the minimum set of javascript files required to serve this client application
    { name: 'excess/lib/xs.js'        },
    { name: 'excess/lib/pipelet.js'   },
    { name: 'excess/lib/filter.js'    },
    { name: 'excess/lib/join.js'      },
    { name: 'excess/lib/aggregate.js' },
    { name: 'excess/lib/order.js'     },
    { name: 'excess/lib/table.js'     }
  ], { auto_increment: true } ) // Use auto_increment option to keep track of files order
  
  .require_resolve()            // Resolve node module paths
  
  .union( xs.set( [             // Add other javascript assets
    { name: 'javascript/client.js', id: 8 } // client code must be loaded after excess
  ] ) )
  
  .watch()                      // Retrieves files content with realtime updates
  
  .order( [ { id: 'id' } ] )    // Order files by auto_increment order before minifying
  
  .uglify( 'all-min.js' )       // Minify in realtime using uglify-js
;

// Other static assets
xs.set( [
    { name: 'index.html' },
    { name: 'css/*.css'  }
  ] )
  .glob()                  // * Retrrieves files list with realtime updates (watching the css directory)
  .watch()                 // Retrieves file content with realtime updates
  .union(                  // Add other compiled assets
    [ all-min.js, all.css ]
  )
  .serve( servers )        // Deliver up-to-date compiled and mimified assets to clients
;

// Start socket servers on all servers using socket.io
var clients = servers.socket_io_clients(); // Provide a dataflow of socket.io client connections

xs.file_json_store( 'database.json' ) // * The dataflow store of all database transactions

  .dispatch( clients, function( source, options ) { // Serve realtime content to all socket.io clients
    return source
      .plug( this.socket ) // Insert socket dataflow to exchage data with this client
    ;
  } )
;
```

#### Start server

```bash
node server.js
```

## Roadmap / Releases

### Version 0.5.0 - ETA June 2014

#### Main Goals:

- This should be the first Beta version
- Extract documentation from code
- Build Website, featuring documentation and tutorial
- Implement as many ToDos as possible
- Stabilize API

### Version 0.4.0 - ETA May 2014

#### Main Goals:

- Horizontal distribution of web socket dispatcher
- Finalize module pattern
- Split This repository into xs_core, xs_server, xs_client, xs_socket_io, xs_bootstrap, modules
- Implement SocksJS pipelets
- Navigation pipelets

### Version 0.3.0 - ETA April 2014

#### Main Goals:

- Persistance
- Authentication
- Dynamic Authorizations Query Dataflow from user id
- Out-of-band, global dataflows for: exceptions, errors, and debug information

### Version 0.2.0 - ETA March 2014

#### Main Goals:

- Finalize Subcribe / Push model using optimized Query Tree Router and lazy connection of stateless pipelets
- Automate UI tests on Travis
- Develop additional tests, goal is at least 300 automated tests
- Watch directory metadata flow

#### Features already developped:

- Transactions
- Virtual Hosts w/ optimized routing
- Touch Events on bootstrap pipelets
- Filter support for static and dynamic queries

#### New pipelets (available now):

Pipelet                   | Short Description                              
--------------------------|------------------------------------------------
url_events()              | Browser url changes
animation_frames()        | Request Animation Frame events
encapsulate()             | Hide a graph of pipelets behind one pipelet
require_resolve()         | Resolve node module files absolute path
timestamp()               | Add timestamp attribute
events_metadata()         | Add events metadata attributes
auto_increment()          | Add auto-increment attribute
set_flow()                | Add flow attribute
to_uri()                  | Transforms a relative file name into a DOM uri
thumbnails()              | Image thumbnails using ImageMagick
load_images()             | Load images in the DOM one at a time
bootstrap_carousel()      | Bootstrap responsive images carousel 
bootstrap_photos_matrix() | Bootstrap responsive photo matrix
bootstrap_photo_album()   | Bootstrap responsive photo album
json_stringify()          | JSON Stringifies content attribute
json_parse()              | JSON parse content attribute
attribute_to_value()      | Replace value with the value of an attribute
value_to_attribute()      | Sets value as an attribute and add other default attributes

### Version 0.1.0 - April 8th 2013:

#### Features:

- Push dataflow model with lazy evaluation of stateless pipelets
- Core Database engine with order / aggregates / join / union, and much more
- Automated tests
- Dataflows between clients and server using socket.io
- DOM Tables w/ realtime updates
- DOM Controls as dataflows: Drop-Down / Radio / Checkboxes
- DOM Forms with client-side and server-side validation
- Realtime Minification using Uglify w/ source maps
- HTTP(s) servers
- File watch w/ realtime updates
- JSON Configuration Files w/ realtime updates

Core Pipelets             | Short Description                              
--------------------------|------------------------------------------------
set()                     | Base stateful pipelet
filter()                  | Filters a dataflow
order()                   | Order a set
ordered()                 | Follow an ordered set (typically derived)
aggregate()               | Aggregates measures along dimensions (GROUP BY)
join()                    | Joins two dataflows
watch()                   | Dataflow updated on file content changes
dispatch()                | Dispatches dataflows to a dataflow of branches
parse_JSON()              | JSON dataflow to parsed JSON dataflow

Server Pipelets           | Short Description                              
--------------------------|------------------------------------------------
uglify()                  | Minifies a dataflow of files into a bundle, using [Uglify JS 2](https://github.com/mishoo/UglifyJS2)
http_servers()            | A dataflow of http servers
serve()                   | Serve a dataflow of resources contents to http (or other) servers
socket_io_clients()       | A dataflow server for socket.io clients
socket_io_server()        | A dataflow client for socket.io server
send_mail()               | Send emails from email dataflow
configuration()           | Dataflow of application configuration parameters

DOM Pipelets              | Short Description                              
--------------------------|------------------------------------------------
table()                   | DOM table bound to incoming dataflows
form()                    | DOM Form using fields dataflow, emiting submited forms
form_validate()           | Client and server form validation
checkbox()                | DOM input checkbox
checkbox_group()          | DOM input chexbox group
radio()                   | DOM radio button
drop_down()               | DOM drop-down menu

EC2 Pipelets              | Short Description                              
--------------------------|------------------------------------------------
ec2_regions()             | Set of AWS EC2 regions, starts ec2 clients


## Licence

    Copyright (C) 2013, 2014, Connected Sets

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
