This is an example of using the Flask web framework along with
`WebSocket <https://en.wikipedia.org/wiki/WebSocket>`_ to
create a simple client-server connection between back-end code (running on the
server, in Python) and front-end code (running in the browser, in JavaScript).

It is the successor to my `lpoll <https://bitbucket.org/jeunice/lpoll>`_ example
of using long-polling (aka `Comet
<https://en.wikipedia.org/wiki/Comet_(programming)>`_, aka reverse AJAX)
to update client state asynchronously. In 2011-2013, WebSocket support in both
Web frameworks and client browsers was occasional; now a few years later, support
for it is much more widespread and solid. As a result, the lesser long-polling
techniques are no longer so essential, and now in many cases would be considered
obsolescent.

The benefits of WebSocket:

*  Faster updates and no waiting for updates.
   Lower latency user interactions are almost invariably better user interactions.

*  Lower overhead on server (fewer pointless "Has anything changed? No?
   Okay. How about now? No? Okay. How about now? ..." interactions)

*  Clearer knowledge, on both sides of the connection, as to what happened
   to the other side. If the server goes away, the ``onclose`` method is
   called, allowing the client to at least quasi-gracefully degrade in light of
   server failure.

*  Cleaner, simpler code. Concurrency is wrapped in a more appropriate, purposeful
   way, meaning less low-level futzing for client code. (Server code and configuration
   may still be more complex than long-polling.)

This example uses the same ``/update`` update URL as ``lpoll`` to make comparing
the two straightforward. A more Web Socket-focused example would do away with
the distinction between update notifications and the subsequent data grab.

Most Python web frameworks use the `Web Server Gateway Interface (WSGI) standard
<http://en.wikipedia.org/wiki/Web_Server_Gateway_Interface>`_. WSGI defines a
synchronous interface. That works well for the HTTP protocol used by static and
templated Web pages, but doesn't readily accommodate the *ad hoc*, asynchronous
communications needed for real-time updates in fully interactive
applications. The AJAX and Rich Internet Application (RIA) age wants more
intimate, frequent client-server conversations as pages are incrementally
rendered and regularly updated.

The solution is replacing the pure WSGI-based Web / HTTP serving underpinnings
of Flask (aka Werkzeug) with a more threaded, asynchronous alternative. This
example uses HTTP and WebSocket serving features based on the `gevent
<http://www.gevent.org>`_ quasi-threading / "greenlet" (really, coroutines)
system. While gevent isn't truly multi-threaded in the fully parallel sense, it
creates the kind of time-sliced approximation of threading that makes the
distinction academic for most local or reasonably low-volume Web apps.

Higher-volume apps might benefit from being hosted atop a different server;
Flask and WebSocket can be easily run atop the Tornado, for instance.
Though various benchmarks (e.g. `this one <http://nichol.as/benchmark-of-python-web-servers>`_)
show ``gevent`` performance to be among the best.

See also:

* `Simple Websocket echo client/server with Flask and gevent / gevent-websocket <https://gist.github.com/lrvick/1185629>`_. The
  code is slightly out of date (``ws.wait()`` is no longer named that, e.g.), but was
  very helpful.

* `Building Web Applications with Gevent's WSGI Server <http://blog.pythonisito.com/2012/08/building-web-applications-with-gevents.html>`_

Installation and Use
====================

For **Mac OS X**, installing gevent and geventwebsocket from PyPI works
great.::

    hg clone https://jeunice@bitbucket.org/jeunice/flask-ws-example
    cd flask-ws-example
    sudo pip install -r requirements.txt
    python serve.py

For **Ubuntu Linux** you can try that strategy, but the version of
``gevent`` on PyPI hasn't historically installed nicely, requiring
a lower-level procedure that installs the development version of
``gevent`` and a bunch of related dependencies. If the above doesn't
work for you, try::

    sudo apt-get install -y gcc python-pip git mercurial libev4 libev-dev libpython-dev
    sudo pip install cython -e git://github.com/surfly/gevent.git@1.2.1#egg=gevent
    sudo pip install gevent-websocket flask
    hg clone https://jeunice@bitbucket.org/jeunice/flask-ws-example
    cd flask-ws-example
    sudo python serve.py

Notes
=====

*  This early-2017 thrid release freshens documentation and dependencies, and
   makes some code cleanups.

*  Server support for async operations in Python remains...evolving. Python 3
   is theoretically much better at async, the same cannot be said for the interconnected
   web of supporting modules. ``gevent`` theoretically supported Python 3 since
   2015. But even in mid-2016 and early 2017, issues such as
   `this one <https://github.com/miguelgrinberg/Flask-SocketIO/issues/272>`_
   ccontinue to be stoppers. Python 3-based Flask / WebSocket servers are possible,
   but apparently still not with the combination of modules on which
   this example relies. *Sigh.* Resulting practical recommendation: Stick to
   Python 2.7 for serving for now.

*  The file ``serve2.py`` is an alterate approach using the `Flask-Sockets
   <https://pypi.python.org/pypi/Flask-Sockets>`_ package. It slightly improves
   the API, but does nothing to fix Python 3's lagging support. 

*  The second release provides some nicer styling and shows a slightly enhanced
   UI (reporting how long it's been since the last update).

*  This is in no way an sterling example of all things webapp. It uses
   CSS directly, rather than LESS or SCSS. It uses no template engine or update
   framework for JS code. Updates double-bang, first with a Web socket "data is
   ready" and then a following HTTP request on ``/data``. It displays times to the \
   user in UTC, not local time. *Et cetera.*

   Adding those things would make this a more sophisticated and complete webapp
   example, but it would also arguably complicate understanding of the basics
   of getting the WebSocket connection working. I've tried to strike a balance
   between "enough to be interesting" and "too much to comprehend in one go."

*  A version of this that uses WebSocket for both updates and data transmission
   should be forthcoming.

*  The author, `Jonathan Eunice <mailto:jonathan.eunice@gmail.com>`_ or
   `@jeunice on Twitter <http://twitter.com/jeunice>`_
   welcomes your comments and suggestions.
