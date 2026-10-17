from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlsplit
from pathlib import Path
import json

ROOT=str(Path(__file__).resolve().parent / 'web' / 'public')
USER={'id':'100000000000000001','username':'Preview User','global_name':'Preview User','avatar':None}
GUILDS=[{'id':str(100000000000000010+i),'name':name,'owner':i==0,'botPresent':True,'botPresenceKnown':True,'permissions':'8','memberCount':size,'members':size,'channels':[],'roles':[],'icon':None} for i,(name,size) in enumerate([('Soezy Community',1248),('Creative Studio',356),('Friends Lounge',82)])]
for g in GUILDS:
    g.update({'risk':'Low','stats':{'members':g['members'],'channels':12,'modules':4,'securityScore':92},'modules':{'antinuke':True,'automod':True,'logging':True,'welcome':False}})
CONFIGS={g['id']:{'prefix':'!','antinuke':{'enabled':True,'events':{},'punishment':'ban'},'automod':{'enabled':True},'welcome':{'enabled':False},'logging':{'enabled':True},'music':{'enabled':True},'verification':{'enabled':False}} for g in GUILDS}
# Demo security schema consumed by the existing dashboard controls.
FEATURES=[
 ('Channels','antichannelcreate','Channel Create'),('Channels','antichanneldelete','Channel Delete'),('Channels','antichannelupdate','Channel Update'),
 ('Roles','antirolecreate','Role Create'),('Roles','antiroledelete','Role Delete'),('Roles','antiroleupdate','Role Update'),
 ('Webhooks','antiwebhookcreate','Webhook Create'),('Webhooks','antiwebhookdelete','Webhook Delete'),('Webhooks','antiwebhookupdate','Webhook Update'),
 ('Members','antiban','Member Ban'),('Members','antikick','Member Kick'),('Members','antibot','Bot Add'),
 ('Server','antiguildupdate','Server Update'),('Server','antiautomod','AutoMod Update'),
 ('Expressions','antiemojicreate','Emoji Create'),('Expressions','antiemojidelete','Emoji Delete'),('Expressions','antiemojiupdate','Emoji Update'),
 ('Expressions','antistickercreate','Sticker Create'),('Expressions','antistickerdelete','Sticker Delete'),('Expressions','antistickerupdate','Sticker Update')]
for cfg in CONFIGS.values():
    cfg['antinuke'].update({'systemEnabled':True,'timeWindow':10000,'featureSettings':{}})
    schema=[]
    for group,key,label in FEATURES:
        base='antinuke.featureSettings.'+key
        cfg['antinuke']['events'][key]=True
        cfg['antinuke']['featureSettings'][key]={'limit':3,'punishment':'ban'}
        schema.append({'group':group,'label':label,'enabledPath':'antinuke.events.'+key,'enabled':True,'fields':[
            {'label':'Action limit','type':'number','path':base+'.limit','default':3,'min':1,'max':100,'step':1},
            {'label':'Punishment','type':'select','path':base+'.punishment','default':'ban','options':['ban','kick','strip']}]})
    cfg['securitySchema']={'antinuke':schema,'automod':[]}
EXTRA_FEATURES={
 'automod':[('Message Filters','spam','Anti-Spam'),('Message Filters','links','Anti-Link'),('Message Filters','invites','Discord Invites'),('Message Filters','mentions','Mass Mentions'),('Message Filters','caps','Excessive Capitals'),('Message Filters','emoji','Emoji Spam'),('Message Filters','badwords','Bad Words'),('Message Filters','duplicates','Duplicate Messages'),('Media Filters','attachments','Attachment Spam'),('Media Filters','stickers','Sticker Spam')],
 'whitelist':[('Whitelist Safety','changes','Whitelist Change Protection')],
 'security':[('Server Safety','raid','Join Raid Protection'),('Server Safety','unverified','Unverified Member Abuse'),('Server Safety','permissions','Permission Escalation')],
 'welcome':[('Welcome Abuse Protection','joins','Repeated Join / Leave')],
 'tickets':[('Ticket Abuse Protection','opens','Ticket Open Spam'),('Ticket Abuse Protection','mentions','Support Mention Spam')],
 'music':[('Music Abuse Protection','requests','Track Request Spam'),('Music Abuse Protection','skips','Skip Command Spam')],
 'customRoles':[('Role Abuse Protection','edits','Custom Role Edit Spam'),('Role Abuse Protection','names','Blocked Role Names')],
 'verification':[('Verification Abuse Protection','attempts','Failed Verification Attempts'),('Verification Abuse Protection','retries','Repeated Verification Requests')]}
for cfg in CONFIGS.values():
    for module,features in EXTRA_FEATURES.items():
        cfg.setdefault('previewGuards',{})[module]={}
        rows=[]
        for group,key,label in features:
            base='previewGuards.'+module+'.'+key
            cfg['previewGuards'][module][key]={'enabled':False,'limit':5,'windowSeconds':10,'punishment':'warn','timeoutSeconds':300}
            rows.append({'group':group,'label':label,'enabledPath':base+'.enabled','enabled':False,'fields':[
                {'label':'Action / attempt limit','type':'number','path':base+'.limit','default':5,'min':1,'max':1000},
                {'label':'Time window (seconds)','type':'number','path':base+'.windowSeconds','default':10,'min':1,'max':3600},
                {'label':'Timeout duration (seconds, timeout only)','type':'number','path':base+'.timeoutSeconds','default':300,'min':1,'max':2419200},
                {'label':'Punishment','type':'select','path':base+'.punishment','default':'warn','options':['warn','timeout','kick','ban','strip']}]})
        cfg['securitySchema'][module]=rows
