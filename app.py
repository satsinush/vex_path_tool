from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser

httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)

webbrowser.open_new("http://localhost:8000/")

httpd.serve_forever()