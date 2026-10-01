"""Local static preview server; explicit JS MIME avoids Windows registry mappings."""
import argparse
import socket
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewHandler(SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_request(self, code='-', size='-'):
        # A long-lived preview can serve thousands of module requests. Avoid
        # blocking worker threads on an undrained terminal pipe for every 200.
        # Keep error responses available for diagnostics.
        if str(code).isdigit() and int(code) >= 400:
            super().log_request(code, size)

    def end_headers(self):
        # Local iterative preview must not retain stale HTML/CSS/module revisions.
        if self.path.split('?', 1)[0].endswith(('/', '.html', '.css', '.js', '.mjs')):
            self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.mjs': 'text/javascript',
        '.js': 'text/javascript',
        '.css': 'text/css',
    }


class PreviewServer(ThreadingHTTPServer):
    # A module graph opens many local connections at once. The Windows default
    # accept backlog (5) can refuse bursts and leave the entire module unexecuted.
    request_queue_size = 128

    def server_bind(self):
        # Windows SO_REUSEADDR permits two servers to own the same localhost
        # port; requests then reach either process unpredictably.
        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
            self.allow_reuse_address = False
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8766)
    args = parser.parse_args()
    docs = Path(__file__).resolve().parents[1] / 'docs'
    server = PreviewServer(('127.0.0.1', args.port), partial(PreviewHandler, directory=str(docs)))
    print(f'Preview: http://127.0.0.1:{args.port}/flows/auth-session/', flush=True)
    server.serve_forever()