STATUS={'ok':True,'online':True,'botUsername':'Soezy','guilds':3,'servers':3,'users':1686,'commands':120,'latency':42,'uptime':86400,'shards':1,'clusters':1,'bridgeState':'ONLINE','bridge':{'state':'ONLINE'}}
def payload(gid):
    return {'ok':True,'guild':next((g for g in GUILDS if g['id']==gid),GUILDS[0]),'config':CONFIGS.get(gid,CONFIGS[GUILDS[0]['id']]),'demo':True}
class Preview(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw): super().__init__(*a,directory=ROOT,**kw)
    def send_data(self,data,code=200,kind='application/json'):
        body=json.dumps(data).encode() if kind=='application/json' else data.encode()
        self.send_response(code); self.send_header('Content-Type',kind); self.send_header('Cache-Control','no-store'); self.end_headers(); self.wfile.write(body)
    def do_POST(self):
        path=urlsplit(self.path).path
        try: data=json.loads(self.rfile.read(int(self.headers.get('Content-Length',0))) or '{}')
        except Exception: return self.send_data({'ok':False,'error':'Invalid JSON'},400)
        if path=='/api/config/update':
            gid=data.get('guildId',GUILDS[0]['id'])
            if gid not in CONFIGS: return self.send_data({'ok':False,'error':'Unknown demo server'},404)
            for key,value in data.get('updates',{}).items():
                parts=key.split('.'); target=CONFIGS[gid]
                for part in parts[:-1]:
                    if not isinstance(target.get(part),dict): target[part]={}
                    target=target[part]
                target[parts[-1]]=value
            return self.send_data(payload(gid))
        if path=='/api/auth/logout': return self.send_data({'ok':True,'demo':True})
        self.send_data({'ok':False,'error':'Not available in demo'},400)
    def do_GET(self):
        path=urlsplit(self.path).path
        if path=='/assets/config.js': return self.send_data('window.SOEZY_CONFIG={apiOrigin:location.origin,socketOrigin:location.origin};',kind='application/javascript')
        if path=='/socket.io/socket.io.js': return self.send_data('window.io=()=>({connected:false,on(){return this},emit(){return this},removeAllListeners(){},disconnect(){}});',kind='application/javascript')
        if path=='/api/auth/discord':
            self.send_response(302); self.send_header('Location','/dashboard'); self.end_headers(); return
        if path.startswith('/api/') or path in ['/status','/health']:
            if path=='/api/auth/session': data={'ok':True,'authenticated':True,'user':USER,'csrfToken':'preview-only','demo':True}
            elif path=='/api/guilds': data={'ok':True,'guilds':GUILDS,'allGuilds':GUILDS,'summary':{'total':3,'owned':1,'withBot':3,'manageable':3},'bridgeState':'ONLINE','botPresenceKnown':True}
            elif path.endswith('/audit'): data={'ok':True,'logs':[],'entries':[],'audit':[]}
            elif path.startswith('/api/guilds/'): data=payload(path.split('/')[3])
            elif path=='/api/commands': data=json.loads((Path(__file__).resolve().parent / 'web' / 'preview' / 'commands.json').read_text())
            elif path=='/health': data={'ok':True,'system':{'online':True},'bot':STATUS,'bridge':{'state':'ONLINE'}}
            else: data=STATUS
            return self.send_data(data)
        routes={'/':'index.html','/docs':'docs.html','/premium':'premium.html','/status-page':'status.html','/login':'login.html','/dashboard':'dashboard-home.html','/dashboard/home':'dashboard-home.html'}
        file='commands.html' if path=='/commands' or (path.startswith('/dashboard/') and path.endswith('/commands')) else routes.get(path,'dashboard.html' if path.startswith('/dashboard/') else None)
        if file:
            html=(Path(ROOT)/file).read_text()
            banner='<div style="position:fixed;bottom:10px;left:50%;transform:translateX(-50%);z-index:9999;padding:8px 15px;border:1px solid #555;border-radius:12px;background:#151515f5;color:#eee;font:12px system-ui;text-align:center;max-width:90vw;width:max-content">DEMO PREVIEW · Sample data only · Settings reset on restart · <a style="color:white" href="/dashboard">Dashboard</a> · <a style="color:white" href="/commands">Commands</a></div>'
            html=html.replace('</body>',banner+'<a href="/commands" style="position:fixed;right:16px;bottom:70px;z-index:10000;background:#eee;color:#111;border:1px solid #fff;border-radius:12px;padding:12px 18px;font:600 14px system-ui;box-shadow:0 4px 20px #0008">View all 321 commands →</a></body>')
            if file=='login.html': html=html.replace('Login with Discord','Preview dashboard').replace('href="/api/auth/discord"','href="/dashboard"')
            return self.send_data(html,kind='text/html; charset=utf-8')
        super().do_GET()
ThreadingHTTPServer(('0.0.0.0',3000),Preview).serve_forever()
