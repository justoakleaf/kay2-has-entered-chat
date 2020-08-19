SCRIPT_PATH = r'script.txt'
TIMINGS_PATH = r'timings.txt'
HTML_LINES_PATH = r'htmllines.txt'

import html

with open(SCRIPT_PATH, 'rb') as fh:
    tmplines = fh.read()

with open(TIMINGS_PATH) as fh:
    timinglines = fh.readlines()

tmplines = tmplines.decode('utf-8').replace('’', "'").replace('“', '"').replace("”", '"')
scriptlines = tmplines.splitlines()

htmllines = []

for i, line in enumerate(scriptlines):
    cleanline = line.strip()

    if len(cleanline) < 1:
        # skip empty lines
        continue

    typeStart = 0
    user = ''
    if cleanline.startswith('>'):
        # K2 command
        typeStart = 3
        lineType = 'K2cmd'
        if len(cleanline) < 3 or not cleanline[2] == ' ':
            cleanline = '>> '+cleanline[2:]

        prompt = '>>'
    elif cleanline.startswith('.'):
        typeStart = 2
        lineType = 'K2cmd'
        prompt = '..'
    elif cleanline.startswith(':'):
        lineType = 'DCctrl'
        prompt = "Kay2 >"
    else:
        # message line
        lineType = 'msg'
        msg = cleanline.split(':',1)
        if msg[0] == '3POh':
            spanclass = 'TPOh'
        else:
            spanclass=msg[0]
        user = f'<div><span class="username {spanclass}">{msg[0]}</span></div>'
        cleanline = msg[1].strip()
        prompt = "Kay2 >"



    linedata = html.escape(cleanline).replace('  ', '&nbsp;')

    divAttrs = f'id="msg{i}" class="message-container" data-class="{lineType}" data-timing="{timinglines[i].strip()}" data-type-start="{typeStart}" data-prompt="{prompt}"'

    htmlline = f'<div {divAttrs}><div class="message-space">{user}<div>{linedata}</div></div></div>\n'

    htmllines.append(htmlline)

with open(HTML_LINES_PATH, 'w+') as fh:
    fh.writelines(htmllines)
