from django.contrib import admin

from .models import TusdFileShare, TusdFile

# Register your models here.
admin.site.register(TusdFileShare)
admin.site.register(TusdFile)
