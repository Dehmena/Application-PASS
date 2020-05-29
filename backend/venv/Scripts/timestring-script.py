#!"D:\Users\Baptiste\Documents\Perso\Cours\Master\Projet Girbau\projetgirbau\backend\venv\Scripts\python.exe"
# EASY-INSTALL-ENTRY-SCRIPT: 'timestring==1.6.4','console_scripts','timestring'
__requires__ = 'timestring==1.6.4'
import re
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])
    sys.exit(
        load_entry_point('timestring==1.6.4', 'console_scripts', 'timestring')()
    )
