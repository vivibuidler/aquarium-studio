"""Local-only static application and read-only source document server."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote,urlsplit
import argparse,threading,webbrowser,urllib.request
ROOT=Path(__file__).resolve().parent
REFERENCES=ROOT/'references'
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def translate_path(self,path):
  route=unquote(urlsplit(path).path)
  if route.startswith('/references/'):
   target=(REFERENCES/route[len('/references/'):]).resolve()
   if target.is_relative_to(REFERENCES.resolve()) and target.suffix in {'.md','.json','.pdf'}:return str(target)
   return str(ROOT/'missing')
  return super().translate_path(path)
 def end_headers(self):
  self.send_header('Cache-Control','no-cache');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
 def log_message(self,fmt,*args):
  if '404' in str(args):super().log_message(fmt,*args)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8765);p.add_argument('--open',action='store_true');args=p.parse_args()
 url=f'http://127.0.0.1:{args.port}'
 try:server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
 except OSError:
  if args.open:
   try:
    with urllib.request.urlopen(url,timeout=2) as response:existing=response.read(4096).decode()
    if 'Aquarium Studio' in existing:webbrowser.open(url);raise SystemExit(0)
   except (OSError,UnicodeError):pass
  raise SystemExit(f'Port {args.port} is occupied. Try --port 8770.')
 print(f'Aquarium Studio: {url} (Ctrl+C to stop)',flush=True)
 if args.open:threading.Timer(.5,lambda:webbrowser.open(url)).start()
 server.serve_forever()
