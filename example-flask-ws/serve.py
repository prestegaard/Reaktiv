#!/usr/bin/env python

from __future__ import print_function
import sys

from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
import gevent

from flask import Flask, jsonify, request, render_template, send_from_directory
import time
import threading
import random
import webbrowser
import os
import platform

start_local_browser = platform.system() == 'Darwin'

app = Flask(__name__)

PORT = 5000
MIN_DELAY, MAX_DELAY = 1, 1

time_status = {
    'available': "%H:%M:%S",
    'occupied': "%a, %d %b %Y %H:%M:%S",
    'other': "%a, %H:%M",
}


@app.route("/data", methods=['GET'])
def data():
    """
    Provides the server's current timestamp, formatted in several different
    ways, across a WebSocket connection. NB While other Python JSON emitters
    will directly encode arrays and other data types, Flask.jsonify() appears to
    require a dict.
    """

    fmt    = request.args.get('status', 'best')  # gets query parameter here; default 'best'

    now    = time.time()
    nowstr = time.strftime(time_status[fmt])

    info = { 'value':    now,
             'contents': "Time and date is now <b>{0}</b>".format(nowstr, fmt),
             'status':   fmt
            }
    return jsonify(info)




@app.route("/updated")
def updated():
    """
    Notify the client that an update is ready. Contacted by the client to
    'subscribe' to the notification service.
    """
    ws = request.environ.get('wsgi.websocket')
    print("web socket retrieved")
    if ws:
        while True:
            delay = random.randint(MIN_DELAY, MAX_DELAY)
            gevent.sleep(delay)
            ws.send('ready')
    else:
        raise RuntimeError("Environment lacks WSGI WebSocket support")


@app.route('/favicon.ico')
def favicon():
    """
    Return the favicon from static.
    """
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.route("/")
def main():
    """
    Main web site entry point.
    """
    return render_template("index.html", port=PORT)


if __name__ == "__main__":

    if start_local_browser:
        # start server and web page pointing to it
        url = "http://127.0.0.1:{}".format(PORT)
        wb = webbrowser.get(None)  # instead of None, can be "firefox" etc
        threading.Timer(1.25, lambda: wb.open(url)).start()

    http_server = WSGIServer(('', PORT), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
    # app.run(port=PORT, debug=False)
