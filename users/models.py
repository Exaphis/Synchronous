import random

import coolname
from django.db import models
from colorfield.fields import ColorField
from workspaces.models import Workspace


colors = {
    'aqua': '#00ffff',
    'azure': '#f0ffff',
    'beige': '#f5f5dc',
    'black': '#000000',
    'blue': '#0000ff',
    'brown': '#a52a2a',
    'cyan': '#00ffff',
    'darkblue': '#00008b',
    'darkcyan': '#008b8b',
    'darkgrey': '#a9a9a9',
    'darkgreen': '#006400',
    'darkkhaki': '#bdb76b',
    'darkmagenta': '#8b008b',
    'darkolivegreen': '#556b2f',
    'darkorange': '#ff8c00',
    'darkorchid': '#9932cc',
    'darkred': '#8b0000',
    'darksalmon': '#e9967a',
    'darkviolet': '#9400d3',
    'fuchsia': '#ff00ff',
    'gold': '#ffd700',
    'green': '#008000',
    'indigo': '#4b0082',
    'khaki': '#f0e68c',
    'lightblue': '#add8e6',
    'lightcyan': '#e0ffff',
    'lightgreen': '#90ee90',
    'lightgrey': '#d3d3d3',
    'lightpink': '#ffb6c1',
    'lightyellow': '#ffffe0',
    'lime': '#00ff00',
    'magenta': '#ff00ff',
    'maroon': '#800000',
    'navy': '#000080',
    'olive': '#808000',
    'orange': '#ffa500',
    'pink': '#ffc0cb',
    'purple': '#800080',
    'violet': '#800080',
    'red': '#ff0000',
    'silver': '#c0c0c0',
    'white': '#ffffff',
    'yellow': '#ffff00'
}


def get_random_color():
    return random.choice(list(colors.values()))


def get_random_nickname():
    return ''.join(word.capitalize() for word in coolname.generate(2))


def get_random_unique_nickname():
    base_nickname = get_random_nickname()
    unique_nickname = base_nickname

    num_tries = 1
    while WorkspaceUser.objects.filter(nickname=unique_nickname).exists():
        unique_nickname = f'{base_nickname}{num_tries}'
        num_tries += 1

    return unique_nickname


class WorkspaceUser(models.Model):
    nickname = models.CharField(max_length=150, default=get_random_unique_nickname, unique=True)
    color = ColorField(default=get_random_color)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    active = models.BooleanField(default=True)
    went_inactive_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nickname
