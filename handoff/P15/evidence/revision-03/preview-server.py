from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.mjs':'text/javascript','.js':'text/javascript'}
    def log_message(self,*args): pass
ThreadingHTTPServer(('127.0.0.1',8780),partial(Handler,directory='docs')).serve_forever()
